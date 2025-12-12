import { Router, Request, Response } from 'express';
import { Donor, Donation, Campaign } from '../models';
import { hashPassword } from '../auth/password';
import { signAuthToken } from '../auth/jwt';
import { getAuthSecret, requireRole, requireAuth } from '../auth/middleware';

const router = Router();
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// GET /api/donors - List all donors
router.get('/', requireRole('admin'), async (_req: Request, res: Response) => {
  const donors = await Donor.findAll({
    include: [{ model: Donation, as: 'donations', include: [{ model: Campaign, as: 'campaign' }] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(donors);
});

// POST /api/donors - Create donor
router.post('/', async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (typeof name !== 'string' || name.length === 0) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  if (typeof email !== 'string' || email.length === 0) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  if (typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }
  const { salt, hash } = hashPassword(password);
  const donor = await Donor.create({ name, email, passwordSalt: salt, passwordHash: hash });
  const token = signAuthToken({
    secret: getAuthSecret(),
    role: 'donor',
    subject: donor.id,
    ttlSeconds: TOKEN_TTL_SECONDS,
  });
  res.status(201).json({ ...donor.toJSON(), token });
});

// GET /api/donors/:id - Get single donor
router.get('/:id', async (req: Request, res: Response) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid donor id' });
    return;
  }
  if (req.auth.role !== 'admin' && !(req.auth.role === 'donor' && req.auth.subject === id)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

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
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid donor id' });
    return;
  }
  if (req.auth.role !== 'admin' && !(req.auth.role === 'donor' && req.auth.subject === id)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const donor = await Donor.findByPk(req.params.id);
  if (!donor) {
    res.status(404).json({ error: 'Donor not found' });
    return;
  }
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (typeof password === 'string' && password.length > 0) {
    const { salt, hash } = hashPassword(password);
    await donor.update({ name, email, passwordSalt: salt, passwordHash: hash });
  } else {
    await donor.update({ name, email });
  }
  res.json(donor);
});

// DELETE /api/donors/:id - Delete donor
router.delete('/:id', requireRole('admin'), async (req: Request, res: Response) => {
  const donor = await Donor.findByPk(req.params.id);
  if (!donor) {
    res.status(404).json({ error: 'Donor not found' });
    return;
  }
  await donor.destroy();
  res.status(204).send();
});

export default router;
