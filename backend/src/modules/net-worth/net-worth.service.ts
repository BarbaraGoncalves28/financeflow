import { prisma } from '../../config/prisma.js'; // Ajuste o caminho conforme seu projeto

export class NetWorthService {
  async getConsolidatedNetWorth(userId: string) {
    // 1. Ativos Líquidos: Saldo das Contas Bancárias
    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true },
      select: { currentBalance: true },
    });
    
    const accountsBalance = accounts.reduce(
      (acc, account) => acc + Number(account.currentBalance), 
      0
    );

    // 2. Ativos Investidos: Valor total das carteiras de investimento
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        assets: {
          select: { quantity: true, currentPrice: true }
        }
      },
    });

    const investmentsBalance = portfolios.reduce((total, portfolio) => {
      const portfolioTotal = portfolio.assets.reduce((acc, asset) => {
        return acc + (Number(asset.quantity) * Number(asset.currentPrice));
      }, 0);
      return total + portfolioTotal;
    }, 0);

    // 3. Passivos (Dívidas): Faturas de Cartão de Crédito em Aberto ou Atrasadas
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
      include: {
        invoices: {
          where: { status: { in: ['OPEN', 'OVERDUE'] } },
          select: { totalAmount: true, paidAmount: true }
        }
      }
    });

    const creditCardDebt = creditCards.reduce((total, card) => {
      const cardDebt = card.invoices.reduce((acc, inv) => {
        return acc + (Number(inv.totalAmount) - Number(inv.paidAmount));
      }, 0);
      return total + cardDebt;
    }, 0);

    // 4. Fechamento do Balanço Patrimonial
    const totalAssets = accountsBalance + investmentsBalance;
    const totalLiabilities = creditCardDebt; // Espaço para adicionar empréstimos no futuro
    const netWorth = totalAssets - totalLiabilities;

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      breakdown: {
        accountsBalance,
        investmentsBalance,
        creditCardDebt,
      },
    };
  }
}