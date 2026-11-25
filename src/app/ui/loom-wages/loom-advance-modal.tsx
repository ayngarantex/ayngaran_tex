'use client';

import React, { useState } from 'react';
import {
    BanknotesIcon,
    XMarkIcon,
    CalendarIcon,
    CurrencyRupeeIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { saveLoomWagePayment } from '@/app/api/node/loom-wages';

interface LoomAdvanceModalProps {
    looms?: any[];
    initialLoomId?: number;
    onSuccess?: () => void;
}

export default function LoomAdvanceModal({
    looms = [],
    initialLoomId,
    onSuccess
}: LoomAdvanceModalProps) {
    const todayStr = new Date().toISOString().split('T')[0];

    const [isOpen, setIsOpen] = useState(false);
    const [selectedLoomId, setSelectedLoomId] = useState<string>(initialLoomId ? String(initialLoomId) : '');
    const [paymentDate, setPaymentDate] = useState<string>(todayStr);
    const [amount, setAmount] = useState<string>('');
    const [note, setNote] = useState<string>('Advance given to weaver');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const handleOpen = () => {
        setIsOpen(true);
        setErrorMsg('');
        setSelectedLoomId(initialLoomId ? String(initialLoomId) : '');
        setPaymentDate(todayStr);
        setAmount('');
        setNote('Advance given to weaver');
    };

    const handleClose = () => {
        setIsOpen(false);
        setErrorMsg('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        const loomIdNum = Number(selectedLoomId);
        if (!loomIdNum || loomIdNum <= 0) {
            setErrorMsg('Please select a loom.');
            return;
        }

        const amtNum = parseFloat(amount);
        if (isNaN(amtNum) || amtNum <= 0) {
            setErrorMsg('Please enter a valid advance amount greater than 0.');
            return;
        }

        if (!paymentDate) {
            setErrorMsg('Please select an advance date.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await saveLoomWagePayment({
                LoomId: loomIdNum,
                WeekStartDate: '', // Auto-computed on server from PaymentDate
                PaymentDate: paymentDate,
                Amount: amtNum,
                PaymentType: 'Advance Payment',
                Note: note.trim() || 'Advance given to weaver'
            });

            if (res.success) {
                setIsOpen(false);
                if (onSuccess) {
                    onSuccess();
                } else {
                    window.location.reload();
                }
            } else {
                setErrorMsg(res.error || 'Failed to save advance payment.');
            }
        } catch (err: any) {
            console.error('Advance Payment Error:', err);
            setErrorMsg(err?.message || 'An unexpected error occurred while saving advance.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-sm cursor-pointer"
                title="Record a cash advance given to a loom (even without a DC for the week)"
            >
                <BanknotesIcon className="w-4 h-4" />
                <span>Give Advance</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <BanknotesIcon className="h-6 w-6 text-amber-600" />
                                    Give Loom Advance
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Record advance given even if there are no DCs this week
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            {/* Loom Select */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Select Loom <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedLoomId}
                                    onChange={(e) => setSelectedLoomId(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                                >
                                    <option value="">-- Choose a Loom --</option>
                                    {looms.map((loom: any) => (
                                        <option key={loom.LoomId} value={loom.LoomId}>
                                            {loom.LoomName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Date */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                                    Advance Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                                />
                            </div>

                            {/* Advance Amount */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <CurrencyRupeeIcon className="h-4 w-4 text-slate-400" />
                                    Advance Amount (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 5000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                                />
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <DocumentTextIcon className="h-4 w-4 text-slate-400" />
                                    Note
                                </label>
                                <input
                                    type="text"
                                    placeholder="Advance details or mode (Cash / GPay)"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60 transition-all cursor-pointer"
                                >
                                    {submitting ? 'Saving...' : 'Save Advance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

