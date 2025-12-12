import crypto from 'crypto';

export type AuthRole = 'admin' | 'donor' | 'influencer';

export type AuthTokenPayload = {
  sub: string; // string for JWT spec; we store numeric ids as strings
  role: AuthRole;
  iat: number; // seconds
  exp: number; // seconds
};

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlEncodeJson(obj: unknown): string {
  return base64UrlEncode(Buffer.from(JSON.stringify(obj), 'utf8'));
}

function base64UrlDecodeToBuffer(s: string): Buffer {
  const normalized = s.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLen);
  return Buffer.from(padded, 'base64');
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function hmacSha256(data: string, secret: string): string {
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  return base64UrlEncode(sig);
}

export type SignAuthTokenOptions = {
  secret: string;
  role: AuthRole;
  subject: number;
  ttlSeconds: number;
  nowSeconds?: number;
};

export function signAuthToken(opts: SignAuthTokenOptions): string {
  const now = opts.nowSeconds ?? Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' } as const;
  const payload: AuthTokenPayload = {
    sub: String(opts.subject),
    role: opts.role,
    iat: now,
    exp: now + opts.ttlSeconds,
  };

  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = hmacSha256(signingInput, opts.secret);
  return `${signingInput}.${signature}`;
}

export type VerifyAuthTokenOptions = {
  secret: string;
  nowSeconds?: number;
};

export function verifyAuthToken(token: string, opts: VerifyAuthTokenOptions): AuthTokenPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [encodedHeader, encodedPayload, signature] = parts;

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expected = hmacSha256(signingInput, opts.secret);
  if (!timingSafeEqualStrings(signature, expected)) throw new Error('Invalid token signature');

  const payloadJson = base64UrlDecodeToBuffer(encodedPayload).toString('utf8');
  const payload = JSON.parse(payloadJson) as Partial<AuthTokenPayload>;

  if (typeof payload.sub !== 'string' || payload.sub.length === 0) throw new Error('Invalid token subject');
  if (payload.role !== 'admin' && payload.role !== 'donor' && payload.role !== 'influencer') {
    throw new Error('Invalid token role');
  }
  if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') throw new Error('Invalid token timestamps');

  const now = opts.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (payload.exp <= now) throw new Error('Token expired');

  return payload as AuthTokenPayload;
}


