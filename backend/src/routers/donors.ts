import { Router, Request, Response } from 'express';
import { Donor, Donation, Campaign } from '../models';

const router = Router();

// GET /api/donors - List all donors
router.get('/', async (_req: Request, res: Response) => {
  const donors = await Donor.findAll({
    include: [{ model: Donation, as: 'donations', include: [{ model: Campaign, as: 'campaign' }] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(donors);
});

// POST /api/donors - Create donor
router.post('/', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const donor = await Donor.create({ name, email });
  res.status(201).json(donor);
});

// GET /api/donors/:id - Get single donor
router.get('/:id', async (req: Request, res: Response) => {
  const donor = await Donor.findByPk(req.params.id, {
    include: [{ model: Donation, as: 'donations', include: [{ model: Campaign, as: 'campaign' }] }],
  });
  if (!donor) {
    res.status(404).json({ error: 'Donor not found' });
    return;
  }
  res.json(donor);
});

// PUT /api/donors/:id - Update donor
router.put('/:id', async (req: Request, res: Response) => {
  const donor = await Donor.findByPk(req.params.id);
  if (!donor) {
    res.status(404).json({ error: 'Donor not found' });
    return;
  }
  const { name, email } = req.body;
  await donor.update({ name, email });
  res.json(donor);
});

// DELETE /api/donors/:id - Delete donor
router.delete('/:id', async (req: Request, res: Response) => {
  const donor = await Donor.findByPk(req.params.id);
  if (!donor) {
    res.status(404).json({ error: 'Donor not found' });
    return;
  }
  await donor.destroy();
  res.status(204).send();
});

export default router;
