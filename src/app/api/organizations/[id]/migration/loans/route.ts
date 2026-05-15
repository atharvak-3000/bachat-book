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

    const { loans } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const createdLoans = [];

      for (const l of loans) {
        // 1. Create the active Loan record
        const newLoan = await tx.loan.create({
          data: {
            organizationId: id,
            memberId: l.id,
            loanAmount: Math.round(l.originalAmount * 100),
            outstandingAmount: Math.round(l.loanOutstanding * 100),
            interestRate: l.interestRate,
            disbursedDate: new Date(l.disbursedDate),
            status: "ACTIVE",
          },
        });

        // 2. Clear the temporary LOAN_OUTSTANDING marker if exists
        // Actually, better to keep it as audit but maybe update description
        await tx.openingBalance.updateMany({
          where: {
            organizationId: id,
            memberId: l.id,
            type: "LOAN_OUTSTANDING",
          },
          data: {
            description: `Migrated to active loan ID: ${newLoan.id}`,
          },
        });

        createdLoans.push(newLoan);
      }

      await createAuditLog({
        organizationId: id,
        userId,
        action: "MIGRATION_LOAN_IMPORT",
        entityType: "ORGANIZATION",
        entityId: id,
        afterData: { count: createdLoans.length },
      });

      return createdLoans;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
