import jwt from "jsonwebtoken";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} não configurado.`);
  }

  return value;
}

const accessSecret = getRequiredEnv(
  "JWT_ACCESS_SECRET",
);

const refreshSecret = getRequiredEnv(
  "JWT_REFRESH_SECRET",
);

export type AccessTokenPayload = {
  sub: string;
  type: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  sessionId: string;
  type: "refresh";
};

export function generateAccessToken(
  userId: string,
): string {
  return jwt.sign(
    {
      sub: userId,
      type: "access",
    },
    accessSecret,
    {
      expiresIn: "15m",
    },
  );
}

export function generateRefreshToken(
  userId: string,
  sessionId: string,
): string {
  return jwt.sign(
    {
      sub: userId,
      sessionId,
      type: "refresh",
    },
    refreshSecret,
    {
      expiresIn: "30d",
    },
  );
}

export function verifyAccessToken(
  token: string,
): AccessTokenPayload {
  const payload = jwt.verify(
    token,
    accessSecret,
  ) as jwt.JwtPayload;

  if (
    typeof payload.sub !== "string" ||
    payload.type !== "access"
  ) {
    throw new Error("Token de acesso inválido.");
  }

  return {
    sub: payload.sub,
    type: "access",
  };
}

export function verifyRefreshToken(
  token: string,
): RefreshTokenPayload {
  const payload = jwt.verify(
    token,
    refreshSecret,
  ) as jwt.JwtPayload;

  if (
    typeof payload.sub !== "string" ||
    typeof payload.sessionId !== "string" ||
    payload.type !== "refresh"
  ) {
    throw new Error("Refresh token inválido.");
  }

  return {
    sub: payload.sub,
    sessionId: payload.sessionId,
    type: "refresh",
  };
}
