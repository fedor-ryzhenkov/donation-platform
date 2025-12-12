import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken, type AuthRole, type AuthTokenPayload } from './jwt';

export type RequestAuth = {
  role: AuthRole;
  subject: number;
  token: AuthTokenPayload;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: RequestAuth;
    }
  }
}

export function getAuthSecret(): string {
  // NOTE: we keep a dev default to match current project style (admin password also has a default).
  return process.env.JWT_SECRET || 'dev-secret';
}

export function attachAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') || req.header('Authorization');
  if (!header) {
    next();
    return;
  }

  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    next();
    return;
  }

  const token = m[1];
  try {
    const payload = verifyAuthToken(token, { secret: getAuthSecret() });
    const subject = Number.parseInt(payload.sub, 10);
    if (!Number.isFinite(subject)) throw new Error('Invalid token subject');
    req.auth = { role: payload.role, subject, token: payload };
  } catch {
    // Fail closed only at meaningful boundaries. This middleware is "optional";
    // protected routes should use requireAuth/requireRole.
    req.auth = undefined;
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

export function requireRole(...roles: AuthRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}


