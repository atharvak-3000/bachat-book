-- CreateEnum
CREATE TYPE "OpeningBalanceType" AS ENUM ('CORPUS', 'MEMBER_SAVINGS', 'LOAN_OUTSTANDING', 'CASH_IN_HAND', 'BANK_BALANCE');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('CASH', 'BANK');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "source" "TransactionSource" NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "openingBank" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "openingCash" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "MeetingContribution" ADD COLUMN     "source" "TransactionSource" NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "monthlySavingsTarget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "openingBankBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "openingCashBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "memberId" TEXT,
    "type" "OpeningBalanceType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
