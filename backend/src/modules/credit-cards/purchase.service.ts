import { Prisma } from "../../../generated/prisma/client.js";

import prisma from "../../config/prisma.js";

import type { CreatePurchaseInput } from "./purchase.schema.js";

function toCents(value: string | number): number {
  return Math.round(Number(value) * 100);
}

function fromCents(value: number): string {
  return (value / 100).toFixed(2);
}

function getInvoiceDates(
  purchaseDate: Date,
  closingDay: number,
  dueDay: number,
) {
  const year = purchaseDate.getFullYear();
  const month = purchaseDate.getMonth();

  const purchaseDay = purchaseDate.getDate();

  let invoiceMonth = month;
  let invoiceYear = year;

  if (purchaseDay > closingDay) {
    invoiceMonth += 1;

    if (invoiceMonth > 11) {
      invoiceMonth = 0;
      invoiceYear += 1;
    }
  }

  const closingDate = new Date(
    invoiceYear,
    invoiceMonth,
    Math.min(
      closingDay,
      new Date(
        invoiceYear,
        invoiceMonth + 1,
        0,
      ).getDate(),
    ),
    23,
    59,
    59,
    999,
  );

  let dueMonth = invoiceMonth;
  let dueYear = invoiceYear;

  if (dueDay <= closingDay) {
    dueMonth += 1;

    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
  }

  const dueDate = new Date(
    dueYear,
    dueMonth,
    Math.min(
      dueDay,
      new Date(
        dueYear,
        dueMonth + 1,
        0,
      ).getDate(),
    ),
    23,
    59,
    59,
    999,
  );

  return {
    referenceMonth: invoiceMonth + 1,
    referenceYear: invoiceYear,
    closingDate,
    dueDate,
  };
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);

  const targetMonth = result.getMonth() + months;
  const targetYear = result.getFullYear();

  const lastDay = new Date(
    targetYear,
    targetMonth + 1,
    0,
  ).getDate();

  result.setFullYear(targetYear);
  result.setMonth(targetMonth);
  result.setDate(Math.min(result.getDate(), lastDay));

  return result;
}

