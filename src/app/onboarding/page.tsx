"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gatName: "",
    village: "",
    district: "",
  });

  if (!isLoaded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          adminClerkId: user.id,
          adminName: user.fullName || user.username || "Admin",
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        // Handle error if needed
        console.error("Failed to create organization");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">BachatBook</h1>
          <p className="text-orange-800 font-medium mt-2">
            बचत गट नोंदणी (Onboarding)
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Welcome, {user?.firstName}! Please provide your Gat details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              बचत गटाचे नाव / Gat Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="gatName"
              value={formData.gatName}
              onChange={handleChange}
              placeholder="e.g. Mahila Bachat Gat"
              className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              गाव / Village <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
              placeholder="Enter village name"
              className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              जिल्हा / District <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Enter district name"
              className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                नोंदणी होत आहे... / Registering...
              </span>
            ) : (
              "नोंदणी करा / Register Gat"
            )}
          </Button>
        </form>
        <div className="text-center pt-6 border-t border-gray-100 mt-6">
          <p className="text-sm text-gray-500">
            Already have a group?{" "}
            <Link href="/join" className="text-orange-600 font-bold hover:underline">
              Join an existing Bachat Gat
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
