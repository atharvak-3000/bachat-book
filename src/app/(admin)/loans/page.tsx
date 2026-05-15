import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatRupees } from "@/lib/calculations";
import { format } from "date-fns";
import Link from "next/link";

export default async function LoansPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await requireAdmin(userId);

  const loans = await prisma.loan.findMany({
    where: { organizationId: admin.organizationId },
    include: { member: true },
    orderBy: { disbursedDate: "desc" },
  });

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Loans Management</h2>
          <p className="text-gray-500">Track outstanding amounts and interest</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Disbursed</th>
                <th className="px-6 py-4">Outstanding</th>
                <th className="px-6 py-4 text-center">Rate</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loans.map((loan) => {
                const daysActive = Math.floor((today.getTime() - new Date(loan.disbursedDate).getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = loan.status === "ACTIVE" && daysActive > 90;

                return (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/members/${loan.memberId}`} className="font-bold text-gray-900 hover:text-orange-600">
                        {loan.member.name}
                      </Link>
                      <p className="text-[10px] text-gray-400 font-mono">#{loan.member.memberNumber}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{formatRupees(loan.loanAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(loan.disbursedDate), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4">
                      <p className={`font-bold ${isOverdue ? "text-red-600" : "text-gray-900"}`}>{formatRupees(loan.outstandingAmount)}</p>
                      {loan.status === "ACTIVE" && <p className="text-[10px] text-gray-400 font-bold uppercase">{daysActive} days active</p>}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium">{loan.interestRate}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        loan.status === "ACTIVE" 
                          ? (isOverdue ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700") 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {isOverdue ? "Overdue" : loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/members/${loan.memberId}`}
                        className="text-xs font-bold text-orange-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                    No loans issued yet.
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
