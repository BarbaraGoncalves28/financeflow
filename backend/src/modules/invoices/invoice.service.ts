import { Prisma } from "../../../generated/prisma/client.js";

import prisma from "../../config/prisma.js";

import type {
  CreateInvoiceInput,
  PayInvoiceInput,
  UpdateInvoiceInput,
} from "./invoice.schema.js";

const INVOICE_NOT_FOUND = "INVOICE_NOT_FOUND";
const CREDIT_CARD_NOT_FOUND = "CREDIT_CARD_NOT_FOUND";
const PAYMENT_ACCOUNT_NOT_FOUND = "PAYMENT_ACCOUNT_NOT_FOUND";
const INVALID_INVOICE_STATUS = "INVALID_INVOICE_STATUS";
const INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE";
const INVALID_PAYMENT_AMOUNT = "INVALID_PAYMENT_AMOUNT";
const INVOICE_ALREADY_PAID = "INVOICE_ALREADY_PAID";

export async function createInvoice(
  userId: string,
  data: CreateInvoiceInput,
) {
  const creditCard = await prisma.creditCard.findFirst({
    where: {
      id: data.creditCardId,
      userId,
    },
  });

  if (!creditCard) {
    throw new Error(CREDIT_CARD_NOT_FOUND);
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      creditCardId: data.creditCardId,
      referenceMonth: data.referenceMonth,
      referenceYear: data.referenceYear,
    },
  });

  if (existingInvoice) {
    throw new Error("INVOICE_ALREADY_EXISTS");
  }

  const closingDate = new Date(data.closingDate);
  const dueDate = new Date(data.dueDate);

  if (dueDate <= closingDate) {
    throw new Error("INVALID_INVOICE_DATES");
  }

  return prisma.invoice.create({
    data: {
      creditCardId: data.creditCardId,
      referenceMonth: data.referenceMonth,
      referenceYear: data.referenceYear,
      closingDate,
      dueDate,
      totalAmount: data.totalAmount ?? "0.00",
      paidAmount: "0.00",
      status: "OPEN",
    },
    include: {
      creditCard: true,
      items: true,
    },
  });
}

export async function listInvoices(
  userId: string,
  creditCardId: string,
) {
  const creditCard = await prisma.creditCard.findFirst({
    where: {
      id: creditCardId,
      userId,
    },
  });

  if (!creditCard) {
    throw new Error(CREDIT_CARD_NOT_FOUND);
  }

  return prisma.invoice.findMany({
    where: {
      creditCardId,
    },
    orderBy: [
      {
        referenceYear: "desc",
      },
      {
        referenceMonth: "desc",
      },
    ],
    include: {
      items: true,
      paymentAccount: {
        select: {
          id: true,
          name: true,
          bank: true,
          type: true,
        },
      },
    },
  });
}

export async function findInvoiceById(
  userId: string,
  invoiceId: string,
) {
  return prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      creditCard: {
        userId,
      },
    },
    include: {
      creditCard: true,
      paymentAccount: {
        select: {
          id: true,
          name: true,
          bank: true,
          type: true,
        },
      },
      items: {
        orderBy: {
          purchaseDate: "desc",
        },
        include: {
          category: true,
          transaction: true,
          installment: true,
        },
      },
    },
  });
}

export async function updateInvoice(
  userId: string,
  invoiceId: string,
  data: UpdateInvoiceInput,
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      creditCard: {
        userId,
      },
    },
  });

  if (!invoice) {
    throw new Error(INVOICE_NOT_FOUND);
  }

  if (invoice.status === "PAID") {
    throw new Error(INVOICE_ALREADY_PAID);
  }

  if (
    data.paidAmount !== undefined &&
    new Prisma.Decimal(data.paidAmount).gt(
      data.totalAmount !== undefined
        ? new Prisma.Decimal(data.totalAmount)
        : invoice.totalAmount,
    )
  ) {
    throw new Error(INVALID_PAYMENT_AMOUNT);
  }

