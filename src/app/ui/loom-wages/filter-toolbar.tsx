'use client';

import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    CalendarIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import {
    saveLoomDefaultRate,
    saveLoomOpeningBalance
} from '@/app/api/node/loom-wages';
import LoomLumpSumPaymentModal from './loom-lump-sum-payment-modal';

interface FilterToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedLoomId: string;
    setSelectedLoomId: (loomId: string) => void;
    startDateFilter: string;
    setStartDateFilter: (date: string) => void;
    looms: any[];
    onFilterChange: (newQuery?: string, newLoomId?: string, newStartDate?: string) => void;
    onReload: () => void;
}

export default function FilterToolbar({
    searchQuery,
    setSearchQuery,
    selectedLoomId,
    setSelectedLoomId,
    startDateFilter,
    setStartDateFilter,
    looms,
    onFilterChange,
    onReload
}: FilterToolbarProps) {
    // Editing Loom Default Rate state
    const [editingLoomId, setEditingLoomId] = useState<number | null>(null);
    const [tempLoomRate, setTempLoomRate] = useState<string>('');

    // Editing Loom Opening Balance state
    const [editingOpeningBalanceLoomId, setEditingOpeningBalanceLoomId] = useState<number | null>(null);
    const [tempOpeningBalance, setTempOpeningBalance] = useState<string>('');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleSaveLoomRate = async (loomId: number) => {
        const rate = parseFloat(tempLoomRate);
        if (isNaN(rate) || rate < 0) {
            alert('Please enter a valid wage rate');
            return;
        }

        const res = await saveLoomDefaultRate(loomId, rate);
        if (res.success) {
            setEditingLoomId(null);
            onReload();
        } else {
            alert(res.error || 'Failed to save loom wage rate');
        }
    };

    const handleSaveOpeningBalance = async (loomId: number) => {
        const balance = parseFloat(tempOpeningBalance);
        if (isNaN(balance)) {
            alert('Please enter a valid opening balance');
            return;
        }

        const res = await saveLoomOpeningBalance(loomId, balance);
        if (res.success) {
            setEditingOpeningBalanceLoomId(null);
            onReload();
        } else {
            alert(res.error || 'Failed to save opening balance');
        }
    };

    const selectedLoom = selectedLoomId ? looms.find((l: any) => String(l.LoomId) === String(selectedLoomId)) : null;
    const isEditingRate = selectedLoom && editingLoomId === Number(selectedLoomId);
    const isEditingOpeningBal = selectedLoom && editingOpeningBalanceLoomId === Number(selectedLoomId);

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
            {/* Mobile View (< md): Search input + Filter toggle icon */}
            <div className="block md:hidden">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Loom, DC #, Color..."
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                onFilterChange(val, undefined, undefined);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen((prev) => !prev)}
                        aria-expanded={isMobileOpen}
                        aria-label="Toggle filters and actions"
                        className={`relative flex items-center justify-center p-2 rounded-xl border transition-all shrink-0 cursor-pointer h-10 w-10 ${
                            isMobileOpen
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : (selectedLoomId || (startDateFilter && startDateFilter !== '2026-09-27'))
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-300 ring-2 ring-indigo-100'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {isMobileOpen ? (
                            <XMarkIcon className="w-5 h-5" />
                        ) : (
                            <>
                                <FunnelIcon className="w-5 h-5" />
                                {(selectedLoomId || (startDateFilter && startDateFilter !== '2026-09-27')) && (
                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                </div>

                {isMobileOpen && (
                    <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl space-y-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filters</span>
                            <div className="flex flex-col gap-2">
                                <select
                                    value={selectedLoomId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedLoomId(val);
                                        onFilterChange(undefined, val, undefined);
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:bg-white outline-none"
                                >
                                    <option value="">All Looms</option>
                                    {looms.map((loom: any) => (
                                        <option key={loom.LoomId} value={loom.LoomId}>
                                            {loom.LoomName} (Rate: ₹{parseFloat(loom.WageRate || 0).toFixed(2)})
                                        </option>
                                    ))}
                                </select>

                                <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
                                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                                    <span>After:</span>
                                    <input
                                        type="date"
                                        value={startDateFilter}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setStartDateFilter(val);
                                            onFilterChange(undefined, undefined, val);
                                        }}
                                        className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</span>
                            <LoomLumpSumPaymentModal
                                looms={looms}
                                initialLoomId={selectedLoom ? selectedLoom.LoomId : undefined}
                                initialLoomName={selectedLoom?.LoomName}
                                onSuccess={onReload}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop View (>= md) */}
            <div className="hidden md:flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
                    {/* Search */}
                    <div className="relative min-w-[240px] flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Loom, DC #, Color..."
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                onFilterChange(val, undefined, undefined);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>

                    {/* Loom Filter */}
                    <select
                        value={selectedLoomId}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedLoomId(val);
                            onFilterChange(undefined, val, undefined);
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    >
                        <option value="">All Looms</option>
                        {looms.map((loom: any) => (
                            <option key={loom.LoomId} value={loom.LoomId}>
                                {loom.LoomName} (Rate: ₹{parseFloat(loom.WageRate || 0).toFixed(2)})
                            </option>
                        ))}
                    </select>

                    {/* Start Date Filter */}
                    <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span>After:</span>
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => {
                                const val = e.target.value;
                                setStartDateFilter(val);
                                onFilterChange(undefined, undefined, val);
                            }}
                            className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Lump-Sum Payment Trigger */}
                <div className="flex items-center gap-2">
                    <LoomLumpSumPaymentModal
                        looms={looms}
                        initialLoomId={selectedLoom ? selectedLoom.LoomId : undefined}
                        initialLoomName={selectedLoom?.LoomName}
                        onSuccess={onReload}
                    />
                </div>
            </div>

            {/* Loom Common Wage Rate & Opening Balance Quick Editor if Loom Selected */}
            {selectedLoom && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900 font-medium">
                    {/* Wage Rate Editor */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Common Wage Rate ({selectedLoom.LoomName}):</span>
                        {isEditingRate ? (
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold">₹</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={tempLoomRate}
                                    onChange={(e) => setTempLoomRate(e.target.value)}
                                    className="w-20 rounded-md border border-indigo-300 px-2 py-1 text-xs font-bold outline-none bg-white"
                                />
                                <button
                                    onClick={() => handleSaveLoomRate(selectedLoom.LoomId)}
                                    className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                    title="Save Rate"
                                >
                                    <CheckIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setEditingLoomId(null)}
                                    className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                                    title="Cancel"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-indigo-700 text-sm">
                                    ₹ {parseFloat(selectedLoom.WageRate || 0).toFixed(2)} / dhoti
                                </span>
                                <button
                                    onClick={() => {
                                        setEditingLoomId(selectedLoom.LoomId);
                                        setTempLoomRate(String(selectedLoom.WageRate || 0));
                                    }}
                                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-bold text-xs cursor-pointer"
                                >
                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                    Edit Rate
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Opening Balance (Before 2026-09-27) Editor */}
                    <div className="flex items-center gap-2 border-l border-indigo-200 pl-3">
                        <span className="font-bold">Opening Balance (Before 2026-09-27):</span>
                        {isEditingOpeningBal ? (
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tempOpeningBalance}
                                    onChange={(e) => setTempOpeningBalance(e.target.value)}
                                    className="w-24 rounded-md border border-indigo-300 px-2 py-1 text-xs font-bold outline-none bg-white"
                                />
                                <button
                                    onClick={() => handleSaveOpeningBalance(selectedLoom.LoomId)}
                                    className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                    title="Save Opening Balance"
                                >
                                    <CheckIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setEditingOpeningBalanceLoomId(null)}
                                    className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                                    title="Cancel"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-amber-800 text-sm">
                                    ₹ {parseFloat(selectedLoom.OpeningBalance || 0).toFixed(2)}
                                </span>
                                <button
                                    onClick={() => {
                                        setEditingOpeningBalanceLoomId(selectedLoom.LoomId);
                                        setTempOpeningBalance(String(selectedLoom.OpeningBalance || 0));
                                    }}
                                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-bold text-xs cursor-pointer"
                                >
                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                    Edit Balance
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
