import { Router, Request, Response } from 'express';
import { Donor, Influencer } from '../models';
import { verifyPassword } from '../auth/password';

const router = Router();

// POST /api/auth/donors/login - Login donor by email + password
router.post('/donors/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (typeof email !== 'string' || email.length === 0) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  if (typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const donor = await Donor.unscoped().findOne({ where: { email } });
  if (!donor) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const ok = verifyPassword(password, { salt: donor.passwordSalt, hash: donor.passwordHash });
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.json({ id: donor.id });
});

// POST /api/auth/influencers/login - Login influencer by name + password
router.post('/influencers/login', async (req: Request, res: Response) => {
  const { name, password } = req.body as { name?: string; password?: string };
  if (typeof name !== 'string' || name.length === 0) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  if (typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const influencers = await Influencer.unscoped().findAll({ where: { name }, limit: 2 });
  if (influencers.length === 0) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  if (influencers.length > 1) {
    res.status(409).json({ error: 'Multiple influencers share this name. Use a unique name.' });
    return;
  }

  const influencer = influencers[0];
  const ok = verifyPassword(password, { salt: influencer.passwordSalt, hash: influencer.passwordHash });
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.json({ id: influencer.id });
});

// POST /api/auth/admin - Verify admin password
router.post('/admin', async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  const expected = process.env.ADMIN_PASSWORD || 'admin';
  if (typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }
  if (password !== expected) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }
  res.status(204).send();
});

// POST /api/auth/influencers/:id - Verify influencer password
router.post('/influencers/:id', async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const influencer = await Influencer.unscoped().findByPk(req.params.id);
  if (!influencer) {
    res.status(404).json({ error: 'Influencer not found' });
    return;
  }

  const ok = verifyPassword(password, {
    salt: influencer.passwordSalt,
    hash: influencer.passwordHash,
  });
  if (!ok) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  res.status(204).send();
});

// POST /api/auth/donors/:id - Verify donor password
router.post('/donors/:id', async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const donor = await Donor.unscoped().findByPk(req.params.id);
  if (!donor) {
    res.status(404).json({ error: 'Donor not found' });
    return;
  }

  const ok = verifyPassword(password, {
    salt: donor.passwordSalt,
    hash: donor.passwordHash,
  });
  if (!ok) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  res.status(204).send();
});

export default router;


