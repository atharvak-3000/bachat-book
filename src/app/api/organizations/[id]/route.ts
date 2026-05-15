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

    if (id !== admin.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, village, district, defaultInterestRate, defaultPenaltyAmount } = body;

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        name,
        village,
        district,
        defaultInterestRate: defaultInterestRate !== undefined ? parseFloat(defaultInterestRate) : undefined,
        defaultPenaltyAmount: defaultPenaltyAmount !== undefined ? parseInt(defaultPenaltyAmount) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
