import bcrypt from "bcrypt";
import type { Request } from "express";

import prisma from "../../config/prisma.js";
import { authConfig } from "../../config/auth.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { hashToken } from "../../utils/hash.js";
import type {
  LoginInput,
  RegisterInput,
} from "./auth.schema.js";

const BCRYPT_ROUNDS = 12;

function getRefreshTokenExpiration(): Date {
  const date = new Date();

  date.setDate(date.getDate() + 30);

  return date;
}

export async function register(
  input: RegisterInput,
  request: Request,
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("E-mail já cadastrado.");
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    BCRYPT_ROUNDS,
  );

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: request.get("user-agent") ?? null,
      ipAddress: request.ip ?? null,
      expiresAt: getRefreshTokenExpiration(),
    },
  });

  const accessToken = generateAccessToken(user.id);

  const refreshToken = generateRefreshToken(
    user.id,
    session.id,
  );

  await prisma.refreshToken.create({
    data: {
      sessionId: session.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiration(),
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export async function login(
  input: LoginInput,
  request: Request,
) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: request.get("user-agent") ?? null,
      ipAddress: request.ip ?? null,
      expiresAt: getRefreshTokenExpiration(),
    },
  });

  const accessToken = generateAccessToken(user.id);

  const refreshToken = generateRefreshToken(
    user.id,
    session.id,
  );

  await prisma.refreshToken.create({
    data: {
      sessionId: session.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiration(),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
}

export const cookieNames = {
  access: authConfig.accessToken.cookieName,
  refresh: authConfig.refreshToken.cookieName,
};

export async function refresh(
  refreshToken: string,
) {
  const payload = verifyRefreshToken(refreshToken);

  const storedToken =
    await prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashToken(refreshToken),
      },
      include: {
        session: true,
      },
    });

  if (!storedToken) {
    throw new Error("Refresh token inválido.");
  }

  if (storedToken.revokedAt) {
    throw new Error("Sessão revogada.");
  }

  if (storedToken.expiresAt <= new Date()) {
    throw new Error("Refresh token expirado.");
  }

  if (storedToken.session.revokedAt) {
    throw new Error("Sessão revogada.");
  }

  if (storedToken.session.expiresAt <= new Date()) {
    throw new Error("Sessão expirada.");
  }

  if (storedToken.session.userId !== payload.sub) {
    throw new Error("Refresh token inválido.");
  }

  const accessToken = generateAccessToken(
    storedToken.session.userId,
  );

  return {
    accessToken,
  };
}

export async function logout(
  refreshToken: string,
) {
  const tokenHash = hashToken(refreshToken);

  const storedToken =
    await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });

  if (!storedToken) {
    return;
  }

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    }),

    prisma.session.update({
      where: {
        id: storedToken.sessionId,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);
}