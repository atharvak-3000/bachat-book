import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(
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

    const { members } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const importedMembers = [];
      
      // Get current max member number
      const lastMember = await tx.member.findFirst({
        where: { organizationId: id },
        orderBy: { memberNumber: "desc" },
      });
      let currentNumber = lastMember?.memberNumber || 0;

      for (const m of members) {
        currentNumber++;
        
        // 1. Create Member
        const newMember = await tx.member.create({
          data: {
            organizationId: id,
            name: m.name,
            phone: m.phone,
            memberNumber: currentNumber,
            role: "MEMBER",
          },
        });

        // 2. Create OpeningBalance for Savings
        if (m.savings > 0) {
          await tx.openingBalance.create({
            data: {
              organizationId: id,
              memberId: newMember.id,
              type: "MEMBER_SAVINGS",
              amount: Math.round(m.savings * 100),
              description: "Migration Opening Savings",
            },
          });
        }

        // 3. Create OpeningBalance for Loan Outstanding (temporary marker)
        if (m.loanOutstanding > 0) {
          await tx.openingBalance.create({
            data: {
              organizationId: id,
              memberId: newMember.id,
              type: "LOAN_OUTSTANDING",
              amount: Math.round(m.loanOutstanding * 100),
              description: "Migration Opening Loan Marker",
            },
          });
        }

        importedMembers.push(newMember);
      }

      await createAuditLog({
        organizationId: id,
        userId,
        action: "MIGRATION_MEMBER_IMPORT",
        entityType: "ORGANIZATION",
        entityId: id,
        afterData: { count: importedMembers.length },
      });

      return importedMembers;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
