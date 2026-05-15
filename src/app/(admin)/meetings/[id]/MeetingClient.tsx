"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calcMeetingTotals, formatRupees } from "@/lib/calculations";
import ContributionRow from "./ContributionRow";
import SummaryPanel from "./SummaryPanel";
import LoanIssuanceForm from "./LoanIssuanceForm";
import ExpenseForm from "./ExpenseForm";
import { Button } from "@/components/ui/button";

export default function MeetingClient({ initialMeeting, initialLoansIssued, adminSettings }: any) {
  const router = useRouter();
  const [meeting, setMeeting] = useState(initialMeeting);
  const [loansIssued, setLoansIssued] = useState(initialLoansIssued);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const totals = useMemo(() => {
    return calcMeetingTotals(
      meeting.contributions,
      loansIssued,
      meeting.expenses,
      meeting.openingCash || 0,
      meeting.openingBank || 0
    );
  }, [meeting, loansIssued]);

  const handleContributionUpdate = (updatedContribution: any) => {
    setMeeting((prev: any) => ({
      ...prev,
      contributions: prev.contributions.map((c: any) => 
        c.id === updatedContribution.id ? { ...c, ...updatedContribution } : c
      ),
    }));
  };

  const handleFinalize = async () => {
    if (!confirm("Are you sure you want to finalize this meeting? This action cannot be undone.")) return;
    
    setIsFinalizing(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/finalize`, { method: "POST" });
      if (res.ok) {
        router.refresh();
        setMeeting((prev: any) => ({ ...prev, status: "FINALIZED" }));
      } else {
        const err = await res.json();
        alert(err.error || "Finalization failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Data Entry */}
      <div className="flex-1 space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{meeting.monthYear}</h2>
            <p className="text-sm text-gray-500">
              Meeting Status: <span className={`font-bold ${meeting.status === "FINALIZED" ? "text-green-600" : "text-yellow-600"}`}>{meeting.status}</span>
            </p>
          </div>
          <div className="text-right flex gap-6">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Opening Cash</p>
              <p className="text-lg font-bold text-gray-900">{formatRupees(meeting.openingCash || 0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Opening Bank</p>
              <p className="text-lg font-bold text-gray-900">{formatRupees(meeting.openingBank || 0)}</p>
            </div>
          </div>
        </div>

        {/* Contributions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-center">P/A</th>
                  <th className="px-4 py-3">Savings (₹)</th>
                  <th className="px-4 py-3">Loan Repaid (₹)</th>
                  <th className="px-4 py-3">Interest (₹)</th>
                  <th className="px-4 py-3">Penalty (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {meeting.contributions.map((contribution: any) => (
                  <ContributionRow 
                    key={contribution.id} 
                    contribution={contribution} 
                    isReadOnly={meeting.status === "FINALIZED"}
                    onUpdate={handleContributionUpdate}
                    adminSettings={adminSettings}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Secondary Forms */}
        {meeting.status !== "FINALIZED" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoanIssuanceForm 
              meetingId={meeting.id} 
              members={meeting.contributions.map((c: any) => c.member)}
              defaultRate={adminSettings.defaultInterestRate}
              onLoanIssued={(newLoan: any) => setLoansIssued([...loansIssued, newLoan])}
            />
            <ExpenseForm 
              meetingId={meeting.id} 
              onExpenseAdded={(newExpense: any) => setMeeting((prev: any) => ({
                ...prev,
                expenses: [...prev.expenses, newExpense]
              }))}
            />
          </div>
        )}

        {/* Display Issued Loans and Expenses in Read-only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-800 mb-4">Loans Issued</h3>
             <div className="space-y-3">
               {loansIssued.map((loan: any) => (
                 <div key={loan.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                   <div>
                     <p className="font-bold">{meeting.contributions.find((c:any) => c.memberId === loan.memberId)?.member.name}</p>
                     <p className="text-xs text-gray-400">{loan.interestRate}% Interest</p>
                   </div>
                   <p className="font-bold text-orange-600">{formatRupees(loan.loanAmount)}</p>
                 </div>
               ))}
               {loansIssued.length === 0 && <p className="text-xs text-gray-400 italic">No loans issued this meeting.</p>}
             </div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-800 mb-4">Other Expenses</h3>
             <div className="space-y-3">
               {meeting.expenses.map((expense: any) => (
                 <div key={expense.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                   <div>
                     <p className="font-bold">{expense.category}</p>
                     <p className="text-xs text-gray-400">{expense.description || "No description"}</p>
                   </div>
                   <p className="font-bold text-red-500">{formatRupees(expense.amount)}</p>
                 </div>
               ))}
               {meeting.expenses.length === 0 && <p className="text-xs text-gray-400 italic">No expenses recorded.</p>}
             </div>
           </div>
        </div>
      </div>

      {/* Right Column: Live Summary */}
      <div className="w-full lg:w-96">
        <div className="sticky top-24 space-y-6">
          <SummaryPanel totals={totals} openingBalance={meeting.openingBalance} />
          
          {meeting.status !== "FINALIZED" && (
            <div className="space-y-4">
              {totals.closingBalance < 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 font-bold">
                  ⚠️ Warning: Closing balance is negative. Please check entries.
                </div>
              )}
              <Button 
                onClick={handleFinalize}
                disabled={isFinalizing || totals.closingBalance < 0}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-14 shadow-xl text-lg uppercase tracking-wider"
              >
                {isFinalizing ? "Finalizing..." : "Finalize Meeting"}
              </Button>
              <p className="text-[10px] text-gray-400 text-center uppercase font-bold px-4">
                Finalizing will lock all entries and update loan balances permanently.
              </p>
            </div>
          )}

          {meeting.status === "FINALIZED" && (
            <div className="space-y-4">
              <Button 
                onClick={async () => {
                  if (!confirm("Reopening will allow edits but may affect subsequent data. Reopen?")) return;
                  const res = await fetch(`/api/meetings/${meeting.id}/reopen`, { method: "PATCH" });
                  if (res.ok) router.refresh();
                  else {
                    const err = await res.json();
                    alert(err.error || "Failed to reopen");
                  }
                }}
                variant="outline"
                className="w-full border-orange-200 text-orange-600 font-bold h-12 rounded-xl"
              >
                Reopen Meeting (Admin Only)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
