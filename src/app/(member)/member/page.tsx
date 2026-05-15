import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentMember } from "@/lib/auth";
import { formatRupees, calcMemberStats } from "@/lib/calculations";
import { format } from "date-fns";

export default async function MemberPortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const member = await getCurrentMember(userId);
  if (!member) redirect("/onboarding");

  if (member.role === "ADMIN") {
    redirect("/dashboard");
  }

  const memberWithDetails = await prisma.member.findUnique({
    where: { id: member.id },
    include: {
      contributions: {
        include: { meeting: true },
        orderBy: { meeting: { meetingDate: "desc" } },
        take: 12,
      },
      loans: {
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!memberWithDetails) redirect("/onboarding");

  const stats = calcMemberStats(memberWithDetails.contributions, memberWithDetails.loans);
  const activeLoan = memberWithDetails.loans[0];

  // Attendance calculation
  const last12Contributions = memberWithDetails.contributions;
  const presentCount = last12Contributions.filter(c => c.isPresent).length;
  const attendanceRate = last12Contributions.length > 0 
    ? Math.round((presentCount / last12Contributions.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      <div className="bg-orange-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">नमस्कार (Welcome),</p>
          <h2 className="text-4xl font-bold">{member.name}</h2>
          <p className="text-orange-200 mt-2 font-medium">{member.organization.name}</p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6.02-3.22.03-1.99 4.02-3.08 6.02-3.08 1.99 0 5.99 1.09 6.02 3.08-1.31 1.94-3.52 3.22-6.02 3.22z"/></svg>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MemberStatCard label="माझी एकूण बचत" subLabel="My Total Savings" value={formatRupees(stats.totalSavings)} />
        <MemberStatCard label="थकीत कर्ज" subLabel="Outstanding Loan" value={formatRupees(stats.outstandingLoan)} color="text-red-600" />
        <MemberStatCard label="व्याज" subLabel="Interest Paid" value={formatRupees(stats.totalInterestPaid)} color="text-orange-600" />
        <MemberStatCard label="हजेरी" subLabel="Attendance" value={`${attendanceRate}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Loan Progress */}
        {activeLoan && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex justify-between">
              माझे कर्ज <span>My Loan</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{formatRupees(activeLoan.outstandingAmount)}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase">थकीत रक्कम / Outstanding</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-gray-400 font-bold uppercase">Disbursed</p>
                  <p className="font-bold text-gray-700">{format(new Date(activeLoan.disbursedDate), "MMM d, yyyy")}</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((activeLoan.loanAmount - activeLoan.outstandingAmount) / activeLoan.loanAmount) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                <span>0% Repaid</span>
                <span>{formatRupees(activeLoan.loanAmount)} Total</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Contributions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">माझे व्यवहार <span>History</span></h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3 text-right">Savings</th>
                <th className="px-6 py-3 text-right">Repaid</th>
                <th className="px-6 py-3 text-right">Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {memberWithDetails.contributions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{c.meeting.monthYear}</td>
                  <td className="px-6 py-4 text-right text-green-600 font-medium">{formatRupees(c.savingsAmount)}</td>
                  <td className="px-6 py-4 text-right text-gray-900">{formatRupees(c.loanRepayment)}</td>
                  <td className="px-6 py-4 text-right text-orange-600">{formatRupees(c.interestPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MemberStatCard({ label, subLabel, value, color = "text-gray-900" }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest mt-1">{subLabel}</p>
    </div>
  );
}
