import { Router, Request, Response } from 'express';
import { Campaign, Influencer, Donation, Donor } from '../models';

const router = Router();

// GET /api/campaigns - List all campaigns
router.get('/', async (req: Request, res: Response) => {
  const { influencerId, status } = req.query;
  const where: Record<string, unknown> = {};
  
  if (influencerId) where.influencerId = influencerId;
  if (status) where.status = status;

  const campaigns = await Campaign.findAll({
    where,
    include: [
      { model: Influencer, as: 'influencer' },
      { model: Donation, as: 'donations', include: [{ model: Donor, as: 'donor' }] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(campaigns);
});

// POST /api/campaigns - Create campaign
router.post('/', async (req: Request, res: Response) => {
  const { influencerId, title, description, goalAmount } = req.body;
  const campaign = await Campaign.create({ influencerId, title, description, goalAmount });
  res.status(201).json(campaign);
});

// GET /api/campaigns/:id - Get single campaign
router.get('/:id', async (req: Request, res: Response) => {
  const campaign = await Campaign.findByPk(req.params.id, {
    include: [
      { model: Influencer, as: 'influencer' },
      { model: Donation, as: 'donations', include: [{ model: Donor, as: 'donor' }] },
    ],
  });
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  res.json(campaign);
});

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', async (req: Request, res: Response) => {
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  const { title, description, goalAmount, status } = req.body;
  await campaign.update({ title, description, goalAmount, status });
  res.json(campaign);
});

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', async (req: Request, res: Response) => {
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  await campaign.destroy();
  res.status(204).send();
});

export default router;
