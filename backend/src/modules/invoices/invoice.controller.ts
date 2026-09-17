import type { Request, Response } from "express";

import {
  createInvoiceSchema,
  payInvoiceSchema,
  updateInvoiceSchema,
} from "./invoice.schema.js";

import * as invoiceService from "./invoice.service.js";

type AuthenticatedRequest = Request & {
  userId: string;
};

type InvoiceParams = {
  id: string;
};

type CreditCardInvoiceParams = {
  creditCardId: string;
};

export async function createInvoice(
  req: Request,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  const parsed = createInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const invoice = await invoiceService.createInvoice(
      authenticatedRequest.userId,
      parsed.data,
    );

    return res.status(201).json({
      invoice,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CREDIT_CARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Cartão não encontrado.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVOICE_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "Essa fatura já existe.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_INVOICE_DATES"
    ) {
      return res.status(400).json({
        message:
          "A data de vencimento deve ser posterior à data de fechamento.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao criar fatura.",
    });
  }
}

export async function listInvoices(
  req: Request<CreditCardInvoiceParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  try {
    const invoices = await invoiceService.listInvoices(
      authenticatedRequest.userId,
      req.params.creditCardId,
    );

    return res.status(200).json({
      invoices,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CREDIT_CARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Cartão não encontrado.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao listar faturas.",
    });
  }
}

export async function getInvoice(
  req: Request<InvoiceParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  const invoice = await invoiceService.findInvoiceById(
    authenticatedRequest.userId,
    req.params.id,
  );

  if (!invoice) {
    return res.status(404).json({
      message: "Fatura não encontrada.",
    });
  }

  return res.status(200).json({
    invoice,
  });
}

export async function updateInvoice(
  req: Request<InvoiceParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  const parsed = updateInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const invoice = await invoiceService.updateInvoice(
      authenticatedRequest.userId,
      req.params.id,
      parsed.data,
    );

    return res.status(200).json({
      invoice,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVOICE_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Fatura não encontrada.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVOICE_ALREADY_PAID"
    ) {
      return res.status(409).json({
        message: "A fatura já está paga.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_PAYMENT_AMOUNT"
    ) {
      return res.status(400).json({
        message: "O valor pago não pode ser maior que o valor da fatura.",
      });
    }

    return res.status(500).json({
      message: "Erro interno ao atualizar fatura.",
    });
  }
}

export async function closeInvoice(
  req: Request<InvoiceParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  try {
    const invoice = await invoiceService.closeInvoice(
      authenticatedRequest.userId,
      req.params.id,
    );

    return res.status(200).json({
      message: "Fatura fechada com sucesso.",
      invoice,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVOICE_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Fatura não encontrada.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_INVOICE_STATUS"
    ) {
      return res.status(409).json({
        message:
          "Somente faturas abertas podem ser fechadas.",
      });
    }

    return res.status(500).json({
      message: "Erro interno ao fechar fatura.",
    });
  }
}

export async function payInvoice(
  req: Request<InvoiceParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  const parsed = payInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const result = await invoiceService.payInvoice(
      authenticatedRequest.userId,
      req.params.id,
      parsed.data,
    );

    return res.status(200).json({
      message: "Fatura paga com sucesso.",
      ...result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVOICE_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Fatura não encontrada.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "PAYMENT_ACCOUNT_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Conta para pagamento não encontrada.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVOICE_ALREADY_PAID"
    ) {
      return res.status(409).json({
        message: "A fatura já está paga.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVOICE_MUST_BE_CLOSED"
    ) {
      return res.status(409).json({
        message:
          "A fatura precisa estar fechada antes de ser paga.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_PAYMENT_AMOUNT"
    ) {
      return res.status(400).json({
        message:
          "O valor do pagamento deve ser maior que zero e não pode ultrapassar o valor da fatura.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_BALANCE"
    ) {
      return res.status(400).json({
        message:
          "Saldo insuficiente na conta selecionada para pagar a fatura.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao pagar fatura.",
    });
  }
}

export async function markInvoiceOverdue(
  req: Request<InvoiceParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  try {
    const invoice = await invoiceService.markInvoiceOverdue(
      authenticatedRequest.userId,
      req.params.id,
    );

    return res.status(200).json({
      message: "Fatura marcada como atrasada.",
      invoice,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVOICE_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Fatura não encontrada.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVOICE_CANNOT_BE_OVERDUE"
    ) {
      return res.status(409).json({
        message:
          "A fatura não pode ser marcada como atrasada neste momento.",
      });
    }

    return res.status(500).json({
      message: "Erro interno ao atualizar fatura.",
    });
  }
}