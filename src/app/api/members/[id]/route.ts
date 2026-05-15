import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getCurrentMember } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentMember = await getCurrentMember(userId);
    if (!currentMember) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        contributions: {
          include: {
            meeting: true,
          },
          orderBy: {
            meeting: {
              meetingDate: "desc",
            },
          },
        },
        loans: {
          orderBy: {
            disbursedDate: "desc",
          },
        },
      },
    });

    if (!member || member.organizationId !== currentMember.organizationId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentMember = await getCurrentMember(userId);
    if (!currentMember || currentMember.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, isActive, role } = body;

    const member = await prisma.member.findUnique({ where: { id } });
    if (!member || member.organizationId !== currentMember.organizationId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: { name, phone, isActive, role },
    });

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentMember = await getCurrentMember(userId);
    if (!currentMember || currentMember.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const member = await prisma.member.findUnique({ where: { id } });
    if (!member || member.organizationId !== currentMember.organizationId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Soft delete
    const deletedMember = await prisma.member.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(deletedMember);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
