'use client';

import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    CalendarIcon,
    DocumentTextIcon,
    TagIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { FoldingItems, Folders } from '@/app/lib/utils';
import { saveFoldingEntry, modifyFoldingEntry } from '@/app/api/node/folding';

export interface FoldingEntry {
    FoldingId?: number;
    Date: string;
    DcNumber?: string;
    LoomId?: number;
    Folder?: string;
    Type?: string;
    FoldedStatus?: string;
    TotalCount?: number;
    Items: Record<string, number>;
    Notes?: string;
}

interface FoldingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: FoldingEntry | null;
    looms?: any[];
    newType: string;
}

export default function FoldingModal({
    isOpen,
    onClose,
    onSuccess,
    initialData,
    looms,
    newType
}: FoldingModalProps) {
    const todayStr = new Date().toISOString().split('T')[0];
    const foldingItemList = FoldingItems();

    const [date, setDate] = useState(todayStr);
    const [dcNumber, setDcNumber] = useState('');
    const [type, setType] = useState(newType);
    const [folder, setFolder] = useState('R Tex Folding');
    const [loomId, setLoomId] = useState<number | undefined>(30036);
    const [foldedStatus, setFoldedStatus] = useState<'unfolded' | 'folded' | 'damage'>(newType === 'Return' ? 'unfolded' : 'folded');
    const [notes, setNotes] = useState('');
    const [itemCounts, setItemCounts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (initialData) {
                setDate(initialData.Date || todayStr);
                setDcNumber(initialData.DcNumber || '');
                setType(newType);
                setFolder(initialData.Folder || 'R Tex Folding');
                setLoomId(initialData.LoomId || 30036);
                setFoldedStatus(newType === 'Return' ? 'folded' : 'unfolded');
                setNotes(initialData.Notes || '');
                const counts: Record<string, string> = {};
                foldingItemList.forEach(item => {
                    const val = initialData.Items?.[item];
                    counts[item] = val !== undefined && val !== null ? String(val) : '';
                });
                setItemCounts(counts);
            } else {
                setDate(todayStr);
                setDcNumber('');
                setType(newType);
                setFolder('R Tex Folding');
                setLoomId(30036);
                setFoldedStatus(newType === 'Return' ? 'folded' : 'unfolded');
                setNotes('');
                const emptyCounts: Record<string, string> = {};
                foldingItemList.forEach(item => {
                    emptyCounts[item] = '';
                });
                setItemCounts(emptyCounts);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleCountChange = (item: string, value: string) => {
        setItemCounts(prev => ({
            ...prev,
            [item]: value
        }));
    };

    // Calculate live total pieces
    const totalPieces = Object.values(itemCounts).reduce((sum, val) => {
        const num = parseInt(val, 10);
        return sum + (isNaN(num) || num < 0 ? 0 : num);
    }, 0);

    const nonZeroCount = Object.values(itemCounts).filter(val => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0;
    }).length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!date) {
            setError('Please select a valid date.');
            return;
        }

        const formattedItems: Record<string, number> = {};
        let hasAnyCount = false;

        foldingItemList.forEach(item => {
            const raw = itemCounts[item];
            const num = parseInt(raw, 10);
            if (!isNaN(num) && num > 0) {
                formattedItems[item] = num;
                hasAnyCount = true;
            } else {
                formattedItems[item] = 0;
            }
        });

        if (!hasAnyCount) {
            setError('Please enter at least one piece count for the folding items.');
            return;
        }

        setLoading(true);

        try {
            if (initialData?.FoldingId) {
                const res = await modifyFoldingEntry(initialData.FoldingId, {
                    Date: date,
                    DcNumber: dcNumber.trim(),
                    LoomId: loomId,
                    Type: type,
                    Folder: folder,
                    FoldedStatus: foldedStatus,
                    Items: formattedItems,
                    Notes: notes.trim()
                });

                if (res.success) {
                    onSuccess();
                    onClose();
                } else {
                    setError(res.error || 'Failed to update folding entry.');
                }
            } else {
                const res = await saveFoldingEntry({
                    Date: date,
                    DcNumber: dcNumber.trim(),
                    LoomId: loomId,
                    Type: type,
                    Folder: folder,
                    FoldedStatus: foldedStatus,
                    Items: formattedItems,
                    Notes: notes.trim()
                });

                if (res.success) {
                    onSuccess();
                    onClose();
                } else {
                    setError(res.error || 'Failed to save folding entry.');
                }
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
            <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <TagIcon className="h-6 w-6 text-emerald-600" />
                            {initialData?.FoldingId ? 'Edit Folding Entry' : 'New Folding Entry'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Enter the date and piece counts for each folding item
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                    {error && (
                        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Top Row: Date, DC Number, Type, Folder, Folded Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <CalendarIcon className="h-4 w-4 text-emerald-600" />
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <DocumentTextIcon className="h-4 w-4 text-slate-500" />
                                DC No.
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. DC-101"
                                value={dcNumber}
                                onChange={(e) => setDcNumber(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                onChange={(e) => {
                                    setType(e.target.value)
                                }}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                value={type}
                            >
                                <option value="" disabled>Select a Type</option>
                                <option key={"Given"} value={"Given"}> Given </option>
                                <option key={"Return"} value={"Return"}> Return </option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                Folder
                            </label>
                            <select
                                id="folder"
                                name="folder"
                                onChange={(e) => {
                                    const selectedVal = e.target.value;
                                    setFolder(selectedVal);
                                    if (looms && looms.length > 0) {
                                        const found = looms.find((l: any) => l.LoomName === selectedVal || String(l.LoomId) === selectedVal);
                                        if (found) {
                                            setLoomId(found.LoomId);
                                            setFolder(found.LoomName);
                                        }
                                    } else if (selectedVal === 'R Tex' || selectedVal === 'R Tex Folding') {
                                        setLoomId(30036);
                                    }
                                }}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                value={folder}
                            >
                                <option value="" disabled>Select a Folder</option>
                                {looms && looms.length > 0 ? (
                                    looms.map((l: any) => (
                                        <option key={l.LoomId} value={l.LoomName}>
                                            {l.LoomName}
                                        </option>
                                    ))
                                ) : (
                                    Folders().map((folder: any) => (
                                        <option key={folder} value={folder}>
                                            {folder}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                <span>Folding</span>
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${foldedStatus === 'folded' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                    {foldedStatus === 'folded' ? 'No Wage' : 'Payable'}
                                </span>
                            </label>
                            <select
                                id="foldedStatus"
                                name="foldedStatus"
                                value={foldedStatus}
                                onChange={(e) => setFoldedStatus(e.target.value as 'unfolded' | 'folded')}
                                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold outline-none transition-all ${foldedStatus === 'folded'
                                    ? 'border-amber-300 bg-amber-50/50 text-amber-900 focus:border-amber-500'
                                    : 'border-slate-200 bg-white text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                                    }`}
                            >
                                <option value="folded">Folded (No Wage)</option>
                                {newType === 'Given' ?
                                    <option value="unfolded">Unfolded (Default)</option>
                                    :
                                    <option value="damag">Damaged</option>
                                }
                            </select>
                        </div>
                    </div>

                    {/* Section Header with Live Summary */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 pb-1">
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                                Folding Items (Piece Counts)
                            </h4>
                            <p className="text-xs text-slate-500">
                                Enter the quantity of folded pieces received per item
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-600">
                                {nonZeroCount} of {foldingItemList.length} items
                            </span>
                            <span className="text-sm px-3 py-1 rounded-full bg-emerald-100 font-extrabold text-emerald-800 border border-emerald-200">
                                Total: {totalPieces.toLocaleString()} Pcs
                            </span>
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {foldingItemList.map((item) => {
                            const val = itemCounts[item] || '';
                            const num = parseInt(val, 10);
                            const hasCount = !isNaN(num) && num > 0;

                            return (
                                <div
                                    key={item}
                                    className={`p-3 rounded-xl border transition-all ${hasCount
                                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <label className="block text-xs font-bold text-slate-700 truncate mb-1.5" title={item}>
                                        {item}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={val}
                                            onChange={(e) => handleCountChange(item, e.target.value)}
                                            className={`w-full rounded-lg px-2.5 py-1.5 text-sm font-extrabold outline-none transition-all ${hasCount
                                                ? 'bg-white text-emerald-800 border border-emerald-300 shadow-sm'
                                                : 'bg-white text-slate-800 border border-slate-200 placeholder:text-slate-300 focus:border-emerald-500'
                                                }`}
                                        />
                                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 pointer-events-none">
                                            pcs
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Notes Field */}
                    <div className="border-t border-slate-100 pt-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Notes / Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Add any additional details or notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/60 rounded-b-2xl flex-shrink-0">
                    <div className="text-xs text-slate-600 font-medium">
                        Total Sum: <strong className="text-emerald-700 font-extrabold text-sm">{totalPieces.toLocaleString()} Pcs</strong>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="h-4 w-4 stroke-[3]" />
                                    {initialData?.FoldingId ? 'Update Entry' : 'Save Entry'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
