// Credit Book — Analytics Service (Admin) — real-time live data
const prisma = require('../config/database');

async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const startOfMonth = new Date(now);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    totalPersons,
    totalTransactions,
    txnThisMonth,
    allPersons,        // for money flow — live balance snapshot
    topUsers,
  ] = await Promise.all([
    // User counts — live
    prisma.user.count({ where: { deletedAt: null, status: 'active' } }),
    prisma.user.count({ where: { deletedAt: null, status: 'active', lastActiveAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { deletedAt: null, status: 'pending' } }),

    // Person/Transaction counts — live (excludes soft-deleted)
    prisma.person.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),

    // Money flow: sum all persons' live balance field
    // Positive balance = owner will GET money (gave entries dominate)
    // Negative balance = owner will GIVE money (got entries dominate)
    // This is exactly what appears on each user's home page — sum it all up.
    prisma.person.findMany({
      where: { deletedAt: null },
      select: { balance: true },
    }),

    // Top users by number of transactions they own
    prisma.transaction.groupBy({
      by: ['ownerId'],
      where: { deletedAt: null },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ]);

  // Money flow — aggregate all persons' live balances
  // totalPositive = sum of balances > 0 (money platform users are owed)
  // totalNegative = sum of |balance| where balance < 0 (money platform users owe)
  let totalPositive = 0;
  let totalNegative = 0;
  for (const p of allPersons) {
    if (p.balance > 0) totalPositive += p.balance;
    else if (p.balance < 0) totalNegative += Math.abs(p.balance);
  }

  // Enrich top users with current name/phone from DB (live lookup)
  const topUserIds = topUsers.map((u) => u.ownerId);
  const topUserDetails = await prisma.user.findMany({
    where: { id: { in: topUserIds }, deletedAt: null },
    select: { id: true, name: true, phone: true, avatarColor: true },
  });

  const enrichedTopUsers = topUsers
    .map((u) => {
      const details = topUserDetails.find((d) => d.id === u.ownerId);
      if (!details) return null; // user was deleted — skip
      return { ...details, transactionCount: u._count.id };
    })
    .filter(Boolean);

  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    totalPersons,
    totalTransactions,
    txnThisMonth,
    totalGave: totalNegative,   // sum of all money users OWE others (negative balances)
    totalGot:  totalPositive,   // sum of all money owed TO users (positive balances)
    topUsers: enrichedTopUsers,
    generatedAt: now.toISOString(), // helpful for debugging staleness
  };
}

module.exports = { getDashboardStats };

