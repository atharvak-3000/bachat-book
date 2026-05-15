import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await requireAdmin(userId);

  // Fetch data for reports
  const meetings = await prisma.meeting.findMany({
    where: {
      organizationId: admin.organizationId,
      status: "FINALIZED",
    },
    include: {
      contributions: true,
    },
    orderBy: {
      meetingDate: "asc",
    },
  });

  // Transform data for charts
  const chartData = meetings.map((m) => {
    const totalSavings = m.contributions.reduce((acc, c) => acc + c.savingsAmount, 0) / 100;
    return {
      month: m.monthYear,
      savings: totalSavings,
    };
  });

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Financial Reports / आर्थिक अहवाल</h2>
        <p className="text-gray-500">Visual overview of your group's financial health.</p>
      </div>

      <ReportsClient data={chartData} />
    </div>
  );
}
