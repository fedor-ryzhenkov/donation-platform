import crypto from 'crypto';

export type PasswordRecord = {
  salt: string;
  hash: string;
};

export function hashPassword(password: string): PasswordRecord {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, record: PasswordRecord): boolean {
  if (!record.salt || !record.hash) return false;
  const computed = crypto.scryptSync(password, record.salt, 64).toString('hex');
  const a = Buffer.from(record.hash, 'hex');
  const b = Buffer.from(computed, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}


