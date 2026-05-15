"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ExpenseForm({ meetingId, onExpenseAdded }: any) {
  const [formData, setFormData] = useState({
    category: "OTHER",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseInt(formData.amount) * 100,
        }),
      });

      if (res.ok) {
        const newExpense = await res.json();
        onExpenseAdded(newExpense);
        setFormData({ category: "OTHER", amount: "", description: "" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Add Other Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <select
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-orange-500"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="STATIONERY">Stationery</option>
            <option value="BANK_CHARGES">Bank Charges</option>
            <option value="REFRESHMENTS">Refreshments</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            required
            type="number"
            placeholder="Amount (₹)"
            className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        
        <input
          type="text"
          placeholder="Description (optional)"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 shadow-sm border-none"
        >
          {loading ? "Adding..." : "Add Expense"}
        </Button>
      </form>
    </div>
  );
}
