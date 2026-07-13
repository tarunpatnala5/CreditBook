// Credit Book — Background Job Scheduler
const cron = require('node-cron');
const prisma = require('../config/database');

// ─── Interest Calculation (Daily at midnight) ──────────────────────────────
async function runInterestCalc() {
  console.log('[Jobs] Running interest calculation...');
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        status: 'current',
        interestRate: { not: null },
      },
    });

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    for (const txn of transactions) {
      // Skip if already calculated today
      const existing = await prisma.interestHistory.findUnique({
        where: { transactionId_date: { transactionId: txn.id, date: today } },
      });
      if (existing) continue;

      const dailyRate = txn.interestRate / 100 / 365;
      const interestAdded = txn.currentAmount * dailyRate;
      const newAmount = txn.currentAmount + interestAdded;

      await prisma.transaction.update({
        where: { id: txn.id },
        data: {
          currentAmount: parseFloat(newAmount.toFixed(2)),
          lastInterestCalcAt: new Date(),
        },
      });

      await prisma.interestHistory.create({
        data: {
          transactionId: txn.id,
          date: today,
          principal: txn.currentAmount,
          rate: txn.interestRate,
          interestAdded: parseFloat(interestAdded.toFixed(2)),
          runningTotal: parseFloat(newAmount.toFixed(2)),
        },
      });
    }

    // Recalculate all affected person balances
    const personIds = [...new Set(transactions.map((t) => t.personId))];
    for (const personId of personIds) {
      const txns = await prisma.transaction.findMany({
        where: { personId, deletedAt: null, status: 'current' },
      });

      let balance = 0;
      for (const t of txns) {
        if (t.type === 'got') balance += t.currentAmount;
        else balance -= t.currentAmount;
      }

      await prisma.person.update({
        where: { id: personId },
        data: { balance },
      });
    }

    console.log(`[Jobs] Interest calculated for ${transactions.length} transactions`);
  } catch (err) {
    console.error('[Jobs] Interest calculation failed:', err.message);
  }
}

// ─── Move Upcoming to Current (every hour) ────────────────────────────────
async function runUpcomingMover() {
  try {
    const now = new Date();
    const toMove = await prisma.transaction.findMany({
      where: {
        status: 'upcoming',
        transactionDate: { lte: now },
        deletedAt: null,
      },
    });

    for (const txn of toMove) {
      await prisma.transaction.update({
        where: { id: txn.id },
        data: { status: 'current' },
      });

      // Recalculate person balance
      const txns = await prisma.transaction.findMany({
        where: { personId: txn.personId, deletedAt: null, status: 'current' },
      });
      let balance = 0;
      for (const t of txns) {
        balance += t.type === 'got' ? t.currentAmount : -t.currentAmount;
      }
      await prisma.person.update({
        where: { id: txn.personId },
        data: { balance, lastActivityAt: new Date() },
      });

      // Notify the person's owner
      await prisma.notification.create({
        data: {
          userId: txn.ownerId,
          title: 'Entry is now active',
          body: `₹${txn.amount.toLocaleString('en-IN')} upcoming entry is now in Current`,
          category: 'transaction',
          deepLink: `/persons/${txn.personId}`,
        },
      });
    }

    if (toMove.length > 0) {
      console.log(`[Jobs] Moved ${toMove.length} upcoming → current`);
    }
  } catch (err) {
    console.error('[Jobs] Upcoming mover failed:', err.message);
  }
}

// ─── Finalize scheduled deletions ─────────────────────────────────────────
async function runPersonDeletion() {
  try {
    const now = new Date();
    const toDelete = await prisma.person.findMany({
      where: {
        deleteScheduledAt: { lte: now },
        deletedAt: null,
      },
    });

    for (const person of toDelete) {
      await prisma.person.update({
        where: { id: person.id },
        data: { deletedAt: new Date() },
      });
    }

    if (toDelete.length > 0) {
      console.log(`[Jobs] Permanently deleted ${toDelete.length} persons`);
    }
  } catch (err) {
    console.error('[Jobs] Person deletion failed:', err.message);
  }
}

// ─── Session cleanup (remove expired/revoked sessions older than 90 days) ─
async function runSessionCleanup() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    await prisma.session.deleteMany({
      where: {
        OR: [
          { revokedAt: { lte: cutoff } },
          { expiresAt: { lte: cutoff } },
        ],
      },
    });
  } catch (err) {
    console.error('[Jobs] Session cleanup failed:', err.message);
  }
}

// ─── Start all jobs ────────────────────────────────────────────────────────
function startJobs() {
  // Interest: daily at midnight
  cron.schedule('0 0 * * *', runInterestCalc);

  // Upcoming mover: every hour
  cron.schedule('0 * * * *', runUpcomingMover);

  // Person deletion: every hour
  cron.schedule('0 * * * *', runPersonDeletion);

  // Session cleanup: weekly
  cron.schedule('0 2 * * 0', runSessionCleanup);

  console.log('[Jobs] Background jobs started ✅');

  // Run mover immediately on startup
  runUpcomingMover();
  runPersonDeletion();
}

module.exports = { startJobs };
