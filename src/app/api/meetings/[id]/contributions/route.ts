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
    const { id: meetingId } = await params;

    const contributions = await prisma.meetingContribution.findMany({
      where: {
        meetingId,
        meeting: {
          organizationId: admin.organizationId,
        },
      },
      include: {
        member: true,
      },
      orderBy: {
        member: {
          memberNumber: "asc",
        },
      },
    });

    return NextResponse.json(contributions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
