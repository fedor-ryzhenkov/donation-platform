import { Router, Request, Response } from 'express';
import { Donation, Donor, Campaign, Influencer } from '../models';
import { sequelize } from '../database';
import { requireAuth, requireRole } from '../auth/middleware';

const router = Router();

// GET /api/donations - List all donations
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { campaignId, donorId } = req.query;
  const where: Record<string, unknown> = {};

  const campaignIdNum = typeof campaignId === 'string' ? Number.parseInt(campaignId, 10) : NaN;
  const donorIdNum = typeof donorId === 'string' ? Number.parseInt(donorId, 10) : NaN;

  if (req.auth!.role === 'admin') {
    if (Number.isFinite(campaignIdNum)) where.campaignId = campaignIdNum;
    if (Number.isFinite(donorIdNum)) where.donorId = donorIdNum;
  } else if (req.auth!.role === 'donor') {
    // Donors can only see their own donations.
    where.donorId = req.auth!.subject;
    if (Number.isFinite(campaignIdNum)) where.campaignId = campaignIdNum;
  } else {
    // Influencers can only see donations to their campaigns.
    if (Number.isFinite(campaignIdNum)) where.campaignId = campaignIdNum;
  }

  const donations = await Donation.findAll({
    where,
    include: [
      { model: Donor, as: 'donor' },
      {
        model: Campaign,
        as: 'campaign',
        ...(req.auth!.role === 'influencer'
          ? {
              where: { influencerId: req.auth!.subject },
            }
          : {}),
        include: [{ model: Influencer, as: 'influencer' }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(donations);
});

// POST /api/donations - Create donation
router.post('/', requireAuth, async (req: Request, res: Response) => {
  if (req.auth!.role !== 'admin' && req.auth!.role !== 'donor') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { donorId, campaignId, amount, message } = req.body as {
    donorId?: unknown;
    campaignId?: unknown;
    amount?: unknown;
    message?: unknown;
  };

  if (typeof donorId !== 'number' || !Number.isFinite(donorId)) {
    res.status(400).json({ error: 'donorId is required' });
    return;
  }
  if (req.auth!.role === 'donor' && donorId !== req.auth!.subject) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (typeof campaignId !== 'number' || !Number.isFinite(campaignId)) {
    res.status(400).json({ error: 'campaignId is required' });
    return;
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    res.status(400).json({ error: 'amount is required' });
    return;
  }

  const result = await sequelize.transaction(async (t) => {
    const donation = await Donation.create(
      { donorId, campaignId, amount, message: typeof message === 'string' ? message : '' },
      { transaction: t }
    );

    // Update campaign's current amount
    await Campaign.increment('currentAmount', {
      by: amount,
      where: { id: campaignId },
      transaction: t,
    });

    return donation;
  });

  const donationWithRelations = await Donation.findByPk(result.id, {
    include: [
      { model: Donor, as: 'donor' },
      { model: Campaign, as: 'campaign' },
    ],
  });

  res.status(201).json(donationWithRelations);
});

// GET /api/donations/:id - Get single donation
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const donation = await Donation.findByPk(req.params.id, {
    include: [
      { model: Donor, as: 'donor' },
      { model: Campaign, as: 'campaign', include: [{ model: Influencer, as: 'influencer' }] },
    ],
  });
  if (!donation) {
    res.status(404).json({ error: 'Donation not found' });
    return;
  }
  const donationJson = donation.toJSON() as any;
  if (req.auth!.role === 'admin') {
    res.json(donation);
    return;
  }
  if (req.auth!.role === 'donor') {
    if (donation.donorId !== req.auth!.subject) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json(donation);
    return;
  }
  // influencer
  if (donationJson?.campaign?.influencerId !== req.auth!.subject) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  res.json(donation);
});

// DELETE /api/donations/:id - Delete donation
router.delete('/:id', requireRole('admin'), async (req: Request, res: Response) => {
  const donation = await Donation.findByPk(req.params.id);
  if (!donation) {
    res.status(404).json({ error: 'Donation not found' });
    return;
  }

  await sequelize.transaction(async (t) => {
    // Subtract donation amount from campaign
    await Campaign.decrement('currentAmount', {
      by: donation.amount,
      where: { id: donation.campaignId },
      transaction: t,
    });

    await donation.destroy({ transaction: t });
  });

  res.status(204).send();
});

export default router;
