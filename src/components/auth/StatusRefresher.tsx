"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StatusRefresher() {
  const router = useRouter();

  useEffect(() => {
    // Poll for status update every 5 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <button 
      onClick={() => router.refresh()}
      className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 mx-auto"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Check Status / स्थिती तपासा
    </button>
  );
}
