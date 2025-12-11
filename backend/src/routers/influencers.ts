import { Router, Request, Response } from 'express';
import { Influencer, Campaign } from '../models';

const router = Router();

// GET /api/influencers - List all influencers
router.get('/', async (_req: Request, res: Response) => {
  const influencers = await Influencer.findAll({
    include: [{ model: Campaign, as: 'campaigns' }],
    order: [['createdAt', 'DESC']],
  });
  res.json(influencers);
});

// POST /api/influencers - Create influencer
router.post('/', async (req: Request, res: Response) => {
  const { name, bio, avatarUrl } = req.body;
  const influencer = await Influencer.create({ name, bio, avatarUrl });
  res.status(201).json(influencer);
});

// GET /api/influencers/:id - Get single influencer
router.get('/:id', async (req: Request, res: Response) => {
  const influencer = await Influencer.findByPk(req.params.id, {
    include: [{ model: Campaign, as: 'campaigns' }],
  });
  if (!influencer) {
    res.status(404).json({ error: 'Influencer not found' });
    return;
  }
  res.json(influencer);
});

// PUT /api/influencers/:id - Update influencer
router.put('/:id', async (req: Request, res: Response) => {
  const influencer = await Influencer.findByPk(req.params.id);
  if (!influencer) {
    res.status(404).json({ error: 'Influencer not found' });
    return;
  }
  const { name, bio, avatarUrl } = req.body;
  await influencer.update({ name, bio, avatarUrl });
  res.json(influencer);
});

// DELETE /api/influencers/:id - Delete influencer
router.delete('/:id', async (req: Request, res: Response) => {
  const influencer = await Influencer.findByPk(req.params.id);
  if (!influencer) {
    res.status(404).json({ error: 'Influencer not found' });
    return;
  }
  await influencer.destroy();
  res.status(204).send();
});

export default router;
