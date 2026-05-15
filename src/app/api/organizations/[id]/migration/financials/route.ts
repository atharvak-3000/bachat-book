import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const { id } = await params;
    
    if (id !== admin.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      openingCashBalance, 
      openingBankBalance, 
      monthlySavingsTarget, 
      defaultInterestRate 
    } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Organization settings
      const updatedOrg = await tx.organization.update({
        where: { id },
        data: {
          openingCashBalance: Math.round(openingCashBalance * 100),
          openingBankBalance: Math.round(openingBankBalance * 100),
          monthlySavingsTarget: Math.round(monthlySavingsTarget * 100),
          defaultInterestRate,
        },
      });

      // 2. Create OpeningBalance records
      await tx.openingBalance.createMany({
        data: [
          {
            organizationId: id,
            type: "CASH_IN_HAND",
            amount: Math.round(openingCashBalance * 100),
            description: "Migration Opening Cash",
          },
          {
            organizationId: id,
            type: "BANK_BALANCE",
            amount: Math.round(openingBankBalance * 100),
            description: "Migration Opening Bank",
          },
        ],
      });

      // 3. Audit Log
      await createAuditLog({
        organizationId: id,
        userId,
        action: "MIGRATION_FINANCIALS_SETUP",
        entityType: "ORGANIZATION",
        entityId: id,
        afterData: updatedOrg,
      });

      return updatedOrg;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
