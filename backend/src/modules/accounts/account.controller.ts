import type { Request, Response } from "express";

import {
  createAccountSchema,
  updateAccountSchema,
} from "./account.schema.js";
import * as accountService from "./account.service.js";

type AccountParams = {
  id: string;
};

export async function createAccount(
  request: Request,
  response: Response,
) {
  const data = createAccountSchema.parse(request.body);

  const account = await accountService.createAccount(
    request.userId,
    data,
  );

  return response.status(201).json({
    account,
  });
}

export async function listAccounts(
  request: Request,
  response: Response,
) {
  const accounts = await accountService.listAccounts(
    request.userId,
  );

  return response.status(200).json({
    accounts,
  });
}

export async function getAccount(
  request: Request<AccountParams>,
  response: Response,
) {
  const account = await accountService.findAccountById(
    request.userId,
    request.params.id,
  );

  if (!account) {
    return response.status(404).json({
      message: "Conta não encontrada.",
    });
  }

  return response.status(200).json({
    account,
  });
}

export async function updateAccount(
  request: Request<AccountParams>,
  response: Response,
) {
  const data = updateAccountSchema.parse(request.body);

  const account = await accountService.findAccountById(
    request.userId,
    request.params.id,
  );

  if (!account) {
    return response.status(404).json({
      message: "Conta não encontrada.",
    });
  }

  const updatedAccount = await accountService.updateAccount(
    request.userId,
    request.params.id,
    data,
  );

  return response.status(200).json({
    account: updatedAccount,
  });
}

export async function deleteAccount(
  request: Request<AccountParams>,
  response: Response,
) {
  const account = await accountService.findAccountById(
    request.userId,
    request.params.id,
  );

  if (!account) {
    return response.status(404).json({
      message: "Conta não encontrada.",
    });
  }

  await accountService.deactivateAccount(
    request.userId,
    request.params.id,
  );

  return response.status(204).send();
}