// Ajuste o caminho do import do prisma conforme a sua pasta atual (ex: '../lib/prisma.js' ou '../config/prisma.js')
import { prisma } from '../config/prisma.js'; 

interface CreateAuditLogParams {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata ? params.metadata : null,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error('[AUDIT_ERROR] Falha ao salvar log de auditoria:', error);
  }
}

export async function getAuditLogs(userId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}