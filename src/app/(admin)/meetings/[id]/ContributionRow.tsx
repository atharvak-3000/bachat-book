"use client";

import { useState, useCallback } from "react";
import debounce from "lodash/debounce";
import { formatRupees } from "@/lib/calculations";

export default function ContributionRow({ contribution, isReadOnly, onUpdate, adminSettings }: any) {
  const [data, setData] = useState({
    savingsAmount: (contribution.savingsAmount / 100).toString(),
    loanRepayment: (contribution.loanRepayment / 100).toString(),
    interestPaid: (contribution.interestPaid / 100).toString(),
    penaltyPaid: (contribution.penaltyPaid / 100).toString(),
    isPresent: contribution.isPresent,
  });

  const [saving, setSaving] = useState(false);

  // Debounced patch call
  const debouncedPatch = useCallback(
    debounce(async (newData: any) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/meetings/${contribution.meetingId}/contributions/${contribution.memberId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            savingsAmount: parseInt(newData.savingsAmount) * 100,
            loanRepayment: parseInt(newData.loanRepayment) * 100,
            interestPaid: parseInt(newData.interestPaid) * 100,
            penaltyPaid: parseInt(newData.penaltyPaid) * 100,
            isPresent: newData.isPresent,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          // We don't necessarily need to call onUpdate with the full object from DB 
          // but we do it to keep sync.
          onUpdate({ ...contribution, ...newData, 
            savingsAmount: parseInt(newData.savingsAmount) * 100,
            loanRepayment: parseInt(newData.loanRepayment) * 100,
            interestPaid: parseInt(newData.interestPaid) * 100,
            penaltyPaid: parseInt(newData.penaltyPaid) * 100,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    }, 500),
    []
  );

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    let newData = { ...data, [name]: newValue };

    // Auto-logic
    if (name === "isPresent") {
      if (checked) {
        // Auto-fill savings from settings if currently 0
        if (parseInt(data.savingsAmount) === 0) {
          newData.savingsAmount = (adminSettings.monthlySavingsTarget / 100).toString();
        }
      } else {
        // Auto-apply penalty if absent
        newData.penaltyPaid = (adminSettings.defaultPenaltyAmount / 100).toString();
        newData.savingsAmount = "0";
      }
    }

    setData(newData);
    debouncedPatch(newData);
  };

  const activeLoan = contribution.member.loans[0]; // Assuming only one active loan

  return (
    <tr className={`hover:bg-gray-50/80 transition-colors ${!data.isPresent ? "bg-gray-50 opacity-60" : ""}`}>
      <td className="px-4 py-3 font-mono text-[10px] text-gray-400">{contribution.member.memberNumber}</td>
      <td className="px-4 py-3 min-w-[150px]">
        <p className="font-bold text-gray-900 text-sm">{contribution.member.name}</p>
        {activeLoan && (
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter mt-0.5">
            Loan: {formatRupees(activeLoan.outstandingAmount)}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <input
          type="checkbox"
          name="isPresent"
          disabled={isReadOnly}
          checked={data.isPresent}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          name="savingsAmount"
          disabled={isReadOnly || !data.isPresent}
          value={data.savingsAmount}
          onChange={handleChange}
          className="w-full bg-transparent border-b border-gray-200 focus:border-orange-500 outline-none text-sm font-medium px-1 py-0.5"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          name="loanRepayment"
          disabled={isReadOnly || !data.isPresent || !activeLoan}
          value={data.loanRepayment}
          onChange={handleChange}
          className="w-full bg-transparent border-b border-gray-200 focus:border-orange-500 outline-none text-sm font-medium px-1 py-0.5"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          name="interestPaid"
          disabled={isReadOnly || !data.isPresent || !activeLoan}
          value={data.interestPaid}
          onChange={handleChange}
          className="w-full bg-transparent border-b border-gray-200 focus:border-orange-500 outline-none text-sm font-medium px-1 py-0.5"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          name="penaltyPaid"
          disabled={isReadOnly || !data.isPresent}
          value={data.penaltyPaid}
          onChange={handleChange}
          className="w-full bg-transparent border-b border-gray-200 focus:border-orange-500 outline-none text-sm font-medium px-1 py-0.5"
        />
      </td>
    </tr>
  );
}
