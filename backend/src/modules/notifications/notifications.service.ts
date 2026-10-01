import prisma from "../../config/prisma.js";
import type { NotificationType } from "../../../generated/prisma/client.js";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  notificationKey: string;
  metadata?: Record<string, unknown>;
};

export async function createNotification(
  data: CreateNotificationInput,
) {
  return prisma.notification.upsert({
    where: {
      userId_notificationKey: {
        userId: data.userId,
        notificationKey: data.notificationKey,
      },
    },
    update: {},
    create: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      notificationKey: data.notificationKey,
      metadata: data.metadata,
    },
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function markAsRead(
  userId: string,
  notificationId: string,
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function deleteNotification(
  userId: string,
  notificationId: string,
) {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId,
    },
  });
}