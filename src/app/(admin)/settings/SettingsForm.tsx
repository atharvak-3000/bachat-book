"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SettingsForm({ organization }: { organization: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    village: organization.village,
    district: organization.district,
    defaultInterestRate: organization.defaultInterestRate.toString(),
    defaultPenaltyAmount: (organization.defaultPenaltyAmount / 100).toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          defaultInterestRate: parseFloat(formData.defaultInterestRate),
          defaultPenaltyAmount: parseInt(formData.defaultPenaltyAmount) * 100,
        }),
      });

      if (res.ok) {
        alert("Settings updated successfully");
        router.refresh();
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Gat Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Gat Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Village / गाव</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.village}
              onChange={(e) => setFormData({...formData, village: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">District / जिल्हा</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Financial Defaults</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Default Interest Rate (% Monthly)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.defaultInterestRate}
              onChange={(e) => setFormData({...formData, defaultInterestRate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Default Absence Penalty (₹)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.defaultPenaltyAmount}
              onChange={(e) => setFormData({...formData, defaultPenaltyAmount: e.target.value})}
            />
          </div>
        </div>
      </section>

      <Button
        type="submit"
        disabled={loading}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-12 h-12 shadow-lg"
      >
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
