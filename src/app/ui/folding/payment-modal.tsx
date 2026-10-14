'use client';

import React, { useState } from 'react';
import { XMarkIcon, CurrencyRupeeIcon, CalendarIcon, DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { saveFoldingPayment } from '@/app/api/node/folding';
import { formatDateNew } from '@/app/lib/utils';

export interface WeeklyFoldingRecordDetails {
    LoomId: number;
    LoomName: string;
    WeekStartDate: string;
    WeekEndDate: string;
    TotalGivenCount: number;
    TotalReturnCount: number;
    NetPieces: number;
    TotalCalculatedWages: number;
    TotalDcsCount: number;
    TotalPaidAmount: number;
    BalanceDue: number;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: WeeklyFoldingRecordDetails | null;
    onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, record, onSuccess }: PaymentModalProps) {
    const todayStr = new Date().toISOString().split('T')[0];

    const [paymentDate, setPaymentDate] = useState(todayStr);
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('Cash');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !record) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            setError('Please enter a valid payment amount greater than 0.');
            return;
        }

        if (!paymentDate) {
            setError('Please select a payment date.');
            return;
        }

        setLoading(true);

        try {
            const res = await saveFoldingPayment({
                LoomId: record.LoomId,
                WeekStartDate: record.WeekStartDate,
                PaymentDate: paymentDate,
                Amount: numericAmount,
                PaymentType: paymentType,
                Note: note.trim()
            });

            if (res.success) {
                setAmount('');
                setNote('');
                setPaymentType('Cash');
                setPaymentDate(todayStr);
                onSuccess();
                onClose();
            } else {
                setError(res.error || 'Failed to save payment entry.');
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err?.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CurrencyRupeeIcon className="h-6 w-6 text-emerald-600" />
                            Record Folding Payment
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Add a payment entry for this week's folding charges
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Target Record Info Box */}
                <div className="my-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/80 p-3.5 border border-emerald-100 text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-700">
                        <span>Folder: <span className="text-emerald-800 font-bold">{record.LoomName}</span></span>
                        <span>DCs Count: <span className="text-slate-800 font-bold">{record.TotalDcsCount} DCs</span></span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>Week Period: <span className="font-bold text-slate-800">{formatDateNew(record.WeekStartDate)} – {formatDateNew(record.WeekEndDate)}</span></span>
                        <span>Given / Return: <span className="font-bold text-blue-700">{record.TotalGivenCount}</span> / <span className="font-bold text-amber-700">{record.TotalReturnCount}</span> Pcs</span>
                    </div>
                    <div className="flex justify-between text-slate-500 pt-1 border-t border-emerald-100/60">
                        <span>Total Paid So Far:</span>
                        <span className="font-bold text-slate-800">₹ {record.TotalPaidAmount.toFixed(2)}</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Payment Date */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                            Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <CurrencyRupeeIcon className="h-4 w-4 text-slate-400" />
                            Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Enter payment amount (e.g. 2500)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                    </div>

                    {/* Payment Type */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <CreditCardIcon className="h-4 w-4 text-slate-400" />
                            Type of Payment <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white"
                        >
                            <option value="Cash">Cash</option>
                            <option value="GPay / PhonePe / UPI">GPay / PhonePe / UPI</option>
                            <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                            <option value="Advance Payment">Advance Payment</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Text Box / Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <DocumentTextIcon className="h-4 w-4 text-slate-400" />
                            Note / Remark
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Enter note or details regarding this folding payment..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300 transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                'Save Payment'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
