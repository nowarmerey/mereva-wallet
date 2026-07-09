-- Automatic monthly salary settings
ALTER TABLE "Settings"
  ADD COLUMN "salaryAmount" DOUBLE PRECISION,
  ADD COLUMN "salaryDay" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "salaryWalletId" INTEGER,
  ADD COLUMN "salaryLastPaid" TEXT;
