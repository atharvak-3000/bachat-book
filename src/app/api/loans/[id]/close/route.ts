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

    const loan = await prisma.loan.findUnique({
      where: { id },
    });

    if (!loan || loan.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const updated = await prisma.loan.update({
      where: { id },
      data: {
        status: "CLOSED",
        outstandingAmount: 0,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
