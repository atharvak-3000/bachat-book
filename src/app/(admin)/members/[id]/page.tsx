import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentMember } from "@/lib/auth";
import { formatRupees, calcMemberStats } from "@/lib/calculations";
import { format } from "date-fns";

export default async function MemberPassbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await getCurrentMember(userId);
  if (!admin) redirect("/onboarding");

  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      contributions: {
        include: { meeting: true },
        orderBy: { meeting: { meetingDate: "desc" } },
      },
      loans: {
        orderBy: { disbursedDate: "desc" },
      },
    },
  });

  if (!member || member.organizationId !== admin.organizationId) {
    notFound();
  }

  const stats = calcMemberStats(member.contributions, member.loans);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-900">{member.name}</h2>
            <span className="bg-gray-100 text-gray-500 font-mono text-xs px-2 py-1 rounded">#{member.memberNumber}</span>
          </div>
          <p className="text-gray-500 mt-1">
            Joined on {format(new Date(member.joiningDate), "MMMM d, yyyy")} • {member.phone || "No phone"}
          </p>
        </div>
        <div className="flex gap-2">
           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
             member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
           }`}>
             {member.isActive ? "Active" : "Inactive"}
           </span>
           <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-700">
             {member.role}
           </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatItem label="Total Savings" value={formatRupees(stats.totalSavings)} color="text-green-600" />
        <StatItem label="Outstanding Loan" value={formatRupees(stats.outstandingLoan)} color="text-red-600" />
        <StatItem label="Interest Paid" value={formatRupees(stats.totalInterestPaid)} color="text-orange-600" />
        <StatItem label="Net Position" value={formatRupees(stats.netPosition)} color={stats.netPosition >= 0 ? "text-green-700" : "text-red-700"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contribution History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">Monthly Contribution History</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3 text-right">Savings</th>
                <th className="px-6 py-3 text-right">Repaid</th>
                <th className="px-6 py-3 text-right">Interest</th>
                <th className="px-6 py-3 text-right">Penalty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {member.contributions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{c.meeting.monthYear}</td>
                  <td className="px-6 py-4 text-right text-green-600">{formatRupees(c.savingsAmount)}</td>
                  <td className="px-6 py-4 text-right text-gray-900">{formatRupees(c.loanRepayment)}</td>
                  <td className="px-6 py-4 text-right text-orange-600">{formatRupees(c.interestPaid)}</td>
                  <td className="px-6 py-4 text-right text-red-500">{formatRupees(c.penaltyPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loan History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">Active & Past Loans</h3>
          </div>
          <div className="p-6 space-y-4">
            {member.loans.map((loan) => (
              <div key={loan.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{formatRupees(loan.loanAmount)}</p>
                    <p className="text-xs text-gray-500">Disbursed: {format(new Date(loan.disbursedDate), "MMM d, yyyy")}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    loan.status === "ACTIVE" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {loan.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-400 uppercase font-bold">Outstanding</p>
                    <p className="text-sm font-bold text-red-600">{formatRupees(loan.outstandingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-bold">Interest Rate</p>
                    <p className="text-sm font-bold">{loan.interestRate}%</p>
                  </div>
                </div>
              </div>
            ))}
            {member.loans.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8 italic">No loans found for this member.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
