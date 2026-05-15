import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);

    const meetings = await prisma.meeting.findMany({
      where: {
        organizationId: admin.organizationId,
      },
      orderBy: {
        meetingDate: "desc",
      },
      include: {
        contributions: true,
      },
    });

    return NextResponse.json(meetings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const body = await req.json();
    const { meetingDate, monthYear, openingBalance } = body;

    // Validate monthYear uniqueness per org
    const existing = await prisma.meeting.findFirst({
      where: {
        organizationId: admin.organizationId,
        monthYear,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "A meeting for this month already exists" }, { status: 400 });
    }

    // Start transaction to create meeting and contributions
    const meeting = await prisma.$transaction(async (tx) => {
      const newMeeting = await tx.meeting.create({
        data: {
          meetingDate: new Date(meetingDate),
          monthYear,
          openingBalance: openingBalance || 0,
          organizationId: admin.organizationId,
          status: "DRAFT",
        },
      });

      // Get all active members
      const activeMembers = await tx.member.findMany({
        where: {
          organizationId: admin.organizationId,
          isActive: true,
        },
      });

      // Create empty contribution rows
      await tx.meetingContribution.createMany({
        data: activeMembers.map((member) => ({
          meetingId: newMeeting.id,
          memberId: member.id,
          savingsAmount: 0,
          loanRepayment: 0,
          interestPaid: 0,
          penaltyPaid: 0,
          isPresent: true,
        })),
      });

      return newMeeting;
    });

    return NextResponse.json(meeting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
