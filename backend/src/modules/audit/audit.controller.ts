import { getAuditLogs } from "./audit.service.js";

export async function getAuditLogsController(req: any, res: any) {
    const userId = req.userId;
    const { limit } = req.query;

    try{
        const logs = await getAuditLogs(userId, Number(limit) || 50);
        return res.status(200).json({ logs });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar logs de auditoria.' });
    }
}