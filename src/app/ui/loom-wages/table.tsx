'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    CurrencyRupeeIcon,
    PlusIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    CubeIcon,
    DocumentDuplicateIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import PaymentModal from './payment-modal';
import {
    removeLoomWagePayment,
    saveLoomDefaultRate,
    saveWarpCustomRate,
    saveLoomOpeningBalance
} from '@/app/api/node/loom-wages';
import { formatDateNew } from '@/app/lib/utils';
import Link from 'next/link';

interface PaymentItem {
    PaymentId: number;
    PaymentDate: string;
    Amount: number;
    PaymentType: string;
    Note: string | null;
}

interface WarpPieceEntry {
    DcId: number;
    Date: string;
    Piece: number;
    Count: number;
    Weight: number;
    WarpId?: number;
    SizingId?: number;
    Color: string;
    WageRate: number;
    HasCustomWarpRate: boolean;
    CalculatedWage: number;
}

interface DcSummaryItem {
    Dc: string;
    DcDate: string;
    SizingId?: number;
    Color: string;
    TotalCount: number;
    TotalWeight: number;
    TotalCalculatedWages: number;
    Pieces: WarpPieceEntry[];
}

interface WeeklyConsolidatedRecord {
    LoomId: number;
    LoomName: string;
    DefaultWageRate: number;
    OpeningBalance: number;
    WeekStartDate: string;
    WeekEndDate: string;
    TotalCount: number;
    TotalWeight: number;
    TotalCalculatedWages: number;
    TotalPaidAmount: number;
    BalanceDue: number;
    Dcs: DcSummaryItem[];
    TotalDcsCount: number;
    Payments: PaymentItem[];
}

