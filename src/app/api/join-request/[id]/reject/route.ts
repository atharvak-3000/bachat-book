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
    });

    if (!joinRequest || joinRequest.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updated = await prisma.joinRequest.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
