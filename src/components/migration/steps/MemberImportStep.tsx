"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";

export default function MemberImportStep({ onNext, organizationId }: any) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row: any) => ({
          name: row.Name || row.name,
          phone: row.Phone || row.phone,
          savings: Number(row.Savings || row.savings || 0),
          loanOutstanding: Number(row.Loan || row.loan || 0),
        }));
        setMembers(parsedData);
      },
      error: (err) => {
        setError("Failed to parse CSV file");
      }
    });
  };

  const addManualRow = () => {
    setMembers([...members, { name: "", phone: "", savings: 0, loanOutstanding: 0 }]);
  };

  const updateMember = (index: number, field: string, value: any) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async () => {
    if (members.length === 0) {
      alert("Please add at least one member");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/migration/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members }),
      });

      if (res.ok) {
        onNext();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to import members");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Import Members / सभासद जोडा</h3>
          <p className="text-sm text-gray-500">Upload a CSV file or enter members manually.</p>
        </div>
        
        <div className="flex gap-4">
          <label className="bg-white border border-orange-200 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-orange-50 transition-colors">
            Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <Button onClick={addManualRow} variant="outline" className="rounded-xl font-bold">
            Add Manually
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Name / नाव</th>
              <th className="px-6 py-4">Phone / फोन</th>
              <th className="px-6 py-4">Total Savings / एकूण बचत</th>
              <th className="px-6 py-4">Loan Outstanding / शिल्लक कर्ज</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((member, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none font-bold text-gray-900"
                    placeholder="Member Name"
                    value={member.name}
                    onChange={(e) => updateMember(idx, "name", e.target.value)}
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none font-medium text-gray-600"
                    placeholder="10-digit phone"
                    value={member.phone}
                    onChange={(e) => updateMember(idx, "phone", e.target.value)}
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    className="w-full bg-transparent outline-none font-bold text-orange-600"
                    value={member.savings}
                    onChange={(e) => updateMember(idx, "savings", Number(e.target.value))}
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    className="w-full bg-transparent outline-none font-bold text-red-600"
                    value={member.loanOutstanding}
                    onChange={(e) => updateMember(idx, "loanOutstanding", Number(e.target.value))}
                  />
                </td>
                <td className="px-6 py-3">
                  <button 
                    onClick={() => setMembers(members.filter((_, i) => i !== idx))}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                  No members added yet. Upload a CSV or add manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-6 border-t border-gray-50 flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || members.length === 0}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-8 rounded-xl"
        >
          {loading ? "Importing..." : "Import and Continue / जतन करा"}
        </Button>
      </div>
    </div>
  );
}
