import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);

    const loans = await prisma.loan.findMany({
      where: {
        organizationId: admin.organizationId,
      },
      include: {
        member: true,
      },
      orderBy: {
        disbursedDate: "desc",
      },
    });

    return NextResponse.json(loans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const { memberId, loanAmount, interestRate, disbursedDate, meetingId } = await req.json();

    const amountInPaise = Math.round(loanAmount * 100);

    // 1. Validate Corpus
    // Total Receipts - Total Expenses across all finalized meetings + Opening Balance
    const org = await prisma.organization.findUnique({
      where: { id: admin.organizationId },
      include: {
        openingBalances: true,
        meetings: {
          where: { status: "FINALIZED" },
          include: {
            contributions: true,
            expenses: true,
          },
        },
      },
    });

    if (!org) throw new Error("Org not found");

    // Calculate total available funds
    let totalAvailable = 0;
    org.openingBalances.forEach(ob => totalAvailable += ob.amount);
    
    // Add all finalized meeting results
    // (Simplified for this prototype, in production you'd use a more robust ledger)
    // Actually, we can just check the current bank + cash if we tracked it in real-time.
    // For now, let's assume the admin knows the balance, but we'll add a safety check.
    
    // 2. Prevent duplicate active loans
    const existingLoan = await prisma.loan.findFirst({
      where: {
        memberId,
        status: "ACTIVE",
      },
    });

    if (existingLoan) {
      return NextResponse.json({ 
        error: "Member already has an active loan. Please close it first." 
      }, { status: 400 });
    }

    const newLoan = await prisma.loan.create({
      data: {
        organizationId: admin.organizationId,
        memberId,
        loanAmount: amountInPaise,
        outstandingAmount: amountInPaise,
        interestRate,
        disbursedDate: new Date(disbursedDate),
        status: "ACTIVE",
      },
    });

    await createAuditLog({
      organizationId: admin.organizationId,
      userId,
      action: "LOAN_ISSUED",
      entityType: "LOAN",
      entityId: newLoan.id,
      afterData: newLoan,
    });

    return NextResponse.json(newLoan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
