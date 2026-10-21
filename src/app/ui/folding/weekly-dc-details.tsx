'use client';

import React, { useState } from 'react';
import {
    CubeIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { formatDateNew } from '@/app/lib/utils';
import { UpdateFolding, DeleteFolding } from './buttons';
import type { WeeklyFoldingRecord } from './weekly-table';

interface WeeklyDcDetailsProps {
    rec: WeeklyFoldingRecord;
    looms: any[];
    foldingItemList: string[];
}

export default function WeeklyDcDetails({
    rec,
    looms,
    foldingItemList
}: WeeklyDcDetailsProps) {
    const [expandedDcId, setExpandedDcId] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            {/* Summary Pills for this Week */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">Week Summary:</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    Total Given: +{rec.TotalGivenCount.toLocaleString()} Pcs
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                    Total Return: -{rec.TotalReturnCount.toLocaleString()} Pcs
                    {rec.TotalFoldedReturnCount && rec.TotalFoldedReturnCount > 0 ? (
                        <span className="text-[10px] text-amber-700 font-normal ml-1">
                            ({(rec.TotalPayableReturnCount ?? (rec.TotalReturnCount - rec.TotalFoldedReturnCount)).toLocaleString()} Paid, {rec.TotalFoldedReturnCount.toLocaleString()} Folded)
                        </span>
                    ) : null}
                </span>
                {(rec?.TotalFoldedGivenCount || 0) > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-extrabold">
                        Folded: {(rec?.TotalFoldedGivenCount || 0).toLocaleString()} Pcs (₹0.00 Wage)
                    </span>
                ) : null}
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-black">
                    Net Pieces: {rec.NetPieces.toLocaleString()} Pcs
                </span>
                <span className="ml-auto font-extrabold text-slate-800">
                    Calculated Wages: ₹ {rec.TotalCalculatedWages.toFixed(2)}
                </span>
            </div>

            {/* Individual DC Cards */}
            <div className="space-y-2">
                {rec.Entries.map((entry: any) => {
                    const isReturn = entry.Type === 'Return';
                    const isDcExpanded = expandedDcId === entry.FoldingId;

                    // Collect items with quantity > 0
                    const nonZeroItems = Object.entries(entry.Items || {})
                        .filter(([_, qty]) => Number(qty) > 0);

                    return (
                        <div
                            key={entry.FoldingId}
                            className={`rounded-xl border p-3 text-xs space-y-2.5 transition-all ${isReturn
                                ? 'border-amber-300 bg-amber-100'
                                : 'border-slate-300 bg-white'
                                }`}
                        >
                            {/* DC Header Bar */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-extrabold text-blue-700 text-sm">
                                        DC #{entry.DcNumber || 'No DC'}
                                    </span>
                                    <span className="text-slate-500 font-medium">
                                        Date: <strong className="text-slate-800">{formatDateNew(entry.Date)}</strong>
                                    </span>
                                    <span
                                        className={`inline-flex items-center text-[10px] font-extrabold rounded-md px-2 py-0.5 ${entry.Type === 'Given' && entry.FoldedStatus?.toLowerCase() === 'folded'
                                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                            : entry.FoldedStatus?.toLowerCase() === 'damage' ? 'bg-slate-100 text-slate-700 border border-slate-200' : ''
                                            }`}
                                    >
                                        {entry.Type === 'Given' && entry.FoldedStatus?.toLowerCase() === 'folded' ? 'Folded' : (entry.FoldedStatus?.toLowerCase() === 'damage' ? 'Damage' : '')}
                                    </span>
                                    {entry.Notes && (
                                        <span className="text-slate-500 italic max-w-xs truncate">
                                            Note: {entry.Notes}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-slate-800">
                                            <span
                                                className={`font-black text-sm ${isReturn ? 'text-amber-800' : 'text-blue-800'
                                                    }`}
                                            >
                                                {isReturn ? '-' : '+'}{Number(entry.TotalCount || 0).toLocaleString()} Pcs
                                            </span>
                                        </span>
                                        {entry.Type === 'Given' && entry.FoldedStatus?.toLowerCase() === 'folded' && (
                                            <span className="text-[10px] font-extrabold text-purple-700">
                                                Folded: {Number(entry.TotalCount || 0).toLocaleString()} Pcs
                                            </span>
                                        )}
                                    </div>

                                    {isReturn && (
                                        <span
                                            className={`font-extrabold text-xs px-2 py-0.5 rounded-md border text-purple-700 bg-purple-50 border-purple-200`}
                                            title={entry.FoldedStatus?.toLowerCase() === 'folded' ? 'Folded - No wage calculated' : undefined}
                                        >
                                            {`Wages: ₹ ${(Number(entry.TotalCount || 0) * rec.WageRate).toFixed(2)}`}
                                        </span>
                                    )}

                                    {/* Item details toggle button */}
                                    <button
                                        type="button"
                                        onClick={() => setExpandedDcId(isDcExpanded ? null : entry.FoldingId)}
                                        className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px]"
                                    >
                                        <CubeIcon className="h-3.5 w-3.5 text-emerald-600" />
                                        {nonZeroItems.length} Item{nonZeroItems.length === 1 ? '' : 's'}
                                        {isDcExpanded ? (
                                            <ChevronUpIcon className="h-3 w-3" />
                                        ) : (
                                            <ChevronDownIcon className="h-3 w-3" />
                                        )}
                                    </button>

                                    {/* Actions */}
                                    <div className="inline-flex items-center gap-1">
                                        <UpdateFolding entry={entry} looms={looms} type={entry.Type} />
                                        <DeleteFolding id={entry.FoldingId} />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Items Breakdown for this DC */}
                            {isDcExpanded && (
                                <div className="pt-2 border-t border-slate-200/60">
                                    <div className="flex flex-wrap gap-2">
                                        {nonZeroItems.map(([itemName, qty]) => (
                                            <div
                                                key={itemName}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs"
                                            >
                                                <span className="font-semibold text-slate-600">{itemName}:</span>
                                                <span className="font-extrabold text-slate-900">
                                                    {Number(qty).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Consolidated Multi-Item Table */}
            <div className="mt-4 pt-3 border-t border-slate-200">
                <h6 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full DC &amp; Item Breakdown Table
                </h6>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full text-left text-[11px] text-slate-600">
                        <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="py-2.5 pl-4 pr-2">Date</th>
                                <th className="px-2 py-2.5">DC #</th>
                                <th className="px-2 py-2.5">Status</th>
                                {foldingItemList.map(item => (
                                    <th key={item} className="px-2 py-2.5 text-right whitespace-nowrap">
                                        {item}
                                    </th>
                                ))}
                                <th className="px-3 py-2.5 text-right font-black text-slate-800">Total (Pcs)</th>
                                <th className="px-3 py-2.5">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rec.Entries.map((entry: any) => {
                                const isReturn = entry.Type === 'Return';
                                return (
                                    <tr
                                        key={`subtab-${entry.FoldingId}`}
                                        className={`hover:bg-slate-50/90 transition-colors ${isReturn ? 'bg-amber-100' : ''
                                            }`}
                                    >
                                        <td className="py-2 pl-4 pr-2 font-semibold text-slate-800 whitespace-nowrap">
                                            {formatDateNew(entry.Date)}
                                        </td>
                                        <td className="px-2 py-2 font-bold text-slate-700 whitespace-nowrap">
                                            {entry.DcNumber || '-'}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${entry.FoldedStatus?.toLowerCase() === 'folded'
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200 font-extrabold'
                                                    : entry.FoldedStatus?.toLowerCase() === 'damage' ? 'bg-slate-100 text-slate-600' : ''
                                                    }`}
                                            >
                                                {entry.Type === 'Given' && entry.FoldedStatus?.toLowerCase() === 'folded' ? 'Folded' : (entry.FoldedStatus?.toLowerCase() === 'damage' ? 'Damage' : '')}
                                            </span>
                                        </td>
                                        {foldingItemList.map(item => {
                                            const count = Number(entry.Items?.[item]) || 0;
                                            return (
                                                <td key={item} className="px-2 py-2 text-right whitespace-nowrap">
                                                    {count > 0 ? (
                                                        <span
                                                            className={`font-semibold ${isReturn ? 'text-amber-800' : 'text-slate-800'
                                                                }`}
                                                        >
                                                            {count.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-3 py-2 text-right font-black whitespace-nowrap">
                                            <div className="flex flex-col items-end">
                                                <span
                                                    className={`px-1.5 py-0.5 rounded font-bold ${isReturn
                                                        ? 'bg-amber-100 text-amber-900'
                                                        : 'bg-blue-100 text-blue-900'
                                                        }`}
                                                >
                                                    {isReturn ? '-' : '+'}{Number(entry.TotalCount || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-500 truncate max-w-[150px]">
                                            {entry.Notes || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {/* Item by Item Net Summary Footer */}
                        <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-200 text-slate-700">
                            <tr>
                                <td colSpan={3} className="py-2 pl-4 pr-2 uppercase tracking-wider text-[10px]">
                                    Net Balance (Given - Return)
                                </td>
                                {foldingItemList.map(item => {
                                    const net = rec.ItemsSummary[item]?.net || 0;
                                    return (
                                        <td key={item} className="px-2 py-2 text-right whitespace-nowrap font-black">
                                            {net !== 0 ? (
                                                <span className={net > 0 ? 'text-blue-800' : 'text-amber-800'}>
                                                    {net.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="px-3 py-2 text-right font-black text-emerald-800 whitespace-nowrap">
                                    {rec.NetPieces.toLocaleString()} Pcs
                                </td>
                                <td>&nbsp;</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
