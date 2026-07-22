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
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Count unread messages per user: only messages WHERE the user sent them (senderId = userId) AND not yet read
  const unreadCounts = await Promise.all(
    users.map((u) =>
      prisma.supportMessage.count({
        where: {
          userId: u.id,
          senderId: u.id,   // only messages FROM the user (not admin replies)
          isRead: false,
          deletedAt: null,
        },
      })
    )
  );

  return users.map((u, i) => ({
    userId: u.id,
    userName: u.name,
    userPhone: u.phone,
    avatarColor: u.avatarColor,
    lastMessage: u.supportMessages[0]?.message || '',
    lastMessageAt: u.supportMessages[0]?.createdAt || null,
    unreadCount: unreadCounts[i],
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
