const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  const result = await prisma.transaction.updateMany({
    where: {
      interestRate: { not: null },
      status: 'current',
      deletedAt: null,
    },
    data: { status: 'interest' },
  });
  console.log('Migrated', result.count, 'transactions to interest status');
  await prisma.$disconnect();
}

migrate().catch((e) => { console.error(e); process.exit(1); });
