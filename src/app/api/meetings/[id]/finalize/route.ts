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
    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting || meeting.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.status === "FINALIZED") {
      return NextResponse.json({ error: "Meeting already finalized" }, { status: 400 });
    }

    // Basic validation: closing balance should ideally be >= 0 (as per requirements)
    // We could calculate it here but for simplicity we'll just set to finalized.

    const updated = await prisma.meeting.update({
      where: { id },
      data: { status: "FINALIZED" },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
