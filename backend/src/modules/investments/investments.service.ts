import { prisma } from '../../lib/prisma'; // Ajuste o caminho do seu prisma
import { AssetTransactionType, AssetType } from '@prisma/client';

export class InvestmentsService {
  // ==========================================
  // PORTFÓLIOS
  // ==========================================
  async getPortfolios(userId: string) {
    return prisma.portfolio.findMany({
      where: { userId },
      include: {
        assets: true,
      },
    });
  }

  async createPortfolio(userId: string, data: { name: string; description?: string }) {
    return prisma.portfolio.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
      },
    });
  }

  // ==========================================
  // ATIVOS E TRANSAÇÕES (A Mágica do Preço Médio)
  // ==========================================
  async addAsset(portfolioId: string, data: { ticker: string; name: string; type: AssetType }) {
    return prisma.asset.create({
      data: {
        portfolioId,
        ticker: data.ticker.toUpperCase(),
        name: data.name,
        type: data.type,
        quantity: 0,
        averagePrice: 0,
        currentPrice: 0, 
      },
    });
  }

  async registerTransaction(
    assetId: string,
    data: {
      type: AssetTransactionType;
      quantity: number;
      price: number;
      fees?: number;
      date: Date;
    }
  ) {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error('Ativo não encontrado');

    const fees = data.fees || 0;
    const totalAmount = data.quantity * data.price;

    let newQuantity = Number(asset.quantity);
    let newAveragePrice = Number(asset.averagePrice);

    if (data.type === 'BUY') {
      // Cálculo do Preço Médio: (Quantidade Atual * Preço Médio Atual) + (Nova Quantidade * Novo Preço) / Quantidade Total
      const currentTotalValue = newQuantity * newAveragePrice;
      const newTotalValue = data.quantity * data.price;
      
      newQuantity += data.quantity;
      newAveragePrice = (currentTotalValue + newTotalValue) / newQuantity;

    } else if (data.type === 'SELL') {
      if (newQuantity < data.quantity) {
        throw new Error('Quantidade insuficiente para venda');
      }
      // Venda não altera o preço médio de aquisição, apenas diminui a quantidade
      newQuantity -= data.quantity;
      
      // Se vendeu tudo, zera o preço médio por segurança
      if (newQuantity === 0) newAveragePrice = 0;
    }

    // Executa a criação da transação e a atualização do ativo em uma única transação no banco (ACID)
    const [transaction, updatedAsset] = await prisma.$transaction([
      prisma.assetTransaction.create({
        data: {
          assetId,
          type: data.type,
          quantity: data.quantity,
          price: data.price,
          totalAmount,
          fees,
          date: data.date,
        },
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: {
          quantity: newQuantity,
          averagePrice: newAveragePrice,
          // Atualiza o preço atual para refletir a última cotação negociada pelo usuário
          currentPrice: data.type === 'BUY' || data.type === 'SELL' ? data.price : asset.currentPrice,
        },
      }),
    ]);

    return { transaction, updatedAsset };
  }
}