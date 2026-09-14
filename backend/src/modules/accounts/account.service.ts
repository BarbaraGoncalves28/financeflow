import { Prisma } from "../../../generated/prisma/client.js";

import prisma from "../../config/prisma.js";

import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "./account.schema.js";

export async function createAccount(
  userId: string,
  data: CreateAccountInput,
) {
  const initialBalance = new Prisma.Decimal(data.initialBalance);

  return prisma.account.create({
    data: {
      userId,
      name: data.name,
      bank: data.bank ?? null,
      type: data.type,
      color: data.color ?? null,
      icon: data.icon ?? null,
      initialBalance,
      currentBalance: initialBalance,
    },
    select: {
      id: true,
      name: true,
      bank: true,
      type: true,
      color: true,
      icon: true,
      initialBalance: true,
      currentBalance: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function listAccounts(userId: string) {
  return prisma.account.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: [
      {
        name: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      name: true,
      bank: true,
      type: true,
      color: true,
      icon: true,
      initialBalance: true,
      currentBalance: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findAccountById(
  userId: string,
  accountId: string,
) {
  return prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      name: true,
      bank: true,
      type: true,
      color: true,
      icon: true,
      initialBalance: true,
      currentBalance: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateAccount(
  userId: string,
  accountId: string,
  data: UpdateAccountInput,
) {
  const updateData: Prisma.AccountUpdateManyMutationInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.bank !== undefined) {
    updateData.bank = data.bank;
  }

  if (data.type !== undefined) {
    updateData.type = data.type;
  }

  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  if (data.icon !== undefined) {
    updateData.icon = data.icon;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  return prisma.account.updateMany({
    where: {
      id: accountId,
      userId,
    },
    data: updateData,
  });
}

export async function deactivateAccount(
  userId: string,
  accountId: string,
) {
  return prisma.account.updateMany({
    where: {
      id: accountId,
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
}