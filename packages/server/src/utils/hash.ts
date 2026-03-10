import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (hash === "OAUTH_ONLY") return false;
  return bcrypt.compare(password, hash);
}

/** SHA-256 hash for refresh tokens */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Generate a cryptographically random hex token (64 bytes = 128 hex chars) */
export function generateRefreshToken(): string {
  return randomBytes(64).toString("hex");
}

/** SHA-256 content hash for embedding change detection */
export function contentHash(content: string): string {
  return sha256(content);
}
