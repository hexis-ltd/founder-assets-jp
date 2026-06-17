import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const VERSION = "scrypt-v1";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const derived = await deriveKey(password, salt);
  return [VERSION, salt, derived.toString("base64url")].join("$");
}

export async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  const parsed = parseEncodedHash(encoded);
  if (!parsed) return false;
  const derived = await deriveKey(password, parsed.salt);
  const expected = Buffer.from(parsed.hash, "base64url");
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}

async function deriveKey(password: string, salt: string): Promise<Buffer> {
  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return Buffer.isBuffer(key) ? key : Buffer.from(key);
}

function parseEncodedHash(
  encoded: string,
): { salt: string; hash: string } | null {
  const [version, salt, hash] = encoded.split("$");
  if (version !== VERSION || !salt || !hash) return null;
  return { salt, hash };
}