const updateData: Prisma.InvoiceUpdateInput = {
  ...(data.status !== undefined && {
    status: data.status,
  }),

  ...(data.totalAmount !== undefined && {
    totalAmount: new Prisma.Decimal(data.totalAmount),
  }),

  ...(data.paidAmount !== undefined && {
    paidAmount: new Prisma.Decimal(data.paidAmount),
  }),
};

return prisma.invoice.update({
  where: {
    id: invoiceId,
  },
  data: updateData,
  include: {
    creditCard: true,
    items: true,
  },
});
}

export async function closeInvoice(
  userId: string,
  invoiceId: string,
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      creditCard: {
        userId,
      },
    },
  });

  if (!invoice) {
    throw new Error(INVOICE_NOT_FOUND);
  }

  if (invoice.status !== "OPEN") {
    throw new Error(INVALID_INVOICE_STATUS);
  }

  return prisma.invoice.update({
    where: {
      id: invoiceId,
    },
    data: {
      status: "CLOSED",
    },
    include: {
      creditCard: true,
      items: true,
    },
  });
}

export async function payInvoice(
  userId: string,
  invoiceId: string,
  data: PayInvoiceInput,
) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: {
        id: invoiceId,
        creditCard: {
          userId,
        },
      },
      include: {
        creditCard: true,
      },
    });

    if (!invoice) {
      throw new Error(INVOICE_NOT_FOUND);
    }

    if (invoice.status === "PAID") {
      throw new Error(INVOICE_ALREADY_PAID);
    }

    if (invoice.status === "OPEN") {
      throw new Error("INVOICE_MUST_BE_CLOSED");
    }

    const paymentAccount = await tx.account.findFirst({
      where: {
        id: data.paymentAccountId,
        userId,
        isActive: true,
      },
    });

    if (!paymentAccount) {
      throw new Error(PAYMENT_ACCOUNT_NOT_FOUND);
    }

    const totalAmount = invoice.totalAmount;

    const paidAmount = data.paidAmount
      ? new Prisma.Decimal(data.paidAmount)
      : totalAmount;

    if (paidAmount.lte(0) || paidAmount.gt(totalAmount)) {
      throw new Error(INVALID_PAYMENT_AMOUNT);
    }

    if (paymentAccount.currentBalance.lt(paidAmount)) {
      throw new Error(INSUFFICIENT_BALANCE);
    }

    const newAccountBalance =
      paymentAccount.currentBalance.minus(paidAmount);

    const newAvailableLimit =
      invoice.creditCard.availableLimit.plus(paidAmount);

    const updatedAccount = await tx.account.update({
      where: {
        id: paymentAccount.id,
      },
      data: {
        currentBalance: newAccountBalance,
      },
    });

    const updatedCreditCard = await tx.creditCard.update({
      where: {
        id: invoice.creditCardId,
      },
      data: {
        availableLimit: {
          increment: paidAmount,
        },
      },
    });

    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: "PAID",
        paidAmount,
        paidAt: new Date(),
        paymentAccountId: paymentAccount.id,
      },
      include: {
        creditCard: true,
        paymentAccount: {
          select: {
            id: true,
            name: true,
            bank: true,
            type: true,
          },
        },
        items: true,
      },
    });

    return {
      invoice: updatedInvoice,
      account: updatedAccount,
      creditCard: {
        ...updatedCreditCard,
        availableLimit: newAvailableLimit,
      },
    };
  });
}

export async function markInvoiceOverdue(
  userId: string,
  invoiceId: string,
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      creditCard: {
        userId,
      },
    },
  });

  if (!invoice) {
    throw new Error(INVOICE_NOT_FOUND);
  }

  if (
    invoice.status !== "CLOSED" ||
    invoice.dueDate >= new Date()
  ) {
    throw new Error("INVOICE_CANNOT_BE_OVERDUE");
  }

  return prisma.invoice.update({
    where: {
      id: invoiceId,
    },
    data: {
      status: "OVERDUE",
    },
    include: {
      creditCard: true,
    },
  });
}