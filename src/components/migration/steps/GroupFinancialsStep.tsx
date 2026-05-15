"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GroupFinancialsStep({ onNext, organizationId }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    openingCashBalance: 0,
    openingBankBalance: 0,
    totalCorpus: 0,
    monthlySavingsTarget: 100,
    defaultInterestRate: 2.0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/migration/financials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onNext();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save financials");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Opening Balances / सुरुवातीची शिल्लक</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Cash in Hand / हातात रोख (₹)</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              value={formData.openingCashBalance}
              onChange={(e) => setFormData({ ...formData, openingCashBalance: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Bank Balance / बँक शिल्लक (₹)</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              value={formData.openingBankBalance}
              onChange={(e) => setFormData({ ...formData, openingBankBalance: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Group Settings / गटाचे नियम</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Monthly Savings / मासिक बचत (₹)</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              value={formData.monthlySavingsTarget}
              onChange={(e) => setFormData({ ...formData, monthlySavingsTarget: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Default Interest Rate / व्याज दर (%)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              value={formData.defaultInterestRate}
              onChange={(e) => setFormData({ ...formData, defaultInterestRate: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex justify-end">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-8 rounded-xl"
        >
          {loading ? "Saving..." : "Save and Continue / जतन करा"}
        </Button>
      </div>
    </form>
  );
}
