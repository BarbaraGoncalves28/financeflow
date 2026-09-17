import prisma from "../../config/prisma.js";

import type {
  CreateCreditCardInput,
  UpdateCreditCardInput,
} from "./credit-card.schema.js";

const CREDIT_CARD_NOT_FOUND = "CREDIT_CARD_NOT_FOUND";

export async function createCreditCard(
  userId: string,
  data: CreateCreditCardInput,
) {
  const existingCard = await prisma.creditCard.findFirst({
    where: {
      userId,
      lastFourDigits: data.lastFourDigits,
      name: data.name,
    },
  });

  if (existingCard) {
    const error = new Error("CREDIT_CARD_ALREADY_EXISTS");
    throw error;
  }

  return prisma.creditCard.create({
    data: {
  userId,
  name: data.name,
  lastFourDigits: data.lastFourDigits,
  creditLimit: data.creditLimit,
  availableLimit: data.creditLimit,
  closingDay: data.closingDay,
  dueDay: data.dueDay,
  status: data.status,

  ...(data.bank !== undefined && {
    bank: data.bank,
  }),

  ...(data.color !== undefined && {
    color: data.color,
  }),

  ...(data.icon !== undefined && {
    icon: data.icon,
  }),
},
  });
}

export async function listCreditCards(userId: string) {
  return prisma.creditCard.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          invoices: true,
        },
      },
    },
  });
}

export async function findCreditCardById(
  userId: string,
  id: string,
) {
  return prisma.creditCard.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      invoices: {
        orderBy: {
          dueDate: "desc",
        },
        take: 12,
      },
    },
  });
}

export async function updateCreditCard(
  userId: string,
  id: string,
  data: UpdateCreditCardInput,
) {
  const existingCard = await prisma.creditCard.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existingCard) {
    const error = new Error(CREDIT_CARD_NOT_FOUND);
    throw error;
  }

  if (
    data.closingDay !== undefined &&
    data.dueDay !== undefined &&
    data.closingDay === data.dueDay
  ) {
    const error = new Error("INVALID_INVOICE_DAYS");
    throw error;
  }

  if (
    data.lastFourDigits !== undefined ||
    data.name !== undefined
  ) {
    const duplicate = await prisma.creditCard.findFirst({
      where: {
        userId,
        name: data.name ?? existingCard.name,
        lastFourDigits:
          data.lastFourDigits ?? existingCard.lastFourDigits,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      const error = new Error("CREDIT_CARD_ALREADY_EXISTS");
      throw error;
    }
  }

  const updateData = {
  ...(data.name !== undefined && {
    name: data.name,
  }),

  ...(data.bank !== undefined && {
    bank: data.bank,
  }),

  ...(data.lastFourDigits !== undefined && {
    lastFourDigits: data.lastFourDigits,
  }),

  ...(data.creditLimit !== undefined && {
    creditLimit: data.creditLimit,
  }),

  ...(data.closingDay !== undefined && {
    closingDay: data.closingDay,
  }),

  ...(data.dueDay !== undefined && {
    dueDay: data.dueDay,
  }),

  ...(data.color !== undefined && {
    color: data.color,
  }),

  ...(data.icon !== undefined && {
    icon: data.icon,
  }),

  ...(data.status !== undefined && {
    status: data.status,
  }),
};

return prisma.creditCard.update({
  where: {
    id,
  },
  data: updateData,
});
}

export async function deactivateCreditCard(
  userId: string,
  id: string,
) {
  const existingCard = await prisma.creditCard.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existingCard) {
    const error = new Error(CREDIT_CARD_NOT_FOUND);
    throw error;
  }

  return prisma.creditCard.update({
    where: {
      id,
    },
    data: {
      status: "INACTIVE",
    },
  });
}