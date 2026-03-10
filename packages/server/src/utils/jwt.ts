import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string; // user id
  role: string; // user role
  did?: string; // device id
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as SignOptions["expiresIn"],
    algorithm: "HS256",
  };
  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET as Secret, {
    algorithms: ["HS256"],
  }) as AccessTokenPayload;
}