export default function LoomWagesTable({
    initialRecords,
    looms
}: {
    initialRecords: WeeklyConsolidatedRecord[];
    looms: any[];
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const [records, setRecords] = useState<WeeklyConsolidatedRecord[]>(initialRecords);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [selectedLoomId, setSelectedLoomId] = useState(searchParams.get('loomId') || '');
    const [startDateFilter, setStartDateFilter] = useState(searchParams.get('startDate') || '2026-09-27');

    // Sync records when server returns updated props
    useEffect(() => {
        setRecords(initialRecords);
    }, [initialRecords]);

    // Keep internal filter state in sync with URL searchParams
    useEffect(() => {
        setSearchQuery(searchParams.get('query') || '');
        setSelectedLoomId(searchParams.get('loomId') || '');
        setStartDateFilter(searchParams.get('startDate') || '2026-09-27');
    }, [searchParams]);

    const handleFilterChange = (newQuery?: string, newLoomId?: string, newStartDate?: string) => {
        const q = newQuery !== undefined ? newQuery : searchQuery;
        const lId = newLoomId !== undefined ? newLoomId : selectedLoomId;
        const sDate = newStartDate !== undefined ? newStartDate : startDateFilter;

        const params = new URLSearchParams(searchParams);

        if (q) params.set('query', q);
        else params.delete('query');

        if (lId) params.set('loomId', lId);
        else params.delete('loomId');

        if (sDate) params.set('startDate', sDate);
        else params.delete('startDate');

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    };

    // Expanded row state
    const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Record<string, 'dcs' | 'payments'>>({});
    const [expandedDcKey, setExpandedDcKey] = useState<string | null>(null);

    // Editing Loom Default Rate state
    const [editingLoomId, setEditingLoomId] = useState<number | null>(null);
    const [tempLoomRate, setTempLoomRate] = useState<string>('');

    // Editing Loom Opening Balance state
    const [editingOpeningBalanceLoomId, setEditingOpeningBalanceLoomId] = useState<number | null>(null);
    const [tempOpeningBalance, setTempOpeningBalance] = useState<string>('');

    // Editing Warp Rate state
    const [editingSizingId, setEditingSizingId] = useState<number | null>(null);
    const [tempWarpRate, setTempWarpRate] = useState<string>('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<WeeklyConsolidatedRecord | null>(null);

    const handleOpenModal = (rec: WeeklyConsolidatedRecord) => {
        setSelectedRecord(rec);
        setModalOpen(true);
    };

    const handleDeletePayment = async (paymentId: number, recordKey: string) => {
        if (!confirm('Are you sure you want to delete this payment record?')) return;

        const res = await removeLoomWagePayment(paymentId);
        if (res.success) {
            handleReload();
        } else {
            alert(res.error || 'Failed to delete payment');
        }
    };

    const handleSaveLoomRate = async (loomId: number) => {
        const rate = parseFloat(tempLoomRate);
        if (isNaN(rate) || rate < 0) {
            alert('Please enter a valid wage rate');
            return;
        }

        const res = await saveLoomDefaultRate(loomId, rate);
        if (res.success) {
            setEditingLoomId(null);
            handleReload();
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
            handleReload();
        } else {
            alert(res.error || 'Failed to save opening balance');
        }
    };

    const handleSaveWarpRate = async (sizingId: number) => {
        const rate = parseFloat(tempWarpRate);
        if (isNaN(rate) || rate < 0) {
            alert('Please enter a valid wage rate');
            return;
        }

        const res = await saveWarpCustomRate(sizingId, rate);
        if (res.success) {
            setEditingSizingId(null);
            handleReload();
        } else {
            alert(res.error || 'Failed to save warp wage rate');
        }
    };

    const handleReload = () => {
        window.location.reload();
    };

    const filteredRecords = records;

    const totalDhotiesCount = filteredRecords.reduce((sum, r) => sum + r.TotalCount, 0);
    const totalCalculatedWagesSum = filteredRecords.reduce((sum, r) => sum + r.TotalCalculatedWages, 0);
    const totalPaymentsSum = filteredRecords.reduce((sum, r) => sum + r.TotalPaidAmount, 0);
    const totalBalanceDue = filteredRecords.reduce((sum, r) => sum + r.BalanceDue, 0);

    const toggleRowExpand = (rowKey: string, defaultTab: 'dcs' | 'payments' = 'dcs') => {
        if (expandedRowKey === rowKey && activeTab[rowKey] === defaultTab) {
            setExpandedRowKey(null);
        } else {
            setExpandedRowKey(rowKey);
            setActiveTab(prev => ({ ...prev, [rowKey]: defaultTab }));
        }
    };

    return (
        <div className="mt-6 space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Dhoties Rec.</p>
                    <p className="text-2xl font-extrabold text-slate-800">{totalDhotiesCount.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Pcs</span></p>
                </div>
                <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-indigo-50/80 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Total Calculated Wages</p>
                    <p className="text-2xl font-extrabold text-blue-800">₹ {totalCalculatedWagesSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-teal-50/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Total Paid Amount</p>
                    <p className="text-2xl font-extrabold text-emerald-800">₹ {totalPaymentsSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className={`rounded-2xl border ${totalBalanceDue > 0 ? 'border-amber-200 bg-amber-50/60' : 'border-emerald-200 bg-emerald-50/60'} p-4 shadow-sm hover:shadow-md transition-shadow`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${totalBalanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'} mb-1`}>Total Balance Due</p>
                    <p className={`text-2xl font-extrabold ${totalBalanceDue > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                        ₹ {totalBalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Filter Toolbar & Loom Default Wage Config */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
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
                                    handleFilterChange(val, undefined, undefined);
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
                                handleFilterChange(undefined, val, undefined);
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
                                    handleFilterChange(undefined, undefined, val);
                                }}
                                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Loom Common Wage Rate & Opening Balance Quick Editor if Loom Selected */}
                {selectedLoomId && (() => {
                    const selectedLoom = looms.find((l: any) => String(l.LoomId) === String(selectedLoomId));
                    if (!selectedLoom) return null;
                    const isEditingRate = editingLoomId === Number(selectedLoomId);
                    const isEditingOpeningBal = editingOpeningBalanceLoomId === Number(selectedLoomId);

                    return (
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
                                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                            title="Save Rate"
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingLoomId(null)}
                                            className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
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
                                            className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-bold text-xs"
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
                                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                            title="Save Opening Balance"
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingOpeningBalanceLoomId(null)}
                                            className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
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
                                            className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-bold text-xs"
                                        >
                                            <PencilSquareIcon className="h-3.5 w-3.5" />
                                            Edit Balance
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Main Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm relative">
                {isPending && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-white px-4 py-2 rounded-xl shadow-md border border-indigo-100">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            Loading records...
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th scope="col" className="py-4 pl-6 pr-3">Loom Name</th>
                                <th scope="col" className="px-3 py-4">Weekly Period</th>
                                <th scope="col" className="px-3 py-4 text-center">DCs</th>
                                <th scope="col" className="px-3 py-4 text-right">Sum Dhoties</th>
                                <th scope="col" className="px-3 py-4 text-right">Calculated Wages</th>
                                <th scope="col" className="px-3 py-4 text-right">Paid Amount</th>
                                <th scope="col" className="px-3 py-4 text-right">Balance Due</th>
                                <th scope="col" className="px-3 py-4 text-center">Details</th>
                                <th scope="col" className="py-4 pl-3 pr-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-10 text-center text-sm font-medium text-slate-400">
                                        No weekly loom records found after {startDateFilter}.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((rec) => {
                                    const rowKey = `${rec.LoomId}_${rec.WeekStartDate}`;
                                    const isExpanded = expandedRowKey === rowKey;
                                    const currentTab = activeTab[rowKey] || 'dcs';

                                    return (
                                        <React.Fragment key={rowKey}>
                                            <tr className="hover:bg-slate-50/80 transition-colors">
                                                {/* Loom Name, Common Rate & Opening Balance */}
                                                <td className="py-4 pl-6 pr-3 font-bold text-slate-800 whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                                            {rec.LoomName}
                                                        </span>
                                                        <div className="text-[11px] text-slate-500 font-medium">
                                                            Rate: <span className="font-bold text-slate-700">₹{rec.DefaultWageRate.toFixed(2)}</span>
                                                            {rec.OpeningBalance !== 0 && (
                                                                <span className="ml-1.5 text-amber-700 font-bold">
                                                                    (Open: ₹{rec.OpeningBalance.toFixed(2)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Weekly Period */}
                                                <td className="px-3 py-4 font-bold text-slate-800 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <CalendarIcon className="h-4 w-4 text-indigo-500" />
                                                        <span>{formatDateNew(rec.WeekStartDate)} – {formatDateNew(rec.WeekEndDate)}</span>
                                                    </div>
                                                </td>

                                                {/* DCs Count */}
                                                <td className="px-3 py-4 text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                                                        <DocumentDuplicateIcon className="h-3.5 w-3.5 text-slate-500" />
                                                        {rec.TotalDcsCount} DCs
                                                    </span>
                                                </td>

                                                {/* Weekly Sum Dhoties */}
                                                <td className="px-3 py-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                                                    {rec.TotalCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
                                                </td>

                                                {/* Calculated Wages */}
                                                <td className="px-3 py-4 text-right font-extrabold text-blue-700 whitespace-nowrap">
                                                    ₹ {rec.TotalCalculatedWages.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>

                                                {/* Total Paid Amount */}
                                                <td className="px-3 py-4 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                                                    ₹ {rec.TotalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>

                                                {/* Balance Due */}
                                                <td className="px-3 py-4 text-right font-extrabold whitespace-nowrap">
                                                    {rec.BalanceDue > 0 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                                                            ₹ {rec.BalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                                            Paid in Full
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Details & History Toggles */}
                                                <td className="px-3 py-4 text-center whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => toggleRowExpand(rowKey, 'dcs')}
                                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${isExpanded && currentTab === 'dcs'
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                                }`}
                                                        >
                                                            <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                                                            DCs ({rec.TotalDcsCount})
                                                        </button>

                                                        <button
                                                            onClick={() => toggleRowExpand(rowKey, 'payments')}
                                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${isExpanded && currentTab === 'payments'
                                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                                }`}
                                                        >
                                                            <CurrencyRupeeIcon className="h-3.5 w-3.5" />
                                                            {rec.Payments.length} Pay
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Action Button */}
                                                <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleOpenModal(rec)}
                                                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 transition-all"
                                                    >
                                                        <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
                                                        Add Payment
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded Sub-row with Details */}
                                            {isExpanded && (
                                                <tr className="bg-slate-50/70 border-b border-slate-200">
                                                    <td colSpan={9} className="p-4 pl-8">
                                                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                                                            {/* Sub-row Header & Tab Switcher */}
                                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => setActiveTab(prev => ({ ...prev, [rowKey]: 'dcs' }))}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'dcs'
                                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                            }`}
                                                                    >
                                                                        <DocumentDuplicateIcon className="h-4 w-4" />
                                                                        DCs & Warp Pieces Breakdown ({rec.TotalDcsCount} DCs)
                                                                    </button>

                                                                    <button
                                                                        onClick={() => setActiveTab(prev => ({ ...prev, [rowKey]: 'payments' }))}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'payments'
                                                                            ? 'bg-emerald-600 text-white shadow-sm'
                                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                            }`}
                                                                    >
                                                                        <CurrencyRupeeIcon className="h-4 w-4" />
                                                                        Weekly Payment History ({rec.Payments.length})
                                                                    </button>
                                                                </div>

                                                                <span className="text-xs font-semibold text-slate-500">
                                                                    {rec.LoomName} ({formatDateNew(rec.WeekStartDate)} – {formatDateNew(rec.WeekEndDate)})
                                                                </span>
                                                            </div>

                                                            {/* TAB 1: DCs & Pieces Breakdown for the Week */}
                                                            {currentTab === 'dcs' && (
                                                                <div className="space-y-3">
                                                                    {rec.Dcs.map((dcItem, dcIdx) => {
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
                                                                                            <Link href={`/admin/sizing/${dcItem.SizingId}/edit`} className="text-blue-600 hover:underline font-semibold">
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
                                                                                            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center gap-1"
                                                                                        >
                                                                                            <CubeIcon className="h-3.5 w-3.5 text-indigo-500" />
                                                                                            {dcItem.Pieces.length} Piece{dcItem.Pieces.length > 1 ? 's' : ''}
                                                                                            {isDcPiecesExpanded ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Pieces Sub-table */}
                                                                                {isDcPiecesExpanded && (
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
                                                                                                {dcItem.Pieces.map((p, pIdx) => {
                                                                                                    const isEditingWarp = editingSizingId === p.SizingId;

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
                                                                                                                            onClick={() => p.SizingId && handleSaveWarpRate(p.SizingId)}
                                                                                                                            className="p-0.5 rounded bg-emerald-600 text-white"
                                                                                                                        >
                                                                                                                            <CheckIcon className="h-3 w-3" />
                                                                                                                        </button>
                                                                                                                        <button
                                                                                                                            onClick={() => setEditingSizingId(null)}
                                                                                                                            className="p-0.5 rounded bg-slate-200 text-slate-600"
                                                                                                                        >
                                                                                                                            <XMarkIcon className="h-3 w-3" />
                                                                                                                        </button>
                                                                                                                    </div>
                                                                                                                ) : (
                                                                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                                                                        <span>₹ {p.WageRate.toFixed(2)}</span>
                                                                                                                        {p.HasCustomWarpRate && (
                                                                                                                            <span className="text-[10px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">Custom</span>
                                                                                                                        )}
                                                                                                                        {p.SizingId && (
                                                                                                                            <button
                                                                                                                                onClick={() => {
                                                                                                                                    setEditingSizingId(p.SizingId!);
                                                                                                                                    setTempWarpRate(String(p.WageRate));
                                                                                                                                }}
                                                                                                                                title="Edit rate for this warp"
                                                                                                                                className="text-slate-400 hover:text-indigo-600"
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
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* TAB 2: Payment History for the Week */}
                                                            {currentTab === 'payments' && (
                                                                <div>
                                                                    {rec.Payments.length === 0 ? (
                                                                        <p className="text-xs text-slate-400 italic py-3 text-center">
                                                                            No payments recorded yet for this week ({formatDateNew(rec.WeekStartDate)} – {formatDateNew(rec.WeekEndDate)}). Click "Add Payment" to record one.
                                                                        </p>
                                                                    ) : (
                                                                        <div className="divide-y divide-slate-100 text-xs">
                                                                            {rec.Payments.map((p) => (
                                                                                <div key={p.PaymentId} className="py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <span className="font-semibold text-slate-800">{formatDateNew(p.PaymentDate)}</span>
                                                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                                                                            {p.PaymentType}
                                                                                        </span>
                                                                                        {p.Note && (
                                                                                            <span className="text-slate-500 italic max-w-xs truncate">
                                                                                                "{p.Note}"
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3">
                                                                                        <span className="font-bold text-emerald-700 text-sm">
                                                                                            ₹ {p.Amount.toFixed(2)}
                                                                                        </span>
                                                                                        <button
                                                                                            onClick={() => handleDeletePayment(p.PaymentId, rowKey)}
                                                                                            title="Delete payment entry"
                                                                                            className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                                        >
                                                                                            <TrashIcon className="h-4 w-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                record={selectedRecord}
                onSuccess={handleReload}
            />
        </div>
    );
}
