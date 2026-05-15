import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const { id: meetingId, memberId } = await params;
    const body = await req.json();
    const { savingsAmount, loanRepayment, interestPaid, penaltyPaid, isPresent } = body;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.status === "FINALIZED") {
      return NextResponse.json({ error: "Cannot edit contributions in a finalized meeting" }, { status: 400 });
    }

    const contribution = await prisma.meetingContribution.updateMany({
      where: {
        meetingId,
        memberId,
      },
      data: {
        savingsAmount: savingsAmount !== undefined ? parseInt(savingsAmount) : undefined,
        loanRepayment: loanRepayment !== undefined ? parseInt(loanRepayment) : undefined,
        interestPaid: interestPaid !== undefined ? parseInt(interestPaid) : undefined,
        penaltyPaid: penaltyPaid !== undefined ? parseInt(penaltyPaid) : undefined,
        isPresent: isPresent !== undefined ? isPresent : undefined,
      },
    });

    // Also update loan outstanding if repayment was made
    // (This is a simplified prototype; real logic would involve tracking loan IDs per repayment)
    // But for now we follow the user's logic where they just edit the contribution row.
    // In a real app, we'd find the active loan for this member and subtract repayment.
    
    if (loanRepayment && parseInt(loanRepayment) > 0) {
      const activeLoan = await prisma.loan.findFirst({
        where: {
          memberId,
          status: "ACTIVE",
          organizationId: admin.organizationId,
        },
      });
      
      if (activeLoan) {
        await prisma.loan.update({
          where: { id: activeLoan.id },
          data: {
            outstandingAmount: {
              decrement: parseInt(loanRepayment),
            },
          },
        });
      }
    }

    return NextResponse.json(contribution);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
