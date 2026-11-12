'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    BanknotesIcon,
    XMarkIcon,
    SparklesIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDateNew } from '@/app/lib/utils';
import { fetchUnpaidFoldingBills, processFoldingLumpSumPayment } from '@/app/api/node/folding';

const paymentTypes = ["Cash", "Bank", "GPay", "PhonePay", "Cheque"];

interface FoldingLumpSumPaymentModalProps {
    looms?: any[];
    initialLoomId?: number;
    initialLoomName?: string;
    buttonLabel?: string;
    buttonClassName?: string;
    onSuccess?: () => void;
}

export default function FoldingLumpSumPaymentModal({
    looms = [],
    initialLoomId,
    initialLoomName,
    buttonLabel = "Lump-Sum Payment",
    buttonClassName = "inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm cursor-pointer",
    onSuccess
}: FoldingLumpSumPaymentModalProps) {
    const todayStr = new Date().toISOString().split('T')[0];

    const [isOpen, setIsOpen] = useState(false);
    const [selectedLoomId, setSelectedLoomId] = useState<number | string>(initialLoomId || '');
    const [selectedLoomName, setSelectedLoomName] = useState<string>(initialLoomName || '');

    // Unpaid bills state
    const [unpaidBills, setUnpaidBills] = useState<any[]>([]);
    const [loadingBills, setLoadingBills] = useState(false);
    const [selectedWeekDates, setSelectedWeekDates] = useState<string[]>([]);

    // Payment fields
    const [amount, setAmount] = useState<string>('');
    const [paymentDate, setPaymentDate] = useState<string>(todayStr);
    const [paymentType, setPaymentType] = useState<string>('Cash');
    const [note, setNote] = useState<string>('');

    // Status
    const [submitting, setSubmitting] = useState(false);
    const [resultSummary, setResultSummary] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');

    // Load unpaid bills whenever selectedLoomId changes
    useEffect(() => {
        if (!isOpen) return;

        const loomIdNum = Number(selectedLoomId);
        if (loomIdNum > 0) {
            setLoadingBills(true);
            setErrorMsg('');
            fetchUnpaidFoldingBills(loomIdNum)
                .then((bills) => {
                    setUnpaidBills(bills || []);
                    setSelectedWeekDates([]);
                })
                .catch((err) => {
                    console.error("Failed to load unpaid folding bills:", err);
                    setErrorMsg("Failed to load unpaid folding bills for this folder/loom.");
                })
                .finally(() => {
                    setLoadingBills(false);
                });
        } else {
            setUnpaidBills([]);
            setSelectedWeekDates([]);
        }
    }, [selectedLoomId, isOpen]);

    // Calculate selected bills total due
    const selectedTotalDue = useMemo(() => {
        if (selectedWeekDates.length === 0) return 0;
        const set = new Set(selectedWeekDates);
        return unpaidBills
            .filter((b) => set.has(b.WeekStartDate))
            .reduce((sum, b) => sum + (Number(b.BalanceDue) || 0), 0);
    }, [selectedWeekDates, unpaidBills]);

    const handleOpen = () => {
        setIsOpen(true);
        setResultSummary(null);
        setErrorMsg('');
        if (initialLoomId) {
            setSelectedLoomId(initialLoomId);
            setSelectedLoomName(initialLoomName || '');
        }
        setPaymentDate(todayStr);
    };

    const handleClose = () => {
        setIsOpen(false);
        if (resultSummary?.success) {
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.reload();
            }
        }
    };

    const handleToggleBill = (weekStartDate: string) => {
        setSelectedWeekDates((prev) =>
            prev.includes(weekStartDate)
                ? prev.filter((d) => d !== weekStartDate)
                : [...prev, weekStartDate]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedWeekDates.length === unpaidBills.length) {
            setSelectedWeekDates([]);
        } else {
            setSelectedWeekDates(unpaidBills.map((b) => b.WeekStartDate));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setResultSummary(null);

        const loomIdNum = Number(selectedLoomId);
        if (!loomIdNum || loomIdNum <= 0) {
            setErrorMsg("Please select a folder/loom.");
            return;
        }

        const amtNum = parseFloat(amount);
        if (isNaN(amtNum) || amtNum <= 0) {
            setErrorMsg("Please enter a valid payment amount greater than 0.");
            return;
        }

        if (!paymentDate) {
            setErrorMsg("Please select a payment date.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await processFoldingLumpSumPayment({
                loomId: loomIdNum,
                amount: amtNum,
                paymentDate,
                paymentType,
                note: note.trim() || undefined,
                selectedWeekStartDates: selectedWeekDates.length > 0 ? selectedWeekDates : undefined
            });

            if (res && res.success) {
                setResultSummary(res);
            } else {
                setErrorMsg(res?.message || "Failed to process folding lump-sum payment.");
            }
        } catch (err: any) {
            console.error("LumpSum Payment Error:", err);
            setErrorMsg(err?.message || "An unexpected error occurred while processing payment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className={buttonClassName}
                title="Process a lump-sum payment across unpaid folding bills"
            >
                <SparklesIcon className="w-4 h-4" />
                <span>{buttonLabel}</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/70 rounded-t-2xl">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                    <BanknotesIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Folding Lump-Sum Payment</h2>
                                    <p className="text-xs text-slate-500">
                                        Select bills to pay or auto-allocate payment across unpaid bills (Oldest First)
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-5 flex-1">
                            {resultSummary ? (
                                <div className="space-y-4 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200">
                                    <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-base">
                                        <CheckCircleIcon className="w-7 h-7 text-emerald-600 shrink-0" />
                                        <span>
                                            Successfully allocated {formatCurrency(resultSummary.totalAllocated)} across {resultSummary.allocatedCount} Folding Bill(s)!
                                        </span>
                                    </div>

                                    {resultSummary.excessRemaining > 0 && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
                                            Excess Remaining Unallocated: {formatCurrency(resultSummary.excessRemaining)}
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                            Payment Allocation Breakdown:
                                        </p>
                                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                                                <thead className="bg-slate-100 text-slate-700 font-semibold">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Week Period</th>
                                                        <th className="px-3 py-2 text-right">Folding Wages</th>
                                                        <th className="px-3 py-2 text-right">Previously Paid</th>
                                                        <th className="px-3 py-2 text-right text-emerald-700">Allocated Paid</th>
                                                        <th className="px-3 py-2 text-right">New Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {resultSummary.allocatedBills?.map((item: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="px-3 py-2 font-medium text-slate-800">
                                                                {formatDateNew(item.WeekStartDate)} – {formatDateNew(item.WeekEndDate)}
                                                            </td>
                                                            <td className="px-3 py-2 text-right text-slate-600">
                                                                {formatCurrency(item.TotalCalculatedWages)}
                                                            </td>
                                                            <td className="px-3 py-2 text-right text-slate-500">
                                                                {formatCurrency(item.PreviousPaid)}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-black text-emerald-700">
                                                                {formatCurrency(item.AllocatedAmount)}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-bold text-slate-700">
                                                                {formatCurrency(item.NewBalanceDue)}
                                                            </td>
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
                                        <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                                            {errorMsg}
                                        </div>
                                    )}

                                    {/* Loom/Folder Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Select Folder / Loom <span className="text-red-500">*</span>
                                        </label>
                                        {initialLoomId ? (
                                            <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-900 font-bold text-sm">
                                                {selectedLoomName || `Folder #${initialLoomId}`}
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedLoomId}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSelectedLoomId(val);
                                                    const found = looms.find((l: any) => String(l.LoomId) === val);
                                                    setSelectedLoomName(found?.LoomName || '');
                                                }}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                                                required
                                            >
                                                <option value="">-- Choose a Folder / Loom --</option>
                                                {looms.map((l: any) => (
                                                    <option key={l.LoomId} value={l.LoomId}>
                                                        {l.LoomName}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Unpaid Bills Table with Checkboxes */}
                                    {Number(selectedLoomId) > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                    Outstanding Folding Bills ({unpaidBills.length})
                                                </span>
                                                {unpaidBills.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleToggleSelectAll}
                                                        className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer"
                                                    >
                                                        {selectedWeekDates.length === unpaidBills.length
                                                            ? 'Deselect All'
                                                            : 'Select All'}
                                                    </button>
                                                )}
                                            </div>

                                            {loadingBills ? (
                                                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                                                    Loading pending folding bills...
                                                </div>
                                            ) : unpaidBills.length === 0 ? (
                                                <div className="p-6 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 font-medium">
                                                    ✓ All folding bills for this folder/loom are fully paid!
                                                </div>
                                            ) : (
                                                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                                                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                                                        <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 z-10">
                                                            <tr>
                                                                <th className="w-10 px-3 py-2 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedWeekDates.length === unpaidBills.length && unpaidBills.length > 0}
                                                                        onChange={handleToggleSelectAll}
                                                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                                    />
                                                                </th>
                                                                <th className="px-3 py-2 text-left">Week Period</th>
                                                                <th className="px-3 py-2 text-left">Entries / Pieces</th>
                                                                <th className="px-3 py-2 text-right">Folding Wages</th>
                                                                <th className="px-3 py-2 text-right text-emerald-700">Paid</th>
                                                                <th className="px-3 py-2 text-right text-rose-700 font-black">Due (₹)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 bg-white">
                                                            {unpaidBills.map((b) => {
                                                                const isChecked = selectedWeekDates.includes(b.WeekStartDate);
                                                                return (
                                                                    <tr
                                                                        key={b.WeekStartDate}
                                                                        onClick={() => handleToggleBill(b.WeekStartDate)}
                                                                        className={`hover:bg-emerald-50/50 cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50/80 font-semibold' : ''
                                                                            }`}
                                                                    >
                                                                        <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isChecked}
                                                                                onChange={() => handleToggleBill(b.WeekStartDate)}
                                                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2 text-slate-800 whitespace-nowrap">
                                                                            {formatDateNew(b.WeekStartDate)} – {formatDateNew(b.WeekEndDate)}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-slate-500 text-[11px] max-w-[200px] truncate">
                                                                            {b.TotalDcsCount} entry(s) • {b.NetPieces || b.TotalFoldedCount || 0} pcs
                                                                        </td>
                                                                        <td className="px-3 py-2 text-right text-slate-600">
                                                                            {formatCurrency(b.TotalCalculatedWages)}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-right text-emerald-700">
                                                                            {formatCurrency(b.TotalPaidAmount)}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-right font-black text-rose-700 whitespace-nowrap">
                                                                            {formatCurrency(b.BalanceDue)}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Selected Bill Total Banner */}
                                            {selectedWeekDates.length > 0 ? (
                                                <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                                                    <div>
                                                        <div className="text-xs font-bold text-emerald-800">
                                                            Selected {selectedWeekDates.length} Bill(s) Total Due:
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

                                    {/* Payment Inputs Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Payment Amount (₹) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="Enter amount to pay"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Payment Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={paymentDate}
                                                onChange={(e) => setPaymentDate(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Payment Mode
                                            </label>
                                            <select
                                                value={paymentType}
                                                onChange={(e) => setPaymentType(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer"
                                            >
                                                {paymentTypes.map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Note (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Advance / cleared folding wages"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || unpaidBills.length === 0}
                                            className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                                        >
                                            {submitting ? 'Processing...' : `Pay ₹${amount || '0.00'}`}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Modal Footer on Result */}
                        {resultSummary && (
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                                >
                                    Done &amp; Refresh
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

