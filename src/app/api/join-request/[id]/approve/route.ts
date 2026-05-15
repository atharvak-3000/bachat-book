import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const { id } = await params;

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!joinRequest || joinRequest.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (joinRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    // Atomic transaction to approve and create member
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update request status
      const updatedRequest = await tx.joinRequest.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      // 2. Get next member number
      const lastMember = await tx.member.findFirst({
        where: { organizationId: admin.organizationId },
        orderBy: { memberNumber: "desc" },
      });
      const nextNumber = (lastMember?.memberNumber || 0) + 1;

      // 3. Create Member record
      const newMember = await tx.member.create({
        data: {
          organizationId: admin.organizationId,
          clerkUserId: joinRequest.clerkUserId,
          name: joinRequest.name,
          phone: joinRequest.phone,
          role: "MEMBER",
          memberNumber: nextNumber,
        },
      });

      return { updatedRequest, newMember };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
