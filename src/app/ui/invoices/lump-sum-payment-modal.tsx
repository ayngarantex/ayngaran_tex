'use client';

import { useState } from 'react';
import { processLumpSumPayment } from '@/app/api/node/invoice';
import { BanknotesIcon, XMarkIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDateNew } from '@/app/lib/utils';

const paymentTypes = ["Bank", "Gpay", "Cash", "PhonePay", "Check"];
const paymentToOptions = ["Prakash", "Govinth", "Sekar"];

export default function LumpSumPaymentModal({
  customers = [],
  initialCustomerId,
  customerName,
  buttonLabel = "Lump-Sum Payment",
  buttonClassName = "flex h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-500 shadow-sm"
}: {
  customers?: any[];
  initialCustomerId?: number;
  customerName?: string;
  buttonLabel?: string;
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>(initialCustomerId || '');
  const [amount, setAmount] = useState<string>('');
  
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateStr());
  const [paymentType, setPaymentType] = useState<string>('Bank');
  const [paymentTo, setPaymentTo] = useState<string>('Prakash');
  const [billType, setBillType] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [resultSummary, setResultSummary] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleOpen = () => {
    setIsOpen(true);
    setResultSummary(null);
    setErrorMsg('');
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
    setPaymentDate(getTodayDateStr());
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

    const custId = Number(selectedCustomerId || initialCustomerId);
    if (!custId || custId <= 0) {
      setErrorMsg("Please select a customer.");
      return;
    }

    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setErrorMsg("Please enter a valid payment amount greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const res = await processLumpSumPayment({
        customerId: custId,
        amount: amtNum,
        paymentDate: paymentDate || getTodayDateStr(),
        paymentType,
        paymentTo,
        billType: billType || null
      });

      if (res && res.success) {
        setResultSummary(res);
      } else {
        setErrorMsg(res?.message || "Failed to process lump-sum payment.");
      }
    } catch (err: any) {
      console.error("LumpSum Payment Error:", err);
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
        title="Process a lump-sum payment across multiple bills"
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
                  <h2 className="text-lg font-bold text-slate-800">Customer Lump-Sum Payment</h2>
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
                    Successfully Allocated ₹{formatCurrency(resultSummary.totalAllocated)} across {resultSummary.allocatedCount} Bill(s)!
                  </div>

                  {resultSummary.excessRemaining > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-semibold">
                      Excess Remaining Unallocated: ₹{formatCurrency(resultSummary.excessRemaining)}
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-sm font-bold text-slate-700 mb-2">Bill Breakdown (Separate Entries Created in payment_details):</p>
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
                              <td className="px-3 py-2 font-medium text-slate-800">#{item.InvoiceNumber}</td>
                              <td className="px-3 py-2 text-slate-500">{formatDateNew(item.InvoiceDate)}</td>
                              <td className="px-3 py-2 text-right font-bold text-emerald-700">₹{formatCurrency(item.PaidAmount)}</td>
                              <td className="px-3 py-2 text-right text-slate-600">₹{formatCurrency(item.RemainingBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <form id="lumpSumForm" onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Customer Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Customer
                    </label>
                    {initialCustomerId && customerName ? (
                      <input
                        type="text"
                        readOnly
                        value={customerName}
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-slate-100 font-semibold text-slate-800"
                      />
                    ) : (
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                        required
                      >
                        <option value="">Select Customer...</option>
                        {customers.map((c: any) => (
                          <option key={c.CustomerId} value={c.CustomerId}>
                            {c.CustomerName} {c.Mobile ? `(${c.Mobile})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Payment Amount & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Total Lump-Sum Amount (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 230000"
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-white font-bold text-emerald-800 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-white font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Type & Payment To */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Payment Type
                      </label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-white font-medium"
                      >
                        {paymentTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Payment To / Received By
                      </label>
                      <select
                        value={paymentTo}
                        onChange={(e) => setPaymentTo(e.target.value)}
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-white font-medium"
                      >
                        {paymentToOptions.map((to) => (
                          <option key={to} value={to}>{to}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bill Type Filter (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Filter Bill Type (Optional)
                    </label>
                    <select
                      value={billType}
                      onChange={(e) => setBillType(e.target.value)}
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-white font-medium"
                    >
                      <option value="">All Bill Types (GST & Normal)</option>
                      <option value="gst">GST Bills Only</option>
                      <option value="normal">Normal Bills Only</option>
                    </select>
                  </div>
                </form>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
              >
                {resultSummary ? 'Close & Refresh' : 'Cancel'}
              </button>

              {!resultSummary && (
                <button
                  type="submit"
                  form="lumpSumForm"
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Processing...' : '⚡ Auto-Allocate & Save Payments'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
