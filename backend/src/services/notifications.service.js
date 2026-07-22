// Credit Book — Notifications Service
const prisma = require('../config/database');
const { NotFoundError } = require('../utils/errors');

async function getNotifications(userId, { category, isRead, page = 1, limit = 50 } = {}) {
  const where = {
    userId,
    deletedAt: null,
    ...(category && category !== 'all' ? { category } : {}),
    ...(isRead !== undefined ? { isRead: isRead === 'true' || isRead === true } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, deletedAt: null, isRead: false } }),
  ]);

  return { notifications, total, unreadCount };
}

async function getUnreadCount(userId) {
  const total = await prisma.notification.count({
    where: { userId, deletedAt: null, isRead: false },
  });

  const byCategory = await prisma.notification.groupBy({
    by: ['category'],
    where: { userId, deletedAt: null, isRead: false },
    _count: true,
  });

  const counts = {};
  byCategory.forEach((c) => { counts[c.category] = c._count; });

  return { total, byCategory: counts };
}

async function markRead(notificationId, userId) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

async function markAllRead(userId, category = null) {
  const where = { userId, isRead: false, ...(category ? { category } : {}) };
  await prisma.notification.updateMany({
    where,
    data: { isRead: true, readAt: new Date() },
  });
}

async function deleteNotification(notificationId, userId) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { deletedAt: new Date() },
  });
}

async function createNotification(userId, { title, body, category = 'system', deepLink = null, actionData = null }) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      body,
      category,
      deepLink,
      actionData: actionData ? JSON.stringify(actionData) : null,
    },
  });
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  createNotification,
};
