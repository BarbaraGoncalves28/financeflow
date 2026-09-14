import type { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import { authConfig } from "../../config/auth.js";
import {
  loginSchema,
  registerSchema,
} from "./auth.schema.js";
import * as authService from "./auth.service.js";

function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
) {
  response.cookie(
    authService.cookieNames.access,
    accessToken,
    {
      ...authConfig.cookie,
      maxAge: 15 * 60 * 1000,
    },
  );

  response.cookie(
    authService.cookieNames.refresh,
    refreshToken,
    {
      ...authConfig.cookie,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  );
}

export async function register(
  request: Request,
  response: Response,
) {
  try {
    const input = registerSchema.parse(request.body);

    const result = await authService.register(
      input,
      request,
    );

    setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
    );

    return response.status(201).json({
      user: result.user,
    });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({
        message: error.message,
      });
    }

    return response.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function login(
  request: Request,
  response: Response,
) {
  try {
    const input = loginSchema.parse(request.body);

    const result = await authService.login(
      input,
      request,
    );

    setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
    );

    return response.status(200).json({
      user: result.user,
    });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(401).json({
        message: error.message,
      });
    }

    return response.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function me(
  request: Request,
  response: Response,
) {
  const authenticatedRequest =
    request as Request;

  const user = await prisma.user.findUnique({
    where: {
      id: authenticatedRequest.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return response.status(404).json({
      message: "Usuário não encontrado.",
    });
  }

  return response.status(200).json({
    user,
  });
}

export async function refresh(
  request: Request,
  response: Response,
) {
  const refreshToken = request.cookies[
    authConfig.refreshToken.cookieName
  ];

  if (!refreshToken) {
    return response.status(401).json({
      message: "Refresh token não encontrado.",
    });
  }

  try {
    const result = await authService.refresh(
      refreshToken,
    );

    response.cookie(
      authConfig.accessToken.cookieName,
      result.accessToken,
      {
        ...authConfig.cookie,
        maxAge: 15 * 60 * 1000,
      },
    );

    return response.status(200).json({
      message: "Token renovado.",
    });
  } catch {
    return response.status(401).json({
      message: "Sessão inválida ou expirada.",
    });
  }
}

export async function logout(
  request: Request,
  response: Response,
) {
  const refreshToken = request.cookies[
    authConfig.refreshToken.cookieName
  ];

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  response.clearCookie(
    authConfig.accessToken.cookieName,
    authConfig.cookie,
  );

  response.clearCookie(
    authConfig.refreshToken.cookieName,
    authConfig.cookie,
  );

  return response.status(204).send();
}