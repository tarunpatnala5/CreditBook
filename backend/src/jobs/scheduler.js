// Credit Book — Background Job Scheduler
const cron = require('node-cron');
const prisma = require('../config/database');
const { FREQUENCY_N } = require('../services/transactions.service');

// ─── Check if a compounding event is due for this transaction ─────────────
// Returns true if today is a compounding day based on frequency
function isCompoundingDue(txn) {
  const freq = txn.interestFrequency || 'annually';
  const start = new Date(txn.transactionDate);
  const now = new Date();
  const lastCalc = txn.lastInterestCalcAt ? new Date(txn.lastInterestCalcAt) : null;

  // For daily — always due (once per day, checked via interestHistory unique constraint)
  if (freq === 'daily') return true;

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceStart = Math.floor((now - start) / msPerDay);
  const daysSinceLastCalc = lastCalc ? Math.floor((now - lastCalc) / msPerDay) : daysSinceStart;

  if (freq === 'monthly') {
    // Due when it's the same day-of-month as transaction start, and ≥1 month since last calc
    return now.getDate() === start.getDate() && daysSinceLastCalc >= 28;
  }

  if (freq === 'quarterly') {
    // Due every 3 months (≈91 days since last calc)
    return now.getDate() === start.getDate() && daysSinceLastCalc >= 88;
  }

  if (freq === 'semi-annually') {
    // Due every 6 months (≈182 days)
    return now.getDate() === start.getDate() && daysSinceLastCalc >= 178;
  }

  if (freq === 'annually') {
    // Due once per year on anniversary date
    return (
      now.getDate() === start.getDate() &&
      now.getMonth() === start.getMonth() &&
      daysSinceLastCalc >= 360
    );
  }

  return false;
}

// ─── Interest Calculation (Daily at midnight) ──────────────────────────────
// Applies actual compounding events based on frequency
// Note: liveAmount for display is computed on-the-fly in transactions.service.js
// This job only updates currentAmount on actual compounding dates
async function runInterestCalc() {
  console.log('[Jobs] Running interest calculation...');
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        status: 'interest',
        interestRate: { not: null },
      },
    });

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let processed = 0;

    for (const txn of transactions) {
      // Skip if already calculated today
      const existing = await prisma.interestHistory.findUnique({
        where: { transactionId_date: { transactionId: txn.id, date: today } },
      });
      if (existing) continue;

      // Only compound if the period is due
      if (!isCompoundingDue(txn)) continue;

      const freq = txn.interestFrequency || 'annually';
      const n = FREQUENCY_N[freq] || 1;
      // One compounding period step: currentAmount × (1 + R/n)
      const periodRate = (txn.interestRate / 100) / n;
      const interestAdded = txn.currentAmount * periodRate;
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

      processed++;
    }

    console.log(`[Jobs] Interest compounding events: ${processed} / ${transactions.length} transactions`);
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
      // Interest transactions stay 'interest' status, not 'current'
      const newStatus = txn.interestRate ? 'interest' : 'current';

      await prisma.transaction.update({
        where: { id: txn.id },
        data: { status: newStatus },
      });

      // Recalculate person balance (only affects non-interest transactions)
      if (newStatus === 'current') {
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
    }

    if (toMove.length > 0) {
      console.log(`[Jobs] Moved ${toMove.length} upcoming → current/interest`);
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
  // Interest: daily at midnight — checks frequency inside
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
