"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoanIssuanceForm({ meetingId, members, defaultRate, onLoanIssued }: any) {
  const [formData, setFormData] = useState({
    memberId: "",
    loanAmount: "",
    interestRate: defaultRate.toString(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.loanAmount) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/loans-issued`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          loanAmount: parseInt(formData.loanAmount) * 100,
          interestRate: parseFloat(formData.interestRate),
        }),
      });

      if (res.ok) {
        const newLoan = await res.json();
        onLoanIssued(newLoan);
        setFormData({ ...formData, memberId: "", loanAmount: "" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Issue New Loan</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-orange-500"
          value={formData.memberId}
          onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
        >
          <option value="">Select Member</option>
          {members.map((m: any) => (
            <option key={m.id} value={m.id}>{m.name} (#{m.memberNumber})</option>
          ))}
        </select>
        
        <div className="flex gap-2">
          <input
            required
            type="number"
            placeholder="Amount (₹)"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
            value={formData.loanAmount}
            onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
          />
          <input
            required
            type="number"
            step="0.1"
            placeholder="Rate %"
            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 shadow-sm"
        >
          {loading ? "Processing..." : "Issue Loan"}
        </Button>
      </form>
    </div>
  );
}
