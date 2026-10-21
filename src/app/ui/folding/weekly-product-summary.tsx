'use client';

import React, { useState } from 'react';
import { CubeIcon } from '@heroicons/react/24/outline';

export interface ProductSummaryStat {
    given: number;
    return: number;
    net: number;
    folded: number;
    foldedGiven: number;
    foldedReturn: number;
}

interface WeeklyProductSummaryProps {
    overallProductSummary: Record<string, ProductSummaryStat>;
    recordsCount: number;
    totalGivenCount: number;
    totalReturnCount: number;
    totalFoldedGivenCount: number;
    netPiecesRemaining: number;
}

export default function WeeklyProductSummary({
    overallProductSummary,
    recordsCount,
    totalGivenCount,
    totalReturnCount,
    totalFoldedGivenCount,
    netPiecesRemaining
}: WeeklyProductSummaryProps) {
    const [productViewMode, setProductViewMode] = useState<'table' | 'cards'>('table');
    const [onlyActiveProducts, setOnlyActiveProducts] = useState(true);

    const activeOverallProducts = Object.entries(overallProductSummary).filter(
        ([_, stats]) => stats.given > 0 || stats.return > 0 || stats.net !== 0 || stats.folded > 0
    );

    const displayedOverallProducts = onlyActiveProducts
        ? activeOverallProducts
        : Object.entries(overallProductSummary);

    return (
        <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <CubeIcon className="h-5 w-5 text-purple-600" />
                        Product-wise Aggregate Reconciliation
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Consolidated piece counts (Given vs Return &amp; Net with Folder) for each product across all {recordsCount} periods
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Active Only Filter */}
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
                        <input
                            type="checkbox"
                            checked={onlyActiveProducts}
                            onChange={(e) => setOnlyActiveProducts(e.target.checked)}
                            className="rounded text-purple-600 focus:ring-purple-400 h-3.5 w-3.5"
                        />
                        <span>Active only ({activeOverallProducts.length})</span>
                    </label>

                    {/* View Mode Switcher */}
                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setProductViewMode('table')}
                            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${productViewMode === 'table'
                                ? 'bg-white text-purple-700 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Table
                        </button>
                        <button
                            type="button"
                            onClick={() => setProductViewMode('cards')}
                            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${productViewMode === 'cards'
                                ? 'bg-white text-purple-700 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Cards
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {displayedOverallProducts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                    No product activity recorded in the filtered periods.
                </p>
            ) : productViewMode === 'table' ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                            <tr>
                                <th className="py-2.5 pl-4 pr-3">Product Name</th>
                                <th className="px-3 py-2.5 text-right text-blue-700">Total Given</th>
                                <th className="px-3 py-2.5 text-right text-amber-700">
                                    <span className="px-3 py-2.5 text-right text-purple-700 bg-purple-50/40">(Folded)</span>
                                    Total Return
                                </th>
                                <th className="px-3 py-2.5 text-right font-black text-slate-800">Net with Folder</th>
                                <th className="px-3 py-2.5 text-center">Return %</th>
                                <th className="px-3 py-2.5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedOverallProducts.map(([product, stats]) => {
                                const returnRate = stats.given > 0
                                    ? Math.min(100, Math.round((stats.return / stats.given) * 100))
                                    : (stats.return > 0 ? 100 : 0);
                                const isBalanced = stats.net === 0 && (stats.given > 0 || stats.return > 0);
                                const hasPending = stats.net > 0;
                                { console.log("stats", stats) }

                                return (
                                    <tr key={product} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2.5 pl-4 pr-3 font-bold text-slate-800 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-purple-500" />
                                                <span>{product}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-extrabold text-blue-700 whitespace-nowrap">
                                            {stats.given > 0 ? `+${stats.given.toLocaleString()} Pcs` : '-'}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-extrabold text-amber-700 whitespace-nowrap">
                                            {stats.foldedGiven > 0 ? (
                                                <span className="rounded text-purple-900 border border-purple-200 font-extrabold text-[11px] mr-2">
                                                    ({stats.foldedGiven.toLocaleString()})
                                                </span>
                                            ) : ""}
                                            {stats.return > 0 ? `-${stats.return.toLocaleString()} Pcs` : '-'}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-black whitespace-nowrap">
                                            {stats.net !== 0 ? (
                                                <span className={stats.net > 0 ? 'text-emerald-800 font-black' : 'text-amber-800 font-black'}>
                                                    {stats.net > 0 ? `+${stats.net.toLocaleString()}` : stats.net.toLocaleString()} Pcs
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">0 Pcs</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2 min-w-[100px]">
                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${returnRate >= 100
                                                            ? 'bg-emerald-500'
                                                            : returnRate >= 50
                                                                ? 'bg-blue-500'
                                                                : 'bg-amber-500'
                                                            }`}
                                                        style={{ width: `${Math.min(100, returnRate)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-600">{returnRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                            {isBalanced ? (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                                    Settled
                                                </span>
                                            ) : hasPending ? (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                                                    {stats.net.toLocaleString()} Pcs with Folder
                                                </span>
                                            ) : stats.net < 0 ? (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                                    Excess Return
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-200 text-slate-800">
                            <tr>
                                <td className="py-2.5 pl-4 pr-3 uppercase tracking-wider text-[11px]">Total Product Sum</td>
                                <td className="px-3 py-2.5 text-right font-black text-blue-700">+{totalGivenCount.toLocaleString()} Pcs</td>
                                <td className="px-3 py-2.5 text-right font-black text-amber-700">
                                    <span className="px-3 py-2.5 text-right font-black text-purple-800 bg-purple-50/20">
                                        {totalFoldedGivenCount > 0 ? `(Fold: ${totalFoldedGivenCount.toLocaleString()})` : ''}
                                    </span>
                                    -{totalReturnCount.toLocaleString()} Pcs
                                </td>
                                <td className="px-3 py-2.5 text-right font-black text-emerald-800">{netPiecesRemaining.toLocaleString()} Pcs</td>
                                <td className="px-3 py-2.5 text-center font-bold text-slate-600">
                                    {totalGivenCount > 0 ? `${Math.min(100, Math.round((totalReturnCount / totalGivenCount) * 100))}%` : '-'}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                    {netPiecesRemaining === 0 ? (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">All Settled</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                                            {netPiecesRemaining.toLocaleString()} Total Pending
                                        </span>
                                    )}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {displayedOverallProducts.map(([product, stats]) => {
                        const returnRate = stats.given > 0
                            ? Math.min(100, Math.round((stats.return / stats.given) * 100))
                            : (stats.return > 0 ? 100 : 0);
                        const isBalanced = stats.net === 0 && (stats.given > 0 || stats.return > 0);

                        return (
                            <div key={product} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-2 hover:bg-white hover:shadow-xs transition-all">
                                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                                    <span className="text-sm text-purple-900">{product}</span>
                                    {isBalanced ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">Settled</span>
                                    ) : stats.net > 0 ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold">Pending</span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400">0</span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Given:</span>
                                        <span className="font-extrabold text-blue-700">{stats.given > 0 ? `+${stats.given.toLocaleString()}` : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Return:</span>
                                        <span className="font-extrabold text-amber-700">{stats.return > 0 ? `-${stats.return.toLocaleString()}` : '-'}</span>
                                    </div>
                                    {stats.folded > 0 && (
                                        <div className="flex justify-between text-purple-700 font-bold">
                                            <span>Folded:</span>
                                            <span className="bg-purple-100 px-1 rounded text-purple-900">{stats.folded.toLocaleString()} Pcs</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-1 border-t border-slate-200/60 font-black">
                                        <span className="text-slate-700">Net:</span>
                                        <span className={stats.net > 0 ? 'text-emerald-800' : 'text-slate-600'}>
                                            {stats.net.toLocaleString()} Pcs
                                        </span>
                                    </div>
                                </div>
                                {/* Return Progress Bar */}
                                <div className="pt-1">
                                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                        <span>Return Rate</span>
                                        <span>{returnRate}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${returnRate >= 100
                                                ? 'bg-emerald-500'
                                                : returnRate >= 50
                                                    ? 'bg-blue-500'
                                                    : 'bg-amber-500'
                                                }`}
                                            style={{ width: `${Math.min(100, returnRate)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
