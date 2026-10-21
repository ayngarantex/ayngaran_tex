'use client';

import React from 'react';
import {
    ArrowUpRightIcon,
    ArrowDownLeftIcon,
    TagIcon
} from '@heroicons/react/24/outline';

interface WeeklyMetricsProps {
    totalGivenCount: number;
    totalReturnCount: number;
    totalFoldedGivenCount: number;
    netPiecesRemaining: number;
    totalCalculatedWagesSum: number;
    totalPaymentsSum: number;
    totalBalanceDue: number;
}

export default function WeeklyMetrics({
    totalGivenCount,
    totalReturnCount,
    totalFoldedGivenCount,
    netPiecesRemaining,
    totalCalculatedWagesSum,
    totalPaymentsSum,
    totalBalanceDue
}: WeeklyMetricsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Given */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <ArrowUpRightIcon className="h-4 w-4" />
                    Total Given
                </div>
                <p className="text-xl font-extrabold text-blue-900">
                    {totalGivenCount.toLocaleString()} <span className="text-[11px] font-semibold text-blue-600">Pcs</span>
                </p>
                {totalFoldedGivenCount > 0 && (
                    <p className="text-[10px] font-bold text-purple-700 mt-1 inline-flex items-center gap-1 bg-purple-100/80 px-1.5 py-0.5 rounded border border-purple-200">
                        {totalFoldedGivenCount.toLocaleString()} Pcs Folded
                    </p>
                )}
            </div>

            {/* Total Return */}
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-orange-50/50 p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <ArrowDownLeftIcon className="h-4 w-4" />
                    Total Return
                </div>
                <p className="text-xl font-extrabold text-amber-900">
                    {totalReturnCount.toLocaleString()} <span className="text-[11px] font-semibold text-amber-600">Pcs</span>
                </p>
                {totalFoldedGivenCount > 0 && (
                    <p
                        className="text-[10px] font-bold text-purple-700 mt-1 inline-flex items-center gap-1 bg-purple-100/80 px-1.5 py-0.5 rounded border border-purple-200"
                        title="Folded pieces are not paid folding wages"
                    >
                        {totalFoldedGivenCount.toLocaleString()} Pcs Folded (No Wage)
                    </p>
                )}
            </div>

            {/* Net with Folder */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <TagIcon className="h-4 w-4" />
                    Net with Folder
                </div>
                <p className="text-xl font-extrabold text-emerald-900">
                    {netPiecesRemaining.toLocaleString()} <span className="text-[11px] font-semibold text-emerald-600">Pcs</span>
                </p>
            </div>

            {/* Total Wages */}
            <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-violet-50/50 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Total Wages</p>
                <p className="text-xl font-extrabold text-purple-900">
                    ₹ {totalCalculatedWagesSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
            </div>

            {/* Total Paid */}
            <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50/70 to-sky-50/50 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">Total Paid</p>
                <p className="text-xl font-extrabold text-cyan-900">
                    ₹ {totalPaymentsSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
            </div>

            {/* Balance Due */}
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/70 to-red-50/50 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">Balance Due</p>
                <p className="text-xl font-extrabold text-rose-900">
                    ₹ {totalBalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );
}
