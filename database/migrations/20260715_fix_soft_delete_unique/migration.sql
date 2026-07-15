-- Fix: Allow re-registration of phone/email after soft-delete
-- Drop the plain unique constraints and replace with partial unique indexes
-- that only enforce uniqueness for non-deleted (active) users.

-- Drop existing unique indexes created by Prisma for phone and email
DROP INDEX IF EXISTS "User_phone_key";
DROP INDEX IF EXISTS "User_email_key";

-- Create partial unique indexes: unique only when deletedAt IS NULL
CREATE UNIQUE INDEX "User_phone_active_unique" ON "User" ("phone") WHERE ("deletedAt" IS NULL);
CREATE UNIQUE INDEX "User_email_active_unique" ON "User" ("email") WHERE ("deletedAt" IS NULL AND "email" IS NOT NULL);
