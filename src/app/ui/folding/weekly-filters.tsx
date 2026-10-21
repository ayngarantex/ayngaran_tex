'use client';

import React from 'react';
import {
    MagnifyingGlassIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

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
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3.5 border border-slate-200 shadow-sm">
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
                <div className="text-xs font-semibold text-slate-400">
                    {recordsCount} Weekly Period{recordsCount === 1 ? '' : 's'}
                </div>
            </div>
        </div>
    );
}
