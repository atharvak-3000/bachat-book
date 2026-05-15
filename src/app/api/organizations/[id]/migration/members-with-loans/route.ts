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
    
    if (id !== admin.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find members with LOAN_OUTSTANDING opening balance
    const membersWithLoans = await prisma.member.findMany({
      where: {
        organizationId: id,
        openingBalances: {
          some: { type: "LOAN_OUTSTANDING" },
        },
      },
      include: {
        openingBalances: {
          where: { type: "LOAN_OUTSTANDING" },
        },
      },
    });

    const result = membersWithLoans.map((m) => ({
      id: m.id,
      name: m.name,
      loanOutstanding: m.openingBalances[0].amount / 100,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
