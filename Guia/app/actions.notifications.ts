'use server'
import { db } from '@/lib/prisma';

export async function getUserNotifications(userId: string) {
  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUnreadNotificationsCount(userId: string) {
  return await db.notification.count({
    where: { userId, read: false },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return await db.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function createNotification(data: { userId: string, title: string, message: string, type: string }) {
  return await db.notification.create({
    data,
  });
}
