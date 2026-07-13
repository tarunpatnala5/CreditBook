-- Add shareToken to Person for public read-only share links
ALTER TABLE "Person" ADD COLUMN "shareToken" TEXT;
CREATE UNIQUE INDEX "Person_shareToken_key" ON "Person"("shareToken");
