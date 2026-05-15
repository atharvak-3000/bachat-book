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
    const { category, amount, description } = body;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.status === "FINALIZED") {
      return NextResponse.json({ error: "Cannot add expenses to a finalized meeting" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        meetingId,
        category,
        amount: parseInt(amount),
        description,
        organizationId: admin.organizationId,
      },
    });

    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
