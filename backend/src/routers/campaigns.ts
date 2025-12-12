import { Router, Request, Response } from 'express';
import { Campaign, Influencer, Donation, Donor } from '../models';

const router = Router();

// GET /api/campaigns - List all campaigns
router.get('/', async (req: Request, res: Response) => {
  const { status } = req.query;
  const where: Record<string, unknown> = {};

  if (status) where.status = status;

  const campaigns = await Campaign.findAll({
    where,
    include: [
      // NEW: include collaborators
      { model: Influencer, as: 'collaborators' },
      { model: Donation, as: 'donations', include: [{ model: Donor, as: 'donor' }] },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json(campaigns);
});

// POST /api/campaigns - Create campaign
router.post('/', async (req: Request, res: Response) => {
  const { title, description, goalAmount, collaboratorIds = [] } = req.body;

  const campaign = await Campaign.create({ title, description, goalAmount });

  if (Array.isArray(collaboratorIds) && collaboratorIds.length > 0) {
    await campaign.setCollaborators(collaboratorIds);
  }

  const campaignWithRelations = await Campaign.findByPk(campaign.id, {
    include: [{ model: Influencer, as: 'collaborators' }],
  });

  res.status(201).json(campaignWithRelations);
});

// GET /api/campaigns/:id - Get single campaign
router.get('/:id', async (req: Request, res: Response) => {
  const campaign = await Campaign.findByPk(req.params.id, {
    include: [
      { model: Influencer, as: 'collaborators' },
      { model: Donation, as: 'donations', include: [{ model: Donor, as: 'donor' }] },
    ],
  });

  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  res.json(campaign);
});

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', async (req: Request, res: Response) => {
  const campaign = await Campaign.findByPk(req.params.id);

  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const {
    title,
    description,
    goalAmount,
    status,
    collaboratorIds,
  } = req.body;

  await campaign.update({ title, description, goalAmount, status });

  if (Array.isArray(collaboratorIds)) {
    await campaign.setCollaborators(collaboratorIds);
  }

  const updated = await Campaign.findByPk(req.params.id, {
    include: [{ model: Influencer, as: 'collaborators' }],
  });

  res.json(updated);
});

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', async (req: Request, res: Response) => {
  const campaign = await Campaign.findByPk(req.params.id);

  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  await campaign.destroy();
  res.status(204).send();
});

export default router;