export async function createPurchase(
  userId: string,
  creditCardId: string,
  data: CreatePurchaseInput,
) {
  const amountCents = toCents(data.amount);
  const installments = data.installments ?? 1;

  return prisma.$transaction(async (tx) => {
    const creditCard = await tx.creditCard.findFirst({
      where: {
        id: creditCardId,
        userId,
      },
    });

    if (!creditCard) {
      throw new Error(
        "Cartão de crédito não encontrado.",
      );
    }

    if (creditCard.status !== "ACTIVE") {
      throw new Error(
        "O cartão de crédito não está ativo.",
      );
    }

    const availableLimitCents = toCents(
      creditCard.availableLimit.toString(),
    );

    if (amountCents > availableLimitCents) {
      throw new Error(
        "Limite disponível insuficiente.",
      );
    }

    if (data.categoryId) {
      const category = await tx.category.findFirst({
        where: {
          id: data.categoryId,
          userId,
          type: "EXPENSE",
          isActive: true,
        },
      });

      if (!category) {
        throw new Error(
          "Categoria de despesa não encontrada.",
        );
      }
    }

    const baseInstallmentCents = Math.floor(
      amountCents / installments,
    );

    const remainderCents =
      amountCents % installments;

    const purchase =
      await tx.creditCardPurchase.create({
        data: {
  userId,
  creditCardId,

  ...(data.categoryId !== undefined && {
    categoryId: data.categoryId,
  }),

  description: data.description,
  purchaseDate: data.purchaseDate,
  totalAmount: data.amount,
  installmentsCount: installments,
},
      });

    const createdItems: Prisma.InvoiceItemGetPayload<{}>[] =
      [];

    for (
      let index = 0;
      index < installments;
      index += 1
    ) {
      const installmentNumber = index + 1;

      const installmentAmountCents =
        baseInstallmentCents +
        (index === installments - 1
          ? remainderCents
          : 0);

      const installmentAmount = fromCents(
        installmentAmountCents,
      );

      const installmentPurchaseDate = addMonths(
        data.purchaseDate,
        index,
      );

      const invoiceDates = getInvoiceDates(
        installmentPurchaseDate,
        creditCard.closingDay,
        creditCard.dueDay,
      );

      let invoice = await tx.invoice.findUnique({
        where: {
          creditCardId_referenceMonth_referenceYear: {
            creditCardId,
            referenceMonth:
              invoiceDates.referenceMonth,
            referenceYear:
              invoiceDates.referenceYear,
          },
        },
      });

      if (!invoice) {
        invoice = await tx.invoice.create({
          data: {
            creditCardId,
            referenceMonth:
              invoiceDates.referenceMonth,
            referenceYear:
              invoiceDates.referenceYear,
            closingDate: invoiceDates.closingDate,
            dueDate: invoiceDates.dueDate,
            totalAmount: installmentAmount,
            paidAmount: "0.00",
            status: "OPEN",
          },
        });
      } else {
        if (invoice.status === "PAID") {
          throw new Error(
            "Não é possível adicionar uma compra em uma fatura já paga.",
          );
        }

        await tx.invoice.update({
          where: {
            id: invoice.id,
          },
          data: {
            totalAmount: {
              increment: installmentAmount,
            },
          },
        });
      }

      const invoiceItem =
  await tx.invoiceItem.create({
    data: {
      invoiceId: invoice.id,

      ...(data.categoryId !== undefined && {
        categoryId: data.categoryId,
      }),

      purchaseId: purchase.id,
      description: data.description,
      purchaseDate: data.purchaseDate,
      amount: installmentAmount,
      installmentNumber:
        installments > 1
          ? installmentNumber
          : null,
      totalInstallments:
        installments > 1
          ? installments
          : null,
    },
  });

      await tx.installment.create({
        data: {
          invoiceItemId: invoiceItem.id,
          installmentNumber,
          totalInstallments: installments,
          amount: installmentAmount,
          dueDate: invoiceDates.dueDate,
          status: "PENDING",
        },
      });

      createdItems.push(invoiceItem);
    }

    const newAvailableLimitCents =
      availableLimitCents - amountCents;

    const updatedCard =
      await tx.creditCard.update({
        where: {
          id: creditCard.id,
        },
        data: {
          availableLimit:
            fromCents(newAvailableLimitCents),
        },
      });

    return {
      purchase: {
        ...purchase,
        totalAmount:
          purchase.totalAmount.toString(),
      },

      items: createdItems.map((item) => ({
        ...item,
        amount: item.amount.toString(),
      })),

      creditCard: {
        id: updatedCard.id,
        name: updatedCard.name,
        creditLimit:
          updatedCard.creditLimit.toString(),
        availableLimit:
          updatedCard.availableLimit.toString(),
      },
    };
  });
}

