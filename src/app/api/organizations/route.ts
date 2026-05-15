import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getCurrentMember } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { gatName, village, district, adminClerkId, adminName } = body;

    if (!gatName || !village || !district) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const organization = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: gatName,
          village,
          district,
        },
      });

      await tx.member.create({
        data: {
          name: adminName,
          clerkUserId: adminClerkId,
          organizationId: org.id,
          role: "ADMIN",
          memberNumber: 1,
        },
      });

      return org;
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
