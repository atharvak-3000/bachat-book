import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import MeetingClient from "./MeetingClient";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await requireAdmin(userId);
  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      contributions: {
        include: {
          member: {
            include: {
              loans: {
                where: { status: "ACTIVE" },
              },
            },
          },
        },
        orderBy: {
          member: {
            memberNumber: "asc",
          },
        },
      },
      expenses: true,
      organization: true,
    },
  });

  if (!meeting || meeting.organizationId !== admin.organizationId) {
    notFound();
  }

  // Fetch loans issued during this meeting (using disbursedDate as a proxy)
  const loansIssued = await prisma.loan.findMany({
    where: {
      organizationId: admin.organizationId,
      disbursedDate: meeting.meetingDate,
    },
  });

  return (
    <MeetingClient 
      initialMeeting={meeting} 
      initialLoansIssued={loansIssued}
      adminSettings={meeting.organization}
    />
  );
}
