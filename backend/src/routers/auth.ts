import { Router, Request, Response } from 'express';
import { Donor, Influencer } from '../models';
import { verifyPassword } from '../auth/password';

const router = Router();

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


