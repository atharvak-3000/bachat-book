"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NewMeetingDialog({ defaultOpeningBalance = 0 }: { defaultOpeningBalance?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    meetingDate: new Date().toISOString().split("T")[0],
    monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    openingBalance: defaultOpeningBalance.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          openingBalance: parseInt(formData.openingBalance) * 100, // convert to paise
        }),
      });

      if (res.ok) {
        const meeting = await res.json();
        setIsOpen(false);
        router.push(`/meetings/${meeting.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create meeting");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 shadow-lg"
      >
        New Meeting
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Meeting</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Meeting Date / तारीख</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.meetingDate}
                  onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Month & Year / महिना आणि वर्ष</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. May 2024"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.monthYear}
                  onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">Must be unique for each meeting.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Opening Balance / मागील शिल्लक (₹)</label>
                <input
                  required
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg"
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
