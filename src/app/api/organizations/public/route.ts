import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        village: true,
        district: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(organizations);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
