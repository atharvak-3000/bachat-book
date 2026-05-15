import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentMember } from "@/lib/auth";
import { formatRupees, calcMeetingTotals } from "@/lib/calculations";
import Link from "next/link";

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await getCurrentMember(userId);
  if (!admin || admin.role !== "ADMIN") redirect("/onboarding");

  // Fetch stats
  const [
    memberCount,
    totalSavingsData,
    activeLoans,
    latestMeeting,
    recentMeetings,
  ] = await Promise.all([
    prisma.member.count({ where: { organizationId: admin.organizationId, isActive: true } }),
    prisma.meetingContribution.aggregate({
      where: { meeting: { organizationId: admin.organizationId } },
      _sum: { savingsAmount: true },
    }),
    prisma.loan.findMany({
      where: { organizationId: admin.organizationId, status: "ACTIVE" },
    }),
    prisma.meeting.findFirst({
      where: { organizationId: admin.organizationId },
      orderBy: { meetingDate: "desc" },
      include: { contributions: true, expenses: true },
    }),
    prisma.meeting.findMany({
      where: { organizationId: admin.organizationId },
      orderBy: { meetingDate: "desc" },
      take: 5,
      include: { contributions: true, expenses: true },
    }),
  ]);

  const totalCorpus = totalSavingsData._sum.savingsAmount || 0;
  const activeLoansCount = activeLoans.length;
  const totalOutstanding = activeLoans.reduce((acc, l) => acc + l.outstandingAmount, 0);

  // This month's collection (from latest meeting)
  let latestCollection = 0;
  if (latestMeeting) {
    const totals = calcMeetingTotals(
      latestMeeting.contributions,
      0, // loans issued calculation would need more data here, but we just want receipts
      0,
      0,
      latestMeeting.openingBalance
    );
    latestCollection = totals.totalReceipts;
  }

  // Alerts logic
  const today = new Date();
  const overdueLoans = activeLoans.filter(l => {
    const days = (today.getTime() - new Date(l.disbursedDate).getTime()) / (1000 * 60 * 60 * 24);
    return days > 90;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500">Overview of {admin.organization.name}</p>
        </div>
        <Link 
          href="/meetings" 
          className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-orange-700 transition-all"
        >
          New Meeting
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Members" value={memberCount.toString()} subValue="Active now" />
        <StatCard title="Total Corpus" value={formatRupees(totalCorpus)} subValue="Total Savings" />
        <StatCard title="Active Loans" value={activeLoansCount.toString()} subValue={formatRupees(totalOutstanding)} />
        <StatCard title="Latest Collection" value={formatRupees(latestCollection)} subValue={latestMeeting?.monthYear || "No meetings"} />
      </div>

      {/* Alerts Section */}
      {(overdueLoans.length > 0 || !latestMeeting || latestMeeting.status === "DRAFT") && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Alerts & Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overdueLoans.length > 0 && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                <div className="text-red-600 font-bold">⚠️ Overdue:</div>
                <div className="text-red-800 text-sm">{overdueLoans.length} loans older than 90 days.</div>
              </div>
            )}
            {(!latestMeeting) && (
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                <div className="text-orange-600 font-bold">📅 Setup:</div>
                <div className="text-orange-800 text-sm">Start your first monthly meeting.</div>
              </div>
            )}
            {latestMeeting?.status === "DRAFT" && (
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex items-start gap-3">
                <div className="text-yellow-700 font-bold">📝 Pending:</div>
                <div className="text-yellow-800 text-sm">{latestMeeting.monthYear} meeting is still in DRAFT.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Meetings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Recent Meetings</h3>
          <Link href="/meetings" className="text-sm text-orange-600 font-bold hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Receipts</th>
                <th className="px-6 py-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentMeetings.map((meeting) => {
                const totals = calcMeetingTotals(meeting.contributions, 0, 0, 0, meeting.openingBalance);
                return (
                  <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{meeting.monthYear}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        meeting.status === "FINALIZED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{formatRupees(totals.totalReceipts)}</td>
                    <td className="px-6 py-4 text-right font-bold text-orange-600">{formatRupees(totals.closingBalance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue }: { title: string; value: string; subValue: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{subValue}</p>
    </div>
  );
}
