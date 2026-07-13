# Credit Book — Database Migration Guide
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Migration Tool: Prisma Migrate

All database schema changes are managed exclusively through **Prisma Migrate**. Manual SQL edits to production database are strictly prohibited.

---

## 2. Migration Workflow

### Development

```bash
# 1. Make changes to schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name add_interest_history_table

# This will:
# - Generate migration SQL in prisma/migrations/
# - Apply migration to dev database
# - Regenerate Prisma Client

# 3. View current migration status
npx prisma migrate status

# 4. Open Prisma Studio (visual DB editor)
npx prisma studio
```

### Production

```bash
# Apply pending migrations (safe — does NOT reset data)
npx prisma migrate deploy

# Verify status
npx prisma migrate status
```

**NEVER run `prisma migrate dev` in production** — this can drop data.

---

## 3. Migration Naming Convention

```
{timestamp}_{descriptive_name}

Examples:
20260713000000_initial_schema
20260720000000_add_interest_history
20260801000000_add_family_groups
20260815000000_add_announcements_table
```

---

## 4. Safe Migration Checklist

Before every migration in production:

- [ ] Backup database (manual `pg_dump`) before applying
- [ ] Test migration on staging/development first
- [ ] Check migration SQL for destructive operations (DROP, ALTER)
- [ ] Ensure API handles both old and new schema during deployment
- [ ] Deploy migration BEFORE deploying API code that uses new schema

---

## 5. Migration Examples

### Adding a Column (Safe)

```sql
-- 20260720000000_add_notes_to_persons/migration.sql
ALTER TABLE "persons" ADD COLUMN "notes" TEXT;
```

This is always safe — existing rows get NULL for the new column.

### Adding an Index (Safe)

```sql
-- Create index concurrently (non-blocking in PostgreSQL)
CREATE INDEX CONCURRENTLY "idx_transactions_interest" 
ON "transactions"("interest_rate") 
WHERE interest_rate IS NOT NULL;
```

### Renaming a Column (CAREFUL)

```sql
-- Step 1: Add new column (deploy)
ALTER TABLE "transactions" ADD COLUMN "current_amount" DECIMAL(15,2);

-- Step 2: Backfill data
UPDATE "transactions" SET current_amount = amount WHERE current_amount IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE "transactions" ALTER COLUMN "current_amount" SET NOT NULL;

-- Step 4: Remove old column (only after code no longer uses it)
-- Do in a SEPARATE migration, deployed AFTER code update
ALTER TABLE "transactions" DROP COLUMN "old_amount_column";
```

---

## 6. Rollback Strategy

Prisma Migrate does not support automatic rollbacks. Instead:

### Option 1: Revert to Backup (Nuclear)
```bash
# Restore from last backup
gunzip -c latest-backup.sql.gz | psql $DATABASE_URL
```

### Option 2: Write a "down" migration manually
```bash
# Create a new migration that reverses the problematic one
npx prisma migrate dev --name revert_interest_history
# Edit the generated migration SQL to undo the previous change
```

---

## 7. Seeding the Database

```bash
# Run the seeder (creates admin user)
npx prisma db seed

# Seeder location: apps/api/src/prisma/seed.ts
```

```typescript
// seed.ts
async function main() {
  const adminPhone = process.env.ADMIN_PHONE;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // Create admin user if not exists
  const admin = await db.users.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      name: 'Tarun Kumar',
      phone: adminPhone,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'admin',
      status: 'active',
      activatedAt: new Date(),
    }
  });
  
  // Seed default system settings
  await db.systemSettings.upsert({
    where: { key: 'interest_type' },
    update: {},
    create: { key: 'interest_type', value: JSON.stringify('simple') }
  });
  
  console.log(`Admin created: ${admin.name} (${admin.phone})`);
}
```

---

*Credit Book Database Migration Guide — v1.0.0*
