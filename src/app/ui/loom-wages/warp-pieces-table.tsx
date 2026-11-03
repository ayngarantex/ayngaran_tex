'use client';

import React, { useState } from 'react';
import {
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { saveWarpCustomRate } from '@/app/api/node/loom-wages';
import { formatDateNew } from '@/app/lib/utils';
import { WarpPieceEntry } from './types';

interface WarpPiecesTableProps {
    pieces: WarpPieceEntry[];
    dcNumber: string;
    loomId: number;
    onReload: () => void;
}

export default function WarpPiecesTable({
    pieces,
    dcNumber,
    loomId,
    onReload
}: WarpPiecesTableProps) {
    const [editingPieceKey, setEditingPieceKey] = useState<string | null>(null);
    const [tempWarpRate, setTempWarpRate] = useState<string>('');

    const handleSaveWarpRate = async (sizingId?: number, warpId?: number, targetLoomId?: number) => {
        const rate = parseFloat(tempWarpRate);
        if (isNaN(rate) || rate < 0) {
            alert('Please enter a valid wage rate');
            return;
        }

        const res = await saveWarpCustomRate(sizingId || 0, rate, warpId, targetLoomId);
        if (res.success) {
            setEditingPieceKey(null);
            onReload();
        } else {
            alert(res.error || 'Failed to save warp wage rate');
        }
    };

    return (
        <div className="mt-2 overflow-x-auto pt-2 border-t border-slate-200/60">
            <table className="w-full text-left text-xs bg-white rounded-lg overflow-hidden border border-slate-200">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Warp / Sizing ID</th>
                        <th className="py-2 px-3 text-right">Piece #</th>
                        <th className="py-2 px-3 text-right">Count</th>
                        <th className="py-2 px-3 text-right">Wage Rate (₹/Dhoti)</th>
                        <th className="py-2 px-3 text-right">Calculated Wage (₹)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {pieces.map((p, pIdx) => {
                        const pieceKey = p.WarpId ? `warp_${p.WarpId}` : `piece_${dcNumber}_${pIdx}`;
                        const isEditingWarp = editingPieceKey === pieceKey;

                        return (
                            <tr key={`p-${pIdx}`} className="hover:bg-slate-50">
                                <td className="py-1.5 px-3 font-semibold">{formatDateNew(p.Date)}</td>
                                <td className="py-1.5 px-3">
                                    {p.SizingId ? (
                                        <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                                            Sizing #{p.SizingId} {p.WarpId ? `(Warp #${p.WarpId})` : ''}
                                        </span>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </td>
                                <td className="py-1.5 px-3 text-right font-bold">{p.Piece || '-'}</td>
                                <td className="py-1.5 px-3 text-right font-extrabold text-blue-700">{p.Count} Pcs</td>

                                {/* Wage Rate Column with Manual Override */}
                                <td className="py-1.5 px-3 text-right font-bold">
                                    {isEditingWarp ? (
                                        <div className="flex items-center justify-end gap-1">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={tempWarpRate}
                                                onChange={(e) => setTempWarpRate(e.target.value)}
                                                className="w-16 rounded border border-indigo-300 px-1.5 py-0.5 text-xs font-bold"
                                            />
                                            <button
                                                onClick={() => handleSaveWarpRate(p.SizingId, p.WarpId, loomId)}
                                                className="p-0.5 rounded bg-emerald-600 text-white cursor-pointer"
                                                title="Save custom rate"
                                            >
                                                <CheckIcon className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => setEditingPieceKey(null)}
                                                className="p-0.5 rounded bg-slate-200 text-slate-600 cursor-pointer"
                                                title="Cancel"
                                            >
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span>₹ {p.WageRate.toFixed(2)}</span>
                                            {p.HasCustomWarpRate && (
                                                <span className="text-[10px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                                                    Custom
                                                </span>
                                            )}
                                            {(p.WarpId || p.SizingId) && (
                                                <button
                                                    onClick={() => {
                                                        setEditingPieceKey(pieceKey);
                                                        setTempWarpRate(String(p.WageRate));
                                                    }}
                                                    title="Edit rate for this warp"
                                                    className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                                                >
                                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>

                                {/* Calculated Wage */}
                                <td className="py-1.5 px-3 text-right font-extrabold text-emerald-700">
                                    ₹ {p.CalculatedWage.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

