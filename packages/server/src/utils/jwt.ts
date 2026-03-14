import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string; // user id
  role: string; // user role
  did?: string; // device id
}

// System accounts that never expire (dev only)
const SYSTEM_EMAILS = new Set(["mock@askdorian.com", "test@askdorian.com"])

export function isSystemAccount(email: string): boolean {
  return SYSTEM_EMAILS.has(email)
}

export function signAccessToken(payload: AccessTokenPayload, email?: string): string {
  const isSystem = email ? isSystemAccount(email) : false
  const options: SignOptions = {
    expiresIn: isSystem
      ? "100y" // dev-only: system accounts never expire
      : (env.JWT_ACCESS_EXPIRES_IN as unknown as SignOptions["expiresIn"]),
    algorithm: "HS256",
  };
  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET as Secret, {
    algorithms: ["HS256"],
  }) as AccessTokenPayload;
}
