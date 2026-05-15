"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function JoinClient({ initialOrganizations }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const filteredOrgs = initialOrganizations.filter((org: any) => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoin = async (orgId: string) => {
    const phone = prompt("Please enter your 10-digit phone number:");
    if (!phone || phone.length !== 10) {
      alert("Valid phone number required");
      return;
    }

    setLoadingId(orgId);
    try {
      const res = await fetch("/api/join-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, phone }),
      });

      if (res.ok) {
        router.push("/pending-approval");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send request");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by name or village..."
          className="w-full px-6 py-4 rounded-2xl border border-orange-100 shadow-sm outline-none focus:ring-4 focus:ring-orange-100 transition-all text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org: any) => (
          <div key={org.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                {org.name[0]}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{org.name}</h3>
              <p className="text-gray-500 text-sm font-medium">{org.village}, {org.district}</p>
            </div>
            
            <Button
              onClick={() => handleJoin(org.id)}
              disabled={loadingId === org.id}
              className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 rounded-xl"
            >
              {loadingId === org.id ? "Sending..." : "Join Gat / सामील व्हा"}
            </Button>
          </div>
        ))}
      </div>

      {filteredOrgs.length === 0 && (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">No groups found matching your search</p>
        </div>
      )}

      <div className="text-center pt-8">
        <p className="text-gray-500 text-sm">
          Don't see your group?{" "}
          <button onClick={() => router.push("/onboarding")} className="text-orange-600 font-bold hover:underline">
            Create a new Bachat Gat
          </button>
        </p>
      </div>
    </div>
  );
}
