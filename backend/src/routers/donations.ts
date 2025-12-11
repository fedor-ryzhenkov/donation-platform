import { Router, Request, Response } from 'express';
import { Donation, Donor, Campaign, Influencer } from '../models';
import { sequelize } from '../database';

const router = Router();

// GET /api/donations - List all donations
router.get('/', async (req: Request, res: Response) => {
  const { campaignId, donorId } = req.query;
  const where: Record<string, unknown> = {};
  
  if (campaignId) where.campaignId = campaignId;
  if (donorId) where.donorId = donorId;

  const donations = await Donation.findAll({
    where,
    include: [
      { model: Donor, as: 'donor' },
      { model: Campaign, as: 'campaign', include: [{ model: Influencer, as: 'influencer' }] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(donations);
});

// POST /api/donations - Create donation
router.post('/', async (req: Request, res: Response) => {
  const { donorId, campaignId, amount, message } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const donation = await Donation.create(
      { donorId, campaignId, amount, message },
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
router.get('/:id', async (req: Request, res: Response) => {
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
  res.json(donation);
});

// DELETE /api/donations/:id - Delete donation
router.delete('/:id', async (req: Request, res: Response) => {
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
