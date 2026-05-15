"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AddMemberForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    joiningDate: new Date().toISOString().split("T")[0],
    role: "MEMBER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone && formData.phone.length !== 10) {
      alert("Phone number must be 10 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          name: "",
          phone: "",
          joiningDate: new Date().toISOString().split("T")[0],
          role: "MEMBER",
        });
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add member");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name / नाव</label>
        <input
          required
          type="text"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          placeholder="Enter name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone / फोन</label>
        <input
          required
          type="tel"
          maxLength={10}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          placeholder="10 digit number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Joining Date / तारीख</label>
        <input
          required
          type="date"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          value={formData.joiningDate}
          onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role / पद</label>
        <select
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="MEMBER">Member / सदस्य</option>
          <option value="ADMIN">Admin / अध्यक्ष</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 shadow-md"
      >
        {loading ? "Adding..." : "Add Member"}
      </Button>
    </form>
  );
}
