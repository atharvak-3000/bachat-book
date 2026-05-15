"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import GroupFinancialsStep from "./steps/GroupFinancialsStep";
import MemberImportStep from "./steps/MemberImportStep";
import LoanImportStep from "./steps/LoanImportStep";
import { toast } from "sonner";

export default function MigrationWizard({ organization }: any) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<"NEW" | "EXISTING" | null>(null);
  const router = useRouter();

  if (step === 1 && !type) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setType("NEW")}
          className="p-10 bg-white rounded-3xl border-2 border-orange-50 hover:border-orange-500 hover:shadow-2xl transition-all text-center space-y-4 group"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto text-orange-600 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">नवीन बचत गट (New Gat)</h3>
            <p className="text-gray-500 text-sm">Starting fresh with zero balances.</p>
          </div>
        </button>

        <button
          onClick={() => {
            setType("EXISTING");
            setStep(2);
          }}
          className="p-10 bg-white rounded-3xl border-2 border-orange-50 hover:border-orange-500 hover:shadow-2xl transition-all text-center space-y-4 group"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">चालू बचत गट (Existing Gat)</h3>
            <p className="text-gray-500 text-sm">Migrating years of historical data.</p>
          </div>
        </button>
      </div>
    );
  }

  if (type === "NEW") {
    // Just finish setup
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {step - 1}
          </span>
          <h2 className="font-bold text-gray-900">
            {step === 2 && "Group Financials / गटाची आर्थिक माहिती"}
            {step === 3 && "Member Import / सभासद माहिती"}
            {step === 4 && "Active Loans / चालू कर्ज माहिती"}
          </h2>
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Step {step - 1} of 3
        </div>
      </div>

      <div className="p-8">
        {step === 2 && (
          <GroupFinancialsStep 
            onNext={() => setStep(3)} 
            organizationId={organization.id} 
          />
        )}
        {step === 3 && (
          <MemberImportStep 
            onNext={() => setStep(4)} 
            organizationId={organization.id} 
          />
        )}
        {step === 4 && (
          <LoanImportStep 
            onComplete={() => router.push("/dashboard")} 
            organizationId={organization.id} 
          />
        )}
      </div>
    </div>
  );
}
