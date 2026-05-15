import { formatRupees } from "@/lib/calculations";

export default function SummaryPanel({ totals }: any) {
  return (
    <div className="bg-white rounded-3xl border border-orange-200 shadow-2xl overflow-hidden">
      <div className="bg-orange-600 p-6 text-white">
         <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Opening Cash</p>
              <p className="text-lg font-bold">{formatRupees(totals.openingCash)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Opening Bank</p>
              <p className="text-lg font-bold">{formatRupees(totals.openingBank)}</p>
            </div>
         </div>
         <div className="pt-4 border-t border-orange-500/50">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Total Opening Balance</p>
            <p className="text-3xl font-bold">{formatRupees(totals.openingCash + totals.openingBank)}</p>
         </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1">Receipts / जमा</h4>
          <SummaryItem label="Cash Receipts" value={formatRupees(totals.cashReceipts)} />
          <SummaryItem label="Bank Receipts" value={formatRupees(totals.bankReceipts)} />
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1">Payments / खर्च</h4>
          <SummaryItem label="Cash Payments" value={formatRupees(totals.cashPayments)} />
          <SummaryItem label="Bank Payments" value={formatRupees(totals.bankPayments)} />
        </div>
      </div>

      <div className="bg-orange-50 p-6 border-t border-orange-100">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-orange-900 uppercase">Closing Cash</p>
          <p className="text-sm font-bold text-gray-900">{formatRupees(totals.closingCash)}</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs font-bold text-orange-900 uppercase">Closing Bank</p>
          <p className="text-sm font-bold text-gray-900">{formatRupees(totals.closingBank)}</p>
        </div>
        <div className="pt-4 border-t border-orange-200 flex justify-between items-center">
          <p className="text-sm font-bold text-orange-600 uppercase">Final Total</p>
          <p className={`text-2xl font-bold ${totals.totalClosing >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatRupees(totals.totalClosing)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs font-bold">
      <p className="text-gray-400">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}
