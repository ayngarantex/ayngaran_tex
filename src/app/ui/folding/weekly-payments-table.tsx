'use client';

import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDateNew } from '@/app/lib/utils';
import type { FoldingPaymentItem } from './weekly-table';

interface WeeklyPaymentsTableProps {
    payments: FoldingPaymentItem[];
    onAddPayment: () => void;
    onDeletePayment: (paymentId: number) => Promise<void>;
}

export default function WeeklyPaymentsTable({
    payments,
    onAddPayment,
    onDeletePayment
}: WeeklyPaymentsTableProps) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Weekly Payment History ({payments.length})
                </h5>
                <button
                    type="button"
                    onClick={onAddPayment}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
                >
                    <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
                    Add Payment
                </button>
            </div>

            {payments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
                    No payments recorded for this week yet. Click "+ Add Payment" above to record one.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="py-2.5 pl-4 pr-3">Payment Date</th>
                                <th className="px-3 py-2.5">Payment Type</th>
                                <th className="px-3 py-2.5 text-right font-black text-emerald-800">Amount (₹)</th>
                                <th className="px-3 py-2.5">Notes</th>
                                <th className="py-2.5 pl-3 pr-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments.map((p) => (
                                <tr key={p.PaymentId} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-2.5 pl-4 pr-3 font-semibold text-slate-800 whitespace-nowrap">
                                        {formatDateNew(p.PaymentDate)}
                                    </td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10px]">
                                            {p.PaymentType}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-right font-black text-emerald-700 whitespace-nowrap">
                                        ₹ {p.Amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-3 py-2.5 text-slate-500 text-xs">
                                        {p.Note || '-'}
                                    </td>
                                    <td className="py-2.5 pl-3 pr-4 text-center whitespace-nowrap">
                                        <button
                                            onClick={() => onDeletePayment(p.PaymentId)}
                                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                            title="Delete Payment"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
