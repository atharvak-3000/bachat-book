import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { organizationId, phone } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    // Check if already a member of ANY organization
    const existingMember = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    });

    if (existingMember) {
      return NextResponse.json({ error: "You are already a member of an organization" }, { status: 400 });
    }

    // Check if duplicate request
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        clerkUserId: userId,
        organizationId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "You already have a pending request for this organization" }, { status: 400 });
    }

    const joinRequest = await prisma.joinRequest.create({
      data: {
        clerkUserId: userId,
        organizationId,
        name: user.fullName || "User",
        phone,
        status: "PENDING",
      },
    });

    return NextResponse.json(joinRequest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
