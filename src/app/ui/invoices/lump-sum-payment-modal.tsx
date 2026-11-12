'use client';

import { useMemo, useState, useEffect } from 'react';
import { fetchUnpaidInvoices, processLumpSumPayment } from '@/app/api/node/invoice';
import { BanknotesIcon, XMarkIcon, SparklesIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDateNew } from '@/app/lib/utils';
import SearchDropdown from '@/app/ui/search-dropdown';

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
  const [selectedCustomerName, setSelectedCustomerName] = useState(customerName || "");
  const [amount, setAmount] = useState<string>('');

  // Unpaid invoices state
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);

  const dropdownCustomers = useMemo(() => {
    return customers.map(c => ({
      id: c.CustomerId,
      label: c.CustomerName || '',
    }));
  }, [customers]);

  const handleCustomerSelect = async (item: any) => {
    if (!item) {
      setSelectedCustomerId('');
      setSelectedCustomerName('');
      return;
    }

    const customerId = Number(item.id);
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(item.label);
  };

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

  // Load unpaid bills whenever selectedCustomerId, billType or isOpen changes
  useEffect(() => {
    if (!isOpen) return;

    const custId = Number(selectedCustomerId || initialCustomerId);
    if (custId > 0) {
      setLoadingBills(true);
      setErrorMsg('');
      fetchUnpaidInvoices(custId, billType || null)
        .then((bills) => {
          setUnpaidInvoices(bills || []);
          setSelectedInvoiceIds([]);
        })
        .catch((err) => {
          console.error("Failed to load unpaid invoices:", err);
          setErrorMsg("Failed to load unpaid invoices for this customer.");
        })
        .finally(() => {
          setLoadingBills(false);
        });
    } else {
      setUnpaidInvoices([]);
      setSelectedInvoiceIds([]);
    }
  }, [selectedCustomerId, initialCustomerId, billType, isOpen]);

  // Calculate selected bills total due
  const selectedTotalDue = useMemo(() => {
    if (selectedInvoiceIds.length === 0) return 0;
    const set = new Set(selectedInvoiceIds);
    return unpaidInvoices
      .filter((b) => set.has(Number(b.InvoiceId)))
      .reduce((sum, b) => sum + (Number(b.BalanceDue) || 0), 0);
  }, [selectedInvoiceIds, unpaidInvoices]);

  const handleOpen = () => {
    setIsOpen(true);
    setResultSummary(null);
    setErrorMsg('');
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
      setSelectedCustomerName(customerName || '');
    }
    setPaymentDate(getTodayDateStr());
  };

  const handleClose = () => {
    setIsOpen(false);
    if (resultSummary?.success) {
      window.location.reload();
    }
  };

  const handleToggleInvoice = (invoiceId: number) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedInvoiceIds.length === unpaidInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(unpaidInvoices.map((b) => Number(b.InvoiceId)));
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
        billType: billType || null,
        selectedInvoiceIds: selectedInvoiceIds.length > 0 ? selectedInvoiceIds : undefined
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/60 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Customer Lump-Sum Payment</h2>
                  <p className="text-xs text-slate-500">
                    Select bills to pay or auto-allocate payment across unpaid bills (Oldest First)
                  </p>
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
            <div className="p-6 overflow-y-auto space-y-4 flex-1">

              {resultSummary ? (
                <div className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span>
                      Successfully Allocated (FormatCurrency(resultSummary.totalAllocated)} across {resultSummary.allocatedCount} Bill(s)!
                    </span>
                  </div>

                  {resultSummary.excessRemaining > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-semibold">
                      Excess Remaining Unallocated: (FormatCurrency(resultSummary.excessRemaining)}
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
                <form id="lumpSumForm" onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Customer Selection & Bill Type Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      {initialCustomerId && customerName ? (
                        <input
                          type="text"
                          readOnly
                          value={customerName}
                          className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-slate-100 font-semibold text-slate-800"
                        />
                      ) : (
                        <SearchDropdown
                          items={dropdownCustomers}
                          onSelect={handleCustomerSelect}
                          label="Choose customer"
                          placeholder="Select a customer..."
                          createLink="/admin/customers/create"
                          value={selectedCustomerName || ''}
                        />
                      )}
                    </div>

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
                  </div>

                  {/* Outstanding Invoices Table with Checkboxes */}
                  {Number(selectedCustomerId || initialCustomerId) > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Outstanding Invoices / Bills ({unpaidInvoices.length})
                        </span>
                        {unpaidInvoices.length > 0 && (
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer"
                          >
                            {selectedInvoiceIds.length === unpaidInvoices.length
                              ? 'Deselect All'
                              : 'Select All'}
                          </button>
                        )}
                      </div>

                      {loadingBills ? (
                        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                          Loading pending invoices...
                        </div>
                      ) : unpaidInvoices.length === 0 ? (
                        <div className="p-6 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 font-medium">
                          ✓ All invoices for this customer are fully paid!
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                          <table className="min-w-full divide-y divide-slate-200 text-xs">
                            <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 z-10">
                              <tr>
                                <th className="w-10 px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedInvoiceIds.length === unpaidInvoices.length && unpaidInvoices.length > 0}
                                    onChange={handleToggleSelectAll}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                </th>
                                <th className="px-3 py-2 text-left">Bill #</th>
                                <th className="px-3 py-2 text-left">Date</th>
                                <th className="px-3 py-2 text-left">Type</th>
                                <th className="px-3 py-2 text-right">Bill Amount</th>
                                <th className="px-3 py-2 text-right text-emerald-700">Paid</th>
                                <th className="px-3 py-2 text-right text-rose-700 font-black">Due (₹)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {unpaidInvoices.map((b) => {
                                const isChecked = selectedInvoiceIds.includes(Number(b.InvoiceId));
                                return (
                                  <tr
                                    key={b.InvoiceId}
                                    onClick={() => handleToggleInvoice(Number(b.InvoiceId))}
                                    className={`hover:bg-emerald-50/50 cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50/80 font-semibold' : ''
                                      }`}
                                  >
                                    <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleInvoice(Number(b.InvoiceId))}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap">
                                      #{b.InvoiceNumber}
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                                      {formatDateNew(b.InvoiceDate)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${(b.BillType || '').toLowerCase() === 'gst'
                                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                        {(b.BillType || 'Normal').toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-right text-slate-600 whitespace-nowrap">
                                      (FormatCurrency(b.NetAmount || b.InvoiceAmount)}
                                    </td>
                                    <td className="px-3 py-2 text-right text-emerald-700 whitespace-nowrap">
                                      (FormatCurrency(b.ReceivedAmount)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-black text-rose-700 whitespace-nowrap">
                                      (FormatCurrency(b.BalanceDue)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Selected Bills Total Banner */}
                      {selectedInvoiceIds.length > 0 ? (
                        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                          <div>
                            <div className="text-xs font-bold text-emerald-800">
                              Selected {selectedInvoiceIds.length} Bill(s) Total Due:
                            </div>
                            <div className="text-lg font-black text-emerald-700">
                              ₹ {formatCurrency(selectedTotalDue)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAmount(String(selectedTotalDue.toFixed(2)))}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer transition-colors"
                          >
                            Use Selected Total
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                          <InformationCircleIcon className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            <strong>No bills selected:</strong> Lump-sum amount will automatically be allocated across unpaid bills (Oldest First).
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Amount & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Total Lump-Sum Amount (₹) <span className="text-red-500">*</span>
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
                        Payment Date <span className="text-red-500">*</span>
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
