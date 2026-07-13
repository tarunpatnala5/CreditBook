// Credit Book — Database Seeder
// Seeds the admin user on first run

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminPhone = process.env.ADMIN_PHONE || '+917382286787';
  const adminName = process.env.ADMIN_NAME || 'Tarun Kumar';
  const adminPassword = process.env.ADMIN_PASSWORD || 'arun2568';

  console.log('🌱 Seeding Credit Book database...');

  // Create admin user
  const existing = await prisma.user.findUnique({ where: { phone: adminPhone } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
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

    console.log(`✅ Admin created: ${admin.name} (${admin.phone})`);
  } else {
    console.log(`ℹ️  Admin already exists: ${existing.name} (${existing.phone})`);
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
