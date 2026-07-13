// Credit Book — Support Service
const prisma = require('../config/database');

async function getMessages(userId, { page = 1, limit = 100 } = {}) {
  const [messages, total] = await Promise.all([
    prisma.supportMessage.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportMessage.count({ where: { userId, deletedAt: null } }),
  ]);
  return { messages, total };
}

async function sendMessage(userId, senderName, message) {
  return prisma.supportMessage.create({
    data: { userId, senderId: userId, message: message.trim() },
  });
}

// Admin: get all conversations (latest message per user)
async function getAllConversations() {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      status: 'active',
      supportMessages: { some: {} },
    },
    include: {
      supportMessages: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: {
          supportMessages: {
            where: { deletedAt: null, isRead: false, senderId: { not: process.env.ADMIN_USER_ID } },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return users.map((u) => ({
    userId: u.id,
    userName: u.name,
    userPhone: u.phone,
    avatarColor: u.avatarColor,
    lastMessage: u.supportMessages[0]?.message || '',
    lastMessageAt: u.supportMessages[0]?.createdAt || null,
    unreadCount: u._count.supportMessages,
  }));
}

async function getConversation(userId, { page = 1, limit = 100 } = {}) {
  const [messages, total] = await Promise.all([
    prisma.supportMessage.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportMessage.count({ where: { userId, deletedAt: null } }),
  ]);

  // Mark user messages as read
  await prisma.supportMessage.updateMany({
    where: { userId, senderId: userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return { messages, total };
}

async function adminReply(adminId, userId, message) {
  const saved = await prisma.supportMessage.create({
    data: { userId, senderId: adminId, message: message.trim() },
  });

  // Create notification for user
  await prisma.notification.create({
    data: {
      userId,
      title: 'Reply from Admin',
      body: message.length > 80 ? message.substring(0, 80) + '...' : message,
      category: 'support',
      deepLink: '/settings/support',
    },
  });

  return saved;
}

module.exports = { getMessages, sendMessage, getAllConversations, getConversation, adminReply };
