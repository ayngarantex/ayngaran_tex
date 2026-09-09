'use client';

import { useState, useEffect } from 'react';
import { processUnifiedSupplierLumpSumPayment } from '@/app/api/node/supplier';
import { BanknotesIcon, XMarkIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDateNew, currentDate } from '@/app/lib/utils';

const paymentTypes = ["Bank", "Gpay", "Cash", "PhonePay", "Check"];
const paymentToOptions = ["Prakash", "Govinth", "Sekar"];

export default function SupplierLumpSumPaymentModal({
  suppliers = [],
  initialSupplierId,
  supplierName,
  supplierType,
  initialCategory,
  buttonLabel = "Lump-Sum Payment",
  buttonClassName = "flex h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-500 shadow-sm"
}: {
  suppliers?: any[];
  initialSupplierId?: number;
  supplierName?: string;
  supplierType?: string;
  initialCategory?: "purchases" | "yarn" | "sizing";
  buttonLabel?: string;
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | string>(initialSupplierId || '');

  const getCategoryFromType = (st?: string, initCat?: "purchases" | "yarn" | "sizing"): "purchases" | "yarn" | "sizing" => {
    if (initCat) return initCat;
    if (st === 'Purchase' || st === 'purchases') return 'purchases';
    if (st === 'Sizing' || st === 'sizing') return 'sizing';
    return 'yarn';
  };

  const [category, setCategory] = useState<"purchases" | "yarn" | "sizing">(
    getCategoryFromType(supplierType, initialCategory)
  );
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(currentDate());
  const [paymentType, setPaymentType] = useState<string>('Bank');
  const [paymentTo, setPaymentTo] = useState<string>('Prakash');
  const [billType, setBillType] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [resultSummary, setResultSummary] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Update category when selected supplier changes in dropdown
  useEffect(() => {
    if (selectedSupplierId && suppliers?.length) {
      const found = suppliers.find((s: any) => String(s.Id || s.SupplierId) === String(selectedSupplierId));
      if (found && found.Type) {
        setCategory(getCategoryFromType(found.Type, initialCategory));
      }
    }
  }, [selectedSupplierId, suppliers, initialCategory]);

  const handleOpen = () => {
    setIsOpen(true);
    setResultSummary(null);
    setErrorMsg('');
    if (initialSupplierId) {
      setSelectedSupplierId(initialSupplierId);
    }
    setCategory(getCategoryFromType(supplierType, initialCategory));
    setPaymentDate(currentDate());
  };

  const handleClose = () => {
    setIsOpen(false);
    if (resultSummary?.success) {
      window.location.reload();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResultSummary(null);

    const supId = Number(selectedSupplierId || initialSupplierId);
    if (!supId || supId <= 0) {
      setErrorMsg("Please select a supplier.");
      return;
    }

    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setErrorMsg("Please enter a valid payment amount greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const res = await processUnifiedSupplierLumpSumPayment({
        supplierId: supId,
        amount: amtNum,
        paymentDate: paymentDate || currentDate(),
        paymentType,
        paymentTo,
        billType: billType || null,
        category
      });

      if (res && res.success) {
        setResultSummary(res);
      } else {
        setErrorMsg(res?.message || "Failed to process lump-sum payment.");
      }
    } catch (err: any) {
      console.error("Supplier LumpSum Payment Error:", err);
      setErrorMsg(err?.message || "An unexpected error occurred while processing payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={buttonClassName}
        title="Process a lump-sum payment across multiple supplier bills"
      >
        <SparklesIcon className="w-5 h-5 mr-1.5" />
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/60 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Supplier Lump-Sum Payment</h2>
                  <p className="text-xs text-slate-500">Auto-allocates payment bill-by-bill (Oldest First)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">

              {resultSummary ? (
                <div className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                    Successfully Allocated ₹{formatCurrency(resultSummary.totalAllocated)} across {resultSummary.allocatedCount} {category.toUpperCase()} Bill(s)!
                  </div>

                  {resultSummary.excessRemaining > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-semibold">
                      Excess Remaining Unallocated: ₹{formatCurrency(resultSummary.excessRemaining)}
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-sm font-bold text-slate-700 mb-2">Bill Breakdown (Separate Entries Created in payment details):</p>
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-semibold">
                          <tr>
                            <th className="px-3 py-2 text-left">Bill #</th>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-right">Allocated Paid</th>
                            <th className="px-3 py-2 text-right">New Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {resultSummary.allocatedInvoices?.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-medium text-slate-800">#{item.InvoiceNumber || item.PurchaseId || item.YarnId || item.SizingId}</td>
                              <td className="px-3 py-2 text-slate-500">{formatDateNew(item.InvoiceDate)}</td>
                              <td className="px-3 py-2 text-right font-bold text-emerald-700">{formatCurrency(item.PaidAmount)}</td>
                              <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.RemainingBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supplier Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Supplier <span className="text-red-500">*</span>
                      </label>
                      {initialSupplierId ? (
                        <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-800 font-bold text-sm">
                          {supplierName || `Supplier ID: ${initialSupplierId}`} {supplierType ? `[${supplierType}]` : ''}
                        </div>
                      ) : (
                        <select
                          value={selectedSupplierId}
                          onChange={(e) => setSelectedSupplierId(e.target.value)}
                          required
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800"
                        >
                          <option value="">-- Select Supplier --</option>
                          {suppliers?.map((sup: any) => (
                            <option key={sup.Id || sup.SupplierId} value={sup.Id || sup.SupplierId}>
                              {sup.Name} {sup.GstNumber ? `(${sup.GstNumber})` : ''} {sup.Type ? `[${sup.Type}]` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Bill Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e: any) => setCategory(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-slate-800"
                      >
                        <option value="purchases">Purchases (Cloth/General)</option>
                        <option value="yarn">Yarn Bills</option>
                        <option value="sizing">Sizing Bills</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Lump-Sum Payment Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="e.g. 230000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-slate-900"
                      />
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        required
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Payment Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Payment Method
                      </label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800"
                      >
                        {paymentTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Payment To / Paid By */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Paid By / Received By
                      </label>
                      <select
                        value={paymentTo}
                        onChange={(e) => setPaymentTo(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800"
                      >
                        {paymentToOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Bill Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Bill Type Filter
                      </label>
                      <select
                        value={billType}
                        onChange={(e) => setBillType(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800"
                      >
                        <option value="">All Bill Types</option>
                        <option value="gst">GST Bills</option>
                        <option value="dc">DC Bills</option>
                      </select>
                    </div>
                  </div>

                  {/* Info notice */}
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-800">
                    💡 <span className="font-bold">Auto-Allocation logic:</span> The entered payment will be applied starting from the oldest unpaid {category} bill (`InvoiceDate ASC`). A separate entry will be created in <code className="font-semibold">{category === 'sizing' ? 'sizing_payment_details' : category === 'yarn' ? 'yarn_payment_details' : 'purchase_payment_details'}</code> for each bill automatically.
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? 'Processing...' : 'Auto-Allocate & Save Payment'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {resultSummary && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Done & Refresh
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
