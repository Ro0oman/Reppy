/**
 * Symmetric encryption for Hevy API keys stored at rest.
 * AES-256-GCM with a key derived from HEVY_ENCRYPTION_KEY (or JWT_SECRET as
 * fallback). Never store a Hevy key in plaintext.
 */
import crypto from 'crypto';

const SECRET = process.env.HEVY_ENCRYPTION_KEY || process.env.JWT_SECRET || 'reppy-hevy-dev-secret';
const KEY = crypto.createHash('sha256').update(String(SECRET)).digest(); // 32 bytes
const PREFIX = 'hvy1:'; // version tag so we can rotate later

export function encryptHevyKey(plaintext) {
  if (!plaintext) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptHevyKey(stored) {
  if (!stored) return null;
  // Backwards-compat: if it doesn't carry our prefix, assume it was plaintext.
  if (!stored.startsWith(PREFIX)) return stored;
  const raw = Buffer.from(stored.slice(PREFIX.length), 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
