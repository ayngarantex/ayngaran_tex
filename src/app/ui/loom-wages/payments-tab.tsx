'use client';

import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { removeLoomWagePayment } from '@/app/api/node/loom-wages';
import { formatDateNew } from '@/app/lib/utils';
import { WeeklyConsolidatedRecord } from './types';

interface PaymentsTabProps {
    record: WeeklyConsolidatedRecord;
    rowKey: string;
    onReload: () => void;
}

export default function PaymentsTab({ record, onReload }: PaymentsTabProps) {
    const handleDeletePayment = async (paymentId: number) => {
        if (!confirm('Are you sure you want to delete this payment record?')) return;

        const res = await removeLoomWagePayment(paymentId);
        if (res.success) {
            onReload();
        } else {
            alert(res.error || 'Failed to delete payment');
        }
    };

    return (
        <div>
            {record.Payments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3 text-center">
                    No payments recorded yet for this week ({formatDateNew(record.WeekStartDate)} – {formatDateNew(record.WeekEndDate)}). Click &quot;Add Payment&quot; to record one.
                </p>
            ) : (
                <div className="divide-y divide-slate-100 text-xs">
                    {record.Payments.map((p) => (
                        <div
                            key={p.PaymentId}
                            className="py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-800">{formatDateNew(p.PaymentDate)}</span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                    {p.PaymentType}
                                </span>
                                {p.Note && (
                                    <span className="text-slate-500 italic max-w-xs truncate">
                                        &quot;{p.Note}&quot;
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-emerald-700 text-sm">
                                    ₹ {p.Amount.toFixed(2)}
                                </span>
                                <button
                                    onClick={() => handleDeletePayment(p.PaymentId)}
                                    title="Delete payment entry"
                                    className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

