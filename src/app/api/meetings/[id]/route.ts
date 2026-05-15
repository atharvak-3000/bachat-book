import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        contributions: {
          include: {
            member: true,
          },
        },
      },
    });

    if (!meeting || meeting.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const { id } = await params;
    const body = await req.json();
    const { openingBalance, meetingDate } = body;

    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting || meeting.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.status === "FINALIZED") {
      return NextResponse.json({ error: "Cannot edit finalized meeting" }, { status: 400 });
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        openingBalance: openingBalance !== undefined ? openingBalance : undefined,
        meetingDate: meetingDate ? new Date(meetingDate) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
