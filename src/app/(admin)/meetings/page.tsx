import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { formatRupees, calcMeetingTotals } from "@/lib/calculations";
import NewMeetingDialog from "@/components/meetings/NewMeetingDialog";

export default async function MeetingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await requireAdmin(userId);

  const meetings = await prisma.meeting.findMany({
    where: { organizationId: admin.organizationId },
    orderBy: { meetingDate: "desc" },
    include: {
      contributions: true,
      expenses: true,
      // For loans issued we'd need to link them to the meeting.
      // Since our schema doesn't have a direct link yet (only disbursedDate), 
      // we'll assume a simplified calculation for now.
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Monthly Meetings</h2>
          <p className="text-gray-500">Record savings, repayments, and expenses</p>
        </div>
        <NewMeetingDialog defaultOpeningBalance={0} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Receipts</th>
                <th className="px-6 py-4 text-right">Expenses</th>
                <th className="px-6 py-4 text-right">Closing Balance</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {meetings.map((meeting) => {
                const totals = calcMeetingTotals(
                  meeting.contributions,
                  [], // Loans issued not directly linked in this view
                  meeting.expenses,
                  meeting.openingCash,
                  meeting.openingBank
                );

                return (
                  <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{meeting.monthYear}</p>
                      <p className="text-xs text-gray-400">{new Date(meeting.meetingDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        meeting.status === "FINALIZED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">{formatRupees(totals.totalReceipts)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-500">{formatRupees(totals.totalPayments)}</td>
                    <td className="px-6 py-4 text-right font-bold text-orange-600">{formatRupees(totals.closingBalance)}</td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/meetings/${meeting.id}`}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          meeting.status === "FINALIZED" 
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                            : "bg-orange-600 text-white hover:bg-orange-700"
                        }`}
                      >
                        {meeting.status === "FINALIZED" ? "View" : "Continue"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {meetings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    No meetings found. Start by creating a new meeting.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
