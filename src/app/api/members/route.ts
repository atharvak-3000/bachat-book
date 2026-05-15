import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);

    const members = await prisma.member.findMany({
      where: {
        organizationId: admin.organizationId,
        isActive: true,
      },
      orderBy: {
        memberNumber: "asc",
      },
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("GET /api/members error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await requireAdmin(userId);
    const body = await req.json();
    const { name, phone, joiningDate, role } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Calculate next member number
    const lastMember = await prisma.member.findFirst({
      where: { organizationId: admin.organizationId },
      orderBy: { memberNumber: "desc" },
    });

    const memberNumber = lastMember ? lastMember.memberNumber + 1 : 1;

    const member = await prisma.member.create({
      data: {
        name,
        phone,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        role: role || "MEMBER",
        memberNumber,
        organizationId: admin.organizationId,
      },
    });

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("POST /api/members error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
