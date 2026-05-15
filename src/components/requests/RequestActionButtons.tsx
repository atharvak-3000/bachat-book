"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RequestActionButtons({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState<"APPROVE" | "REJECT" | null>(null);
  const router = useRouter();

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this request?`)) return;

    setLoading(action);
    try {
      const res = await fetch(`/api/join-request/${requestId}/${action.toLowerCase()}`, {
        method: "PATCH",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        onClick={() => handleAction("APPROVE")}
        disabled={loading !== null}
        className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-3 py-1.5 h-auto rounded-lg shadow-sm"
      >
        {loading === "APPROVE" ? "Wait..." : "Approve"}
      </Button>
      <Button
        onClick={() => handleAction("REJECT")}
        disabled={loading !== null}
        className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[10px] px-3 py-1.5 h-auto rounded-lg border border-red-100"
      >
        {loading === "REJECT" ? "Wait..." : "Reject"}
      </Button>
    </div>
  );
}
