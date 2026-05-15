import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const { id: meetingId } = await params;
    const body = await req.json();
    const { memberId, loanAmount, interestRate } = body;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.status === "FINALIZED") {
      return NextResponse.json({ error: "Cannot issue loans in a finalized meeting" }, { status: 400 });
    }

    const loan = await prisma.loan.create({
      data: {
        memberId,
        loanAmount: parseInt(loanAmount),
        outstandingAmount: parseInt(loanAmount),
        interestRate: interestRate || admin.organization.defaultInterestRate,
        disbursedDate: meeting.meetingDate,
        organizationId: admin.organizationId,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
