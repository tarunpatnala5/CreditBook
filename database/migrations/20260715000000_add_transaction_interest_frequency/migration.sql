-- Add missing interestFrequency column to Transaction table
-- This column was in schema.prisma but never migrated to Neon
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "interestFrequency" TEXT NOT NULL DEFAULT 'annually';