export async function listPurchases(
  userId: string,
) {
  const purchases =
    await prisma.creditCardPurchase.findMany({
      where: {
        userId,
      },

      include: {
        creditCard: {
          select: {
            id: true,
            name: true,
            lastFourDigits: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },

        invoiceItems: {
          include: {
            invoice: {
              select: {
                id: true,
                referenceMonth: true,
                referenceYear: true,
                status: true,
                dueDate: true,
              },
            },

            installments: true,
          },

          orderBy: {
            installmentNumber: "asc",
          },
        },
      },

      orderBy: {
        purchaseDate: "desc",
      },
    });

  return purchases.map((purchase) => ({
    ...purchase,

    totalAmount:
      purchase.totalAmount.toString(),

    invoiceItems:
      purchase.invoiceItems.map((item) => ({
        ...item,

        amount: item.amount.toString(),

        installments:
          item.installments.map(
            (installment) => ({
              ...installment,
              amount:
                installment.amount.toString(),
            }),
          ),
      })),
  }));
}

export async function getPurchase(
  userId: string,
  purchaseId: string,
) {
  const purchase =
    await prisma.creditCardPurchase.findFirst({
      where: {
        id: purchaseId,
        userId,
      },

      include: {
        creditCard: {
          select: {
            id: true,
            name: true,
            lastFourDigits: true,
            creditLimit: true,
            availableLimit: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },

        invoiceItems: {
          include: {
            invoice: {
              select: {
                id: true,
                referenceMonth: true,
                referenceYear: true,
                closingDate: true,
                dueDate: true,
                status: true,
              },
            },

            installments: true,
          },

          orderBy: {
            installmentNumber: "asc",
          },
        },
      },
    });

  if (!purchase) {
    throw new Error(
      "Compra não encontrada.",
    );
  }

  return {
    ...purchase,

    totalAmount:
      purchase.totalAmount.toString(),

    creditCard: {
      ...purchase.creditCard,

      creditLimit:
        purchase.creditCard.creditLimit.toString(),

      availableLimit:
        purchase.creditCard.availableLimit.toString(),
    },

    invoiceItems:
      purchase.invoiceItems.map((item) => ({
        ...item,

        amount: item.amount.toString(),

        installments:
          item.installments.map(
            (installment) => ({
              ...installment,
              amount:
                installment.amount.toString(),
            }),
          ),
      })),
  };
}

export async function cancelPurchase(
  userId: string,
  purchaseId: string,
) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.creditCardPurchase.findFirst({
      where: {
        id: purchaseId,
        userId,
      },
      include: {
        creditCard: true,
        invoiceItems: {
          include: {
            invoice: true,
            installments: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new Error("Compra não encontrada.");
    }

    if (purchase.status === "CANCELLED") {
      throw new Error("Esta compra já foi cancelada.");
    }

    const paidInstallments = purchase.invoiceItems.filter(
      (item) =>
  item.installments.some(
    (installment) => installment.status === "PAID",
  ),
    );

    if (paidInstallments.length > 0) {
      throw new Error(
        "Não é possível cancelar uma compra que possui parcelas já pagas.",
      );
    }

    let releasedLimitCents = 0;

    for (const item of purchase.invoiceItems) {
      const invoice = item.invoice;

      if (
        invoice.status === "PAID" ||
        invoice.status === "CLOSED"
      ) {
        throw new Error(
          "Não é possível cancelar uma compra que possui parcela em fatura fechada ou paga.",
        );
      }

      releasedLimitCents += Math.round(
        Number(item.amount) * 100,
      );

      await tx.installment.updateMany({
        where: {
          invoiceItemId: item.id,
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      });

      await tx.invoiceItem.delete({
        where: {
          id: item.id,
        },
      });

      await tx.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          totalAmount: {
            decrement: item.amount,
          },
        },
      });
    }

    const currentAvailableLimitCents = Math.round(
      Number(purchase.creditCard.availableLimit) * 100,
    );

    const creditLimitCents = Math.round(
      Number(purchase.creditCard.creditLimit) * 100,
    );

    const newAvailableLimitCents = Math.min(
      creditLimitCents,
      currentAvailableLimitCents + releasedLimitCents,
    );

    const updatedCard = await tx.creditCard.update({
      where: {
        id: purchase.creditCardId,
      },
      data: {
        availableLimit: (
          newAvailableLimitCents / 100
        ).toFixed(2),
      },
    });

    const cancelledPurchase =
      await tx.creditCardPurchase.update({
        where: {
          id: purchase.id,
        },
        data: {
          status: "CANCELLED",
        },
      });

    return {
      purchase: {
        ...cancelledPurchase,
        totalAmount:
          cancelledPurchase.totalAmount.toString(),
      },
      creditCard: {
        id: updatedCard.id,
        name: updatedCard.name,
        creditLimit:
          updatedCard.creditLimit.toString(),
        availableLimit:
          updatedCard.availableLimit.toString(),
      },
      releasedLimit: (
        releasedLimitCents / 100
      ).toFixed(2),
    };
  });
}