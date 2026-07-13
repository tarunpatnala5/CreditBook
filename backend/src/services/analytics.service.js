// Credit Book — Analytics Service (Admin)
const prisma = require('../config/database');

async function getDashboardStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    totalPersons,
    totalTransactions,
    txnThisMonth,
    allTransactions,
    topUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, status: 'active' } }),
    prisma.user.count({ where: { deletedAt: null, status: 'active', lastActiveAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { deletedAt: null, status: 'pending' } }),
    prisma.person.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
    prisma.transaction.findMany({ where: { deletedAt: null, status: 'current' }, select: { type: true, currentAmount: true } }),
    prisma.transaction.groupBy({
      by: ['ownerId'],
      where: { deletedAt: null },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ]);

  const totalGave = allTransactions.filter((t) => t.type === 'gave').reduce((sum, t) => sum + t.currentAmount, 0);
  const totalGot = allTransactions.filter((t) => t.type === 'got').reduce((sum, t) => sum + t.currentAmount, 0);

  // Enrich top users
  const topUserIds = topUsers.map((u) => u.ownerId);
  const topUserDetails = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, name: true, phone: true, avatarColor: true },
  });

  const enrichedTopUsers = topUsers.map((u) => ({
    ...topUserDetails.find((d) => d.id === u.ownerId),
    transactionCount: u._count.id,
  }));

  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    totalPersons,
    totalTransactions,
    txnThisMonth,
    totalGave,
    totalGot,
    topUsers: enrichedTopUsers,
  };
}

module.exports = { getDashboardStats };
