'use client';

import React from 'react';
import {
    MagnifyingGlassIcon,
    CalendarIcon,
    FunnelIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import FoldingLumpSumPaymentModal from './folding-lump-sum-payment-modal';

interface WeeklyFiltersProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
    selectedLoomId: string;
    onLoomChange: (val: string) => void;
    startDateFilter: string;
    onStartDateChange: (val: string) => void;
    looms: any[];
    recordsCount: number;
}

export default function WeeklyFilters({
    searchQuery,
    onSearchChange,
    selectedLoomId,
    onLoomChange,
    startDateFilter,
    onStartDateChange,
    looms,
    recordsCount
}: WeeklyFiltersProps) {
    const selectedLoom = selectedLoomId ? looms.find((l: any) => String(l.LoomId) === String(selectedLoomId)) : null;
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const hasActiveFilters = Boolean(selectedLoomId || (startDateFilter && startDateFilter !== '2026-09-27'));

    return (
        <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-sm">
            {/* Mobile View (< md): Search input + Filter toggle icon */}
            <div className="block md:hidden">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search DC #, folder, notes..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen((prev) => !prev)}
                        aria-expanded={isMobileOpen}
                        aria-label="Toggle filters and actions"
                        className={`relative flex items-center justify-center p-2 rounded-xl border transition-all shrink-0 cursor-pointer h-9 w-9 ${
                            isMobileOpen
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : hasActiveFilters
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-300 ring-2 ring-emerald-100'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {isMobileOpen ? (
                            <XMarkIcon className="w-4 h-4" />
                        ) : (
                            <>
                                <FunnelIcon className="w-4 h-4" />
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
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
                                    onChange={(e) => onLoomChange(e.target.value)}
                                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                                >
                                    <option value="">All Folders / Looms</option>
                                    {looms.map((l: any) => (
                                        <option key={l.LoomId} value={l.LoomId}>
                                            {l.LoomName}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
                                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                                    <span>From:</span>
                                    <input
                                        type="date"
                                        value={startDateFilter}
                                        onChange={(e) => onStartDateChange(e.target.value)}
                                        className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</span>
                            <div className="flex items-center justify-between gap-2">
                                <FoldingLumpSumPaymentModal
                                    looms={looms}
                                    initialLoomId={selectedLoom ? selectedLoom.LoomId : undefined}
                                    initialLoomName={selectedLoom?.LoomName}
                                />
                                <div className="text-xs font-semibold text-slate-400">
                                    {recordsCount} Period{recordsCount === 1 ? '' : 's'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop View (>= md) */}
            <div className="hidden md:flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative min-w-[220px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search DC #, folder, notes..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                    </div>

                    {/* Folder / Loom Selector */}
                    <select
                        value={selectedLoomId}
                        onChange={(e) => onLoomChange(e.target.value)}
                        className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                    >
                        <option value="">All Folders / Looms</option>
                        {looms.map((l: any) => (
                            <option key={l.LoomId} value={l.LoomId}>
                                {l.LoomName}
                            </option>
                        ))}
                    </select>

                    {/* Start Date */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span>From:</span>
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <FoldingLumpSumPaymentModal
                        looms={looms}
                        initialLoomId={selectedLoom ? selectedLoom.LoomId : undefined}
                        initialLoomName={selectedLoom?.LoomName}
                    />
                    <div className="text-xs font-semibold text-slate-400">
                        {recordsCount} Weekly Period{recordsCount === 1 ? '' : 's'}
                    </div>
                </div>
            </div>
        </div>
    );
}
