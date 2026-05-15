import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
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
    });

    if (!meeting || meeting.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.status !== "FINALIZED") {
      return NextResponse.json({ error: "Meeting is not finalized" }, { status: 400 });
    }

    // Check if any LATER meeting is finalized. 
    // In a strict accounting system, you can only reopen the LAST finalized meeting.
    const laterMeeting = await prisma.meeting.findFirst({
      where: {
        organizationId: admin.organizationId,
        meetingDate: { gt: meeting.meetingDate },
        status: "FINALIZED",
      },
    });

    if (laterMeeting) {
      return NextResponse.json({ 
        error: "Cannot reopen. A later meeting is already finalized. Please reopen that first." 
      }, { status: 400 });
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: { status: "DRAFT" },
    });

    await createAuditLog({
      organizationId: admin.organizationId,
      userId,
      action: "MEETING_REOPENED",
      entityType: "MEETING",
      entityId: id,
      beforeData: meeting,
      afterData: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
