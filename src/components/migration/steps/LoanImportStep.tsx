"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LoanImportStep({ onComplete, organizationId }: any) {
  const [loading, setLoading] = useState(false);
  const [membersWithLoans, setMembersWithLoans] = useState<any[]>([]);

  useEffect(() => {
    // Fetch members of this org who have outstanding balance from OpeningBalance
    const fetchMembers = async () => {
      const res = await fetch(`/api/organizations/${organizationId}/migration/members-with-loans`);
      if (res.ok) {
        const data = await res.json();
        setMembersWithLoans(data.map((m: any) => ({
          ...m,
          originalAmount: m.loanOutstanding, // default to outstanding if original unknown
          interestRate: 2.0,
          disbursedDate: new Date().toISOString().split("T")[0],
        })));
      }
    };
    fetchMembers();
  }, [organizationId]);

  const updateLoan = (index: number, field: string, value: any) => {
    const updated = [...membersWithLoans];
    updated[index][field] = value;
    setMembersWithLoans(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/migration/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loans: membersWithLoans }),
      });

      if (res.ok) {
        onComplete();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to import loans");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Finalize Active Loans / कर्ज माहिती पूर्ण करा</h3>
        <p className="text-sm text-gray-500">Provide details for members who have active loans.</p>
      </div>

      <div className="space-y-4">
        {membersWithLoans.map((loan, idx) => (
          <div key={idx} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Member</label>
              <p className="font-bold text-gray-900">{loan.name}</p>
            </div>
            
            <div className="w-32">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Original (₹)</label>
              <input
                type="number"
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-100 outline-none"
                value={loan.originalAmount}
                onChange={(e) => updateLoan(idx, "originalAmount", Number(e.target.value))}
              />
            </div>

            <div className="w-32">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Outstanding (₹)</label>
              <p className="px-4 py-2 font-bold text-red-600">₹{loan.loanOutstanding}</p>
            </div>

            <div className="w-24">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Rate (%)</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-100 outline-none"
                value={loan.interestRate}
                onChange={(e) => updateLoan(idx, "interestRate", Number(e.target.value))}
              />
            </div>

            <div className="w-40">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Disbursed Date</label>
              <input
                type="date"
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-100 outline-none"
                value={loan.disbursedDate}
                onChange={(e) => updateLoan(idx, "disbursedDate", e.target.value)}
              />
            </div>
          </div>
        ))}

        {membersWithLoans.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No active loans to import</p>
            <Button onClick={onComplete} variant="link" className="text-orange-600 mt-2">Skip this step</Button>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-gray-50 flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg"
        >
          {loading ? "Finishing..." : "Complete Setup / सेटअप पूर्ण करा"}
        </Button>
      </div>
    </div>
  );
}
