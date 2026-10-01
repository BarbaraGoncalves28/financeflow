import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from './notifications.service.js';

export async function getNotificationsController(
  req: any,
  res: any,
) {
  const userId = req.userId;

  const notifications = await getNotifications(userId);

  return res.status(200).json({
    notifications,
  });
}

export async function getUnreadCountController(
  req: any,
  res: any,
) {
  const userId = req.userId;

  const count = await getUnreadCount(userId);

  return res.status(200).json({
    count,
  });
}

export async function markAsReadController(
  req: any,
  res: any,
) {
  const userId = req.userId;
  const { id } = req.params;

  const result = await markAsRead(userId, id);

  if (result.count === 0) {
    return res.status(404).json({
      message: 'Notificação não encontrada.',
    });
  }

  return res.status(200).json({
    message: 'Notificação marcada como lida.',
  });
}

export async function markAllAsReadController(
  req: any,
  res: any,
) {
  const userId = req.userId;

  const result = await markAllAsRead(userId);

  return res.status(200).json({
    message: 'Todas as notificações foram marcadas como lidas.',
    updatedCount: result.count,
  });
}

export async function deleteNotificationController(
  req: any,
  res: any,
) {
  const userId = req.userId;
  const { id } = req.params;

  const result = await deleteNotification(userId, id);

  if (result.count === 0) {
    return res.status(404).json({
      message: 'Notificação não encontrada.',
    });
  }

  return res.status(204).send();
}