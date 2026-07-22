// Credit Book — Server Entry Point
require('dotenv').config();

const app = require('./src/app');
const { startJobs } = require('./src/jobs/scheduler');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ─── Auto-seed admin on startup ──────────────────────────────────────────────
async function ensureAdminExists() {
  try {
    const adminPhone = process.env.ADMIN_PHONE || 'admin';
    const existing = await prisma.user.findFirst({ where: { phone: adminPhone } });
    if (!existing) {
      const adminName = process.env.ADMIN_NAME || 'Admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await prisma.user.create({
        data: {
          name: adminName,
          phone: adminPhone,
          passwordHash,
          role: 'admin',
          status: 'active',
          activatedAt: new Date(),
          avatarColor: '#007AFF',
        },
      });
      console.log(`✅ Admin user auto-created: ${adminPhone}`);
    }
  } catch (err) {
    console.error('⚠️  Admin auto-seed failed (DB may not be migrated yet):', err.message);
  }
}

// ─── Ensure required tables exist (raw SQL — survives missing Prisma migrations) ──
async function ensureTablesExist() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PasswordResetRequest" (
        "id"        TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "phone"     TEXT        NOT NULL,
        "userId"    TEXT,
        "token"     TEXT        NOT NULL UNIQUE,
        "status"    TEXT        NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "usedAt"    TIMESTAMP(3),
        "sentAt"    TIMESTAMP(3)
      )
    `);
    console.log('✅ PasswordResetRequest table verified/created');
  } catch (err) {
    console.error('⚠️  ensureTablesExist failed:', err.message);
  }
}

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Credit Book API running at http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📋 Routes:`);
  console.log(`   POST /api/v1/auth/register`);
  console.log(`   POST /api/v1/auth/login`);
  console.log(`   GET  /api/v1/persons`);
  console.log(`   GET  /health\n`);

  // Start background jobs
  startJobs();

  // Ensure required DB tables exist (idempotent raw SQL)
  ensureTablesExist();

  // Ensure admin user exists (auto-seed on fresh DB)
  ensureAdminExists();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
