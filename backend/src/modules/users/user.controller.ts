import type { Request, Response } from "express";

import prisma from "../../config/prisma.js";
import { updateProfileSchema } from "./user.schema.js";
import * as userService from "./user.service.js";

export async function getProfile(
  request: Request,
  response: Response,
) {
  const user = await userService.findById(request.userId);

  if (!user) {
    return response.status(404).json({
      message: "Usuário não encontrado.",
    });
  }

  return response.status(200).json({
    user,
  });
}

export async function updateProfile(
  request: Request,
  response: Response,
) {
  const data = updateProfileSchema.parse(request.body);

  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser && existingUser.id !== request.userId) {
      return response.status(409).json({
        message: "Este e-mail já está em uso.",
      });
    }
  }

  const updateData: {
    name?: string;
    email?: string;
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  const user = await userService.updateProfile(
    request.userId,
    updateData,
  );

  return response.status(200).json({
    user,
  });
}