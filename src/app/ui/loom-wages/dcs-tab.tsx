'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    CubeIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { formatDateNew } from '@/app/lib/utils';
import { WeeklyConsolidatedRecord } from './types';
import WarpPiecesTable from './warp-pieces-table';

interface DcsTabProps {
    record: WeeklyConsolidatedRecord;
    rowKey: string;
    onReload: () => void;
}

export default function DcsTab({ record, rowKey, onReload }: DcsTabProps) {
    const [expandedDcKey, setExpandedDcKey] = useState<string | null>(null);

    return (
        <div className="space-y-3">
            {record.Dcs.map((dcItem, dcIdx) => {
                const dcSubKey = `${rowKey}_dc_${dcItem.Dc}_${dcIdx}`;
                const isDcPiecesExpanded = expandedDcKey === dcSubKey;

                return (
                    <div key={dcSubKey} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs space-y-2">
                        {/* DC Summary Bar */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <span className="font-extrabold text-blue-700 text-sm">
                                    DC #{dcItem.Dc}
                                </span>
                                <span className="text-slate-500 font-medium">
                                    Date: <strong className="text-slate-800">{formatDateNew(dcItem.DcDate)}</strong>
                                </span>
                                <span className="text-slate-600 font-medium">
                                    Color: <strong>{dcItem.Color}</strong>
                                </span>
                                {dcItem.SizingId && (
                                    <Link
                                        href={`/admin/sizing/${dcItem.SizingId}/edit`}
                                        className="text-blue-600 hover:underline font-semibold"
                                    >
                                        Sizing #{dcItem.SizingId}
                                    </Link>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-bold text-slate-800">
                                    Dhoties: <span className="text-emerald-700 font-extrabold">{dcItem.TotalCount} Pcs</span>
                                </span>
                                <span className="font-bold text-blue-700">
                                    Wages: ₹ {dcItem.TotalCalculatedWages.toFixed(2)}
                                </span>

                                <button
                                    onClick={() => setExpandedDcKey(isDcPiecesExpanded ? null : dcSubKey)}
                                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <CubeIcon className="h-3.5 w-3.5 text-indigo-500" />
                                    {dcItem.Pieces.length} Piece{dcItem.Pieces.length > 1 ? 's' : ''}
                                    {isDcPiecesExpanded ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                                </button>
                            </div>
                        </div>

                        {/* Pieces Sub-table */}
                        {isDcPiecesExpanded && (
                            <WarpPiecesTable
                                pieces={dcItem.Pieces}
                                dcNumber={dcItem.Dc}
                                loomId={record.LoomId}
                                onReload={onReload}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

