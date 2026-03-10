import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../middleware/error-handler.js";
import { userRepo } from "../repositories/user-repo.js";
import { sessionRepo } from "../repositories/session-repo.js";
import { deviceRepo, type DeviceInfo } from "../repositories/device-repo.js";
import {
  hashPassword,
  verifyPassword,
  sha256,
  generateRefreshToken,
} from "../utils/hash.js";
import { signAccessToken } from "../utils/jwt.js";

const googleClient = new OAuth2Client();

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  tokens: AuthTokens;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl: string | null;
    locale: string;
    timezone: string;
  };
}

function sanitizeUser(user: Awaited<ReturnType<typeof userRepo.findById>>) {
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found");
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    locale: user.locale,
    timezone: user.timezone,
  };
}

async function createSession(
  userId: string,
  deviceId: string,
  ip?: string,
  userAgent?: string,
): Promise<AuthTokens> {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_DAYS);

  await sessionRepo.create({
    userId,
    deviceId,
    refreshTokenHash: sha256(refreshToken),
    ipAddress: ip,
    userAgent,
    expiresAt,
  });

  const accessToken = signAccessToken({
    sub: userId,
    role: (await userRepo.findById(userId))!.role,
    did: deviceId,
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(
    email: string,
    password: string,
    name: string,
    deviceInfo: DeviceInfo,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      throw new AppError(409, "EMAIL_EXISTS", "Email already registered");
    }

    if (password.length < 8) {
      throw new AppError(
        400,
        "WEAK_PASSWORD",
        "Password must be at least 8 characters",
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepo.create({ email, passwordHash, name });

    const device = await deviceRepo.upsert(user.id, deviceInfo);
    const tokens = await createSession(user.id, device.id, ip, userAgent);

    return { tokens, user: sanitizeUser(user) };
  },

  async login(
    email: string,
    password: string,
    deviceInfo: DeviceInfo,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const device = await deviceRepo.upsert(user.id, deviceInfo);

    // Revoke existing sessions on this device (single active session per device)
    await sessionRepo.revokeByDevice(user.id, device.id);

    const tokens = await createSession(user.id, device.id, ip, userAgent);
    return { tokens, user: sanitizeUser(user) };
  },

  async googleOAuth(
    idToken: string,
    deviceInfo: DeviceInfo,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    // Ensure Google OAuth is configured
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError(501, "GOOGLE_OAUTH_NOT_CONFIGURED", "Google OAuth is not configured");
    }

    // Verify the Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new AppError(401, "INVALID_GOOGLE_TOKEN", "Invalid Google ID token");
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new AppError(401, "INVALID_GOOGLE_TOKEN", "Google token missing required claims");
    }

    const { sub: googleSub, email, name, picture: avatarUrl } = payload;

    // Find by googleSub first, then by email
    let user = await userRepo.findByGoogleSub(googleSub);

    if (!user) {
      const byEmail = await userRepo.findByEmail(email);
      if (byEmail) {
        // Link Google account to existing user
        user = await userRepo.updateById(byEmail.id, {
          googleSub,
          avatarUrl: avatarUrl ?? byEmail.avatarUrl,
        });
      } else {
        // New user via Google
        user = await userRepo.create({
          email,
          passwordHash: "OAUTH_ONLY",
          name: name ?? email.split("@")[0],
          avatarUrl: avatarUrl ?? null,
          googleSub,
        });
      }
    }

    const safeUser = sanitizeUser(user);
    const device = await deviceRepo.upsert(safeUser.id, deviceInfo);
    await sessionRepo.revokeByDevice(safeUser.id, device.id);
    const tokens = await createSession(safeUser.id, device.id, ip, userAgent);

    return { tokens, user: safeUser };
  },

  async refresh(
    refreshToken: string,
    deviceId: string,
    ip?: string,
  ): Promise<AuthTokens> {
    const tokenHash = sha256(refreshToken);
    const session = await sessionRepo.findByTokenHash(tokenHash);

    if (!session) {
      // Reuse detection: if the token matches a previous (rotated-out) hash,
      // someone is replaying an old token → revoke ALL sessions for that user
      const reused = await sessionRepo.findByPreviousTokenHash(tokenHash);
      if (reused) {
        logger.warn(
          { userId: reused.userId, sessionId: reused.id },
          "Refresh token reuse detected — revoking all sessions",
        );
        await sessionRepo.revokeAllForUser(reused.userId);
      }
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid");
    }

    // Check expiry
    if (session.expiresAt < new Date()) {
      await sessionRepo.revoke(session.id);
      throw new AppError(401, "REFRESH_TOKEN_EXPIRED", "Refresh token has expired");
    }

    // Check device binding
    if (session.deviceId !== deviceId) {
      throw new AppError(
        401,
        "DEVICE_MISMATCH",
        "Refresh token does not match device",
      );
    }

    // Rotate
    const newRefreshToken = generateRefreshToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(
      newExpiresAt.getDate() + env.JWT_REFRESH_EXPIRES_DAYS,
    );

    const rotated = await sessionRepo.rotate(
      session.id,
      sha256(newRefreshToken),
      tokenHash,
      newExpiresAt,
      ip,
    );
    if (!rotated) {
      // Another concurrent request already rotated — reject this one
      throw new AppError(401, "TOKEN_ALREADY_ROTATED", "Refresh token was already used");
    }

    const user = await userRepo.findById(session.userId);
    const accessToken = signAccessToken({
      sub: session.userId,
      role: user!.role,
      did: deviceId,
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string, deviceId: string): Promise<void> {
    await sessionRepo.revokeByDevice(userId, deviceId);
  },

  async logoutAll(userId: string): Promise<void> {
    await sessionRepo.revokeAllForUser(userId);
  },
};
