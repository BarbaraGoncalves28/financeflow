import type { NextFunction, Request, Response } from "express";

import { authConfig } from "../config/auth.js";
import { verifyAccessToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = request.cookies[
    authConfig.accessToken.cookieName
  ];

  if (!token) {
    return response.status(401).json({
      message: "Não autenticado.",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== "access" || !payload.sub) {
      return response.status(401).json({
        message: "Token inválido.",
      });
    }

    request.userId = payload.sub;

    return next();
  } catch {
    return response.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
}