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

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        member: true,
      },
    });

    if (!loan || loan.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
