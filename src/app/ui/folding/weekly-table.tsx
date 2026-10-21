'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    CurrencyRupeeIcon,
    PlusIcon,
    CalendarIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    DocumentDuplicateIcon,
    CubeIcon
} from '@heroicons/react/24/outline';
import PaymentModal, { WeeklyFoldingRecordDetails } from './payment-modal';
import {
    removeFoldingPayment,
    saveFoldingWageRate,
    saveFoldingOpeningBalance
} from '@/app/api/node/folding';
import { formatDateNew, FoldingItems } from '@/app/lib/utils';
import WeeklyMetrics from './weekly-metrics';
import WeeklyProductSummary, { ProductSummaryStat } from './weekly-product-summary';
import WeeklyFilters from './weekly-filters';
import WeeklyDcDetails from './weekly-dc-details';
import WeeklyPaymentsTable from './weekly-payments-table';

export interface FoldingPaymentItem {
    PaymentId: number;
    PaymentDate: string;
    Amount: number;
    PaymentType: string;
    Note: string | null;
}

export interface WeeklyFoldingRecord {
    LoomId: number;
    LoomName: string;
    WageRate: number;
    OpeningBalance: number;
    WeekStartDate: string;
    WeekEndDate: string;
    TotalGivenCount: number;
    TotalReturnCount: number;
    TotalPayableReturnCount?: number;
    TotalFoldedReturnCount?: number;
    TotalFoldedGivenCount?: number;
    TotalFoldedCount?: number;
    NetPieces: number;
    TotalCalculatedWages: number;
    TotalPaidAmount: number;
    BalanceDue: number;
    ItemsSummary: Record<string, { given: number; return: number; net: number; folded?: number; foldedGiven?: number; foldedReturn?: number }>;
    Entries: any[];
    TotalDcsCount: number;
    Payments: FoldingPaymentItem[];
}

export default function WeeklyFoldingTable({
    initialRecords,
    looms
}: {
    initialRecords: WeeklyFoldingRecord[];
    looms: any[];
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [, startTransition] = useTransition();

    const foldingItemList = FoldingItems();

    const [records, setRecords] = useState<WeeklyFoldingRecord[]>(initialRecords);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [selectedLoomId, setSelectedLoomId] = useState(searchParams.get('loomId') || '');
    const [startDateFilter, setStartDateFilter] = useState(searchParams.get('startDate') || '2026-09-27');

    useEffect(() => {
        setRecords(initialRecords);
    }, [initialRecords]);

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

    // Expanded row & tab state
    const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Record<string, 'dcs' | 'payments'>>({});

    // Top-level summary view mode state
    const [topViewMode, setTopViewMode] = useState<'both' | 'metrics' | 'products'>('metrics');

    // Editing Rate state
    const [editingLoomId, setEditingLoomId] = useState<number | null>(null);
    const [tempRate, setTempRate] = useState<string>('');

    // Editing Opening Balance state
    const [editingBalanceLoomId, setEditingBalanceLoomId] = useState<number | null>(null);
    const [tempBalance, setTempBalance] = useState<string>('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<WeeklyFoldingRecordDetails | null>(null);

    const handleOpenModal = (rec: WeeklyFoldingRecord) => {
        setSelectedRecord(rec);
        setModalOpen(true);
    };

    const handleDeletePayment = async (paymentId: number) => {
        if (!confirm('Are you sure you want to delete this payment record?')) return;

        const res = await removeFoldingPayment(paymentId);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error || 'Failed to delete payment');
        }
    };

    const handleSaveRate = async (loomId: number) => {
        const rate = parseFloat(tempRate);
        if (isNaN(rate) || rate < 0) {
            alert('Please enter a valid wage rate');
            return;
        }

        const res = await saveFoldingWageRate(loomId, rate);
        if (res.success) {
            setEditingLoomId(null);
            window.location.reload();
        } else {
            alert(res.error || 'Failed to save wage rate');
        }
    };

    const handleSaveBalance = async (loomId: number) => {
        const balance = parseFloat(tempBalance);
        if (isNaN(balance)) {
            alert('Please enter a valid opening balance');
            return;
        }

        const res = await saveFoldingOpeningBalance(loomId, balance);
        if (res.success) {
            setEditingBalanceLoomId(null);
            window.location.reload();
        } else {
            alert(res.error || 'Failed to save opening balance');
        }
    };

    const toggleRowExpand = (rowKey: string, defaultTab: 'dcs' | 'payments') => {
        if (expandedRowKey === rowKey && activeTab[rowKey] === defaultTab) {
            setExpandedRowKey(null);
        } else {
            setExpandedRowKey(rowKey);
            setActiveTab(prev => ({ ...prev, [rowKey]: defaultTab }));
        }
    };

    // Calculate Overall Product-wise Summary
    const overallProductSummary = useMemo(() => {
        const summary: Record<string, ProductSummaryStat> = {};
        foldingItemList.forEach(item => {
            summary[item] = { given: 0, return: 0, net: 0, folded: 0, foldedGiven: 0, foldedReturn: 0 };
        });

        records.forEach(rec => {
            for (const [item, stats] of Object.entries(rec.ItemsSummary || {})) {
                if (!summary[item]) {
                    summary[item] = { given: 0, return: 0, net: 0, folded: 0, foldedGiven: 0, foldedReturn: 0 };
                }
                summary[item].given += stats.given;
                summary[item].return += stats.return;
                summary[item].net += stats.net;
                summary[item].folded += stats.folded || 0;
                summary[item].foldedGiven += stats.foldedGiven || 0;
                summary[item].foldedReturn += stats.foldedReturn || 0;
            }
        });

        return summary;
    }, [records, foldingItemList]);

    const activeOverallProductsCount = useMemo(() => {
        return Object.values(overallProductSummary).filter(
            stats => stats.given > 0 || stats.return > 0 || stats.net !== 0 || stats.folded > 0
        ).length;
    }, [overallProductSummary]);

    // Calculate Summary Metrics
    const totalGivenCount = records.reduce((sum, r) => sum + r.TotalGivenCount, 0);
    const totalReturnCount = records.reduce((sum, r) => sum + r.TotalReturnCount, 0);
    const totalFoldedGivenCount = records.reduce((sum, r) => sum + (r.TotalFoldedGivenCount || 0), 0);
    const netPiecesRemaining = totalGivenCount - totalReturnCount;
    const totalCalculatedWagesSum = records.reduce((sum, r) => sum + r.TotalCalculatedWages, 0);
    const totalPaymentsSum = records.reduce((sum, r) => sum + r.TotalPaidAmount, 0);
    const totalBalanceDue = records.reduce((sum, r) => sum + r.BalanceDue, 0);

    return (
        <div className="mt-4 space-y-6">
            {/* Top-Level Summary & Reconciliation Section */}
            <div className="space-y-4">
                {/* Top-Level Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span>Top-Level Summary &amp; Totals</span>
                            {selectedLoomId ? (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                    {looms.find((l: any) => String(l.LoomId) === String(selectedLoomId))?.LoomName || 'Selected Folder'}
                                </span>
                            ) : (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                    All Folders
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            High-level financial metrics and product-wise piece consolidation
                        </p>
                    </div>

                    {/* View Switcher: Combined | Metrics | Products */}
                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/90 p-1 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setTopViewMode('both')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${topViewMode === 'both'
                                ? 'bg-white text-emerald-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Combined View
                        </button>
                        <button
                            type="button"
                            onClick={() => setTopViewMode('metrics')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${topViewMode === 'metrics'
                                ? 'bg-white text-emerald-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Overview Metrics
                        </button>
                        <button
                            type="button"
                            onClick={() => setTopViewMode('products')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${topViewMode === 'products'
                                ? 'bg-white text-purple-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <CubeIcon className="h-4 w-4 text-purple-600" />
                            <span>Product-wise Totals ({activeOverallProductsCount})</span>
                        </button>
                    </div>
                </div>

                {/* 1. Overview Metric Cards */}
                {(topViewMode === 'both' || topViewMode === 'metrics') && (
                    <WeeklyMetrics
                        totalGivenCount={totalGivenCount}
                        totalReturnCount={totalReturnCount}
                        totalFoldedGivenCount={totalFoldedGivenCount}
                        netPiecesRemaining={netPiecesRemaining}
                        totalCalculatedWagesSum={totalCalculatedWagesSum}
                        totalPaymentsSum={totalPaymentsSum}
                        totalBalanceDue={totalBalanceDue}
                    />
                )}

                {/* 2. Top-Level Product-wise Totals Panel */}
                {(topViewMode === 'both' || topViewMode === 'products') && (
                    <WeeklyProductSummary
                        overallProductSummary={overallProductSummary}
                        recordsCount={records.length}
                        totalGivenCount={totalGivenCount}
                        totalReturnCount={totalReturnCount}
                        totalFoldedGivenCount={totalFoldedGivenCount}
                        netPiecesRemaining={netPiecesRemaining}
                    />
                )}
            </div>

            {/* Filter Bar */}
            <WeeklyFilters
                searchQuery={searchQuery}
                onSearchChange={(val) => {
                    setSearchQuery(val);
                    handleFilterChange(val, undefined, undefined);
                }}
                selectedLoomId={selectedLoomId}
                onLoomChange={(val) => {
                    setSelectedLoomId(val);
                    handleFilterChange(undefined, val, undefined);
                }}
                startDateFilter={startDateFilter}
                onStartDateChange={(val) => {
                    setStartDateFilter(val);
                    handleFilterChange(undefined, undefined, val);
                }}
                looms={looms}
                recordsCount={records.length}
            />

            {/* Main Weekly Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="py-3.5 pl-6 pr-3 whitespace-nowrap">Folder (Loom)</th>
                            <th className="px-3 py-3.5 whitespace-nowrap">Week Range</th>
                            <th className="px-3 py-3.5 text-right whitespace-nowrap">Rate (₹/pc)</th>
                            <th className="px-3 py-3.5 text-right whitespace-nowrap">Op. Balance</th>
                            <th className="px-3 py-3.5 text-right whitespace-nowrap text-blue-700 bg-blue-50/40">Given</th>
                            <th className="px-3 py-3.5 text-right whitespace-nowrap text-amber-700 bg-amber-50/40">Return</th>
                            <th className="px-3 py-3.5 text-right whitespace-nowrap text-emerald-700 bg-emerald-50/40 font-extrabold">Net Pcs</th>
                            <th className="px-3 py-3.5 text-right whitespace-nowrap font-extrabold text-slate-800">Total Wages</th>
                            <th className="px-3 py-3.5 text-right whitespace-nowrap text-cyan-800 font-bold">Paid (₹)</th>
                            <th className="px-3 py-3.5 text-right whitespace-nowrap font-black text-rose-700 bg-rose-50/30">Balance Due</th>
                            <th className="px-3 py-3.5 text-center whitespace-nowrap">Details</th>
                            <th className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="py-12 text-center text-sm font-medium text-slate-400">
                                    No folding weekly records found for the selected filters.
                                </td>
                            </tr>
                        ) : (
                            records.map((rec) => {
                                const rowKey = `${rec.LoomId}_${rec.WeekStartDate}`;
                                const isExpanded = expandedRowKey === rowKey;
                                const currentTab = activeTab[rowKey] || 'dcs';

                                return (
                                    <React.Fragment key={rowKey}>
                                        <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}>
                                            {/* Folder */}
                                            <td className="py-3 pl-6 pr-3 whitespace-nowrap font-bold text-slate-900">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    <span>{rec.LoomName}</span>
                                                </div>
                                            </td>

                                            {/* Week Range */}
                                            <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>{formatDateNew(rec.WeekStartDate)} – {formatDateNew(rec.WeekEndDate)}</span>
                                                </div>
                                            </td>

                                            {/* Folding Wage Rate (Editable) */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap">
                                                {editingLoomId === rec.LoomId ? (
                                                    <div className="inline-flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            step="0.05"
                                                            className="w-16 px-1 py-0.5 text-right text-xs rounded border border-emerald-500 focus:outline-none"
                                                            value={tempRate}
                                                            onChange={(e) => setTempRate(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSaveRate(rec.LoomId)}
                                                            className="text-emerald-600 hover:text-emerald-800 p-0.5 cursor-pointer"
                                                            title="Save rate"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingLoomId(null)}
                                                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                                            title="Cancel"
                                                        >
                                                            <XMarkIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1 group font-bold text-slate-800">
                                                        <span>₹ {rec.WageRate.toFixed(2)}</span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingLoomId(rec.LoomId);
                                                                setTempRate(String(rec.WageRate));
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition-opacity p-0.5 cursor-pointer"
                                                            title="Edit folding wage rate"
                                                        >
                                                            <PencilSquareIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Opening Balance (Editable) */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap font-medium text-slate-600">
                                                {editingBalanceLoomId === rec.LoomId ? (
                                                    <div className="inline-flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            className="w-18 px-1 py-0.5 text-right text-xs rounded border border-emerald-500 focus:outline-none"
                                                            value={tempBalance}
                                                            onChange={(e) => setTempBalance(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSaveBalance(rec.LoomId)}
                                                            className="text-emerald-600 hover:text-emerald-800 p-0.5 cursor-pointer"
                                                            title="Save balance"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingBalanceLoomId(null)}
                                                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                                            title="Cancel"
                                                        >
                                                            <XMarkIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1 group">
                                                        <span>{rec.OpeningBalance > 0 ? `₹ ${rec.OpeningBalance.toFixed(2)}` : '-'}</span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingBalanceLoomId(rec.LoomId);
                                                                setTempBalance(String(rec.OpeningBalance));
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition-opacity p-0.5 cursor-pointer"
                                                            title="Edit opening balance"
                                                        >
                                                            <PencilSquareIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Given Count */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap font-bold text-blue-700 bg-blue-50/20">
                                                {rec.TotalGivenCount > 0 ? (
                                                    <div className="inline-flex flex-col items-end">
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800">
                                                            +{rec.TotalGivenCount.toLocaleString()}
                                                        </span>
                                                        {rec.TotalFoldedGivenCount && rec.TotalFoldedGivenCount > 0 ? (
                                                            <span className="text-[9px] text-purple-700 font-bold mt-0.5">
                                                                ({rec.TotalFoldedGivenCount.toLocaleString()} Folded)
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>

                                            {/* Return Count */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap font-bold text-amber-700 bg-amber-50/20">
                                                {rec.TotalReturnCount > 0 ? (
                                                    <div className="inline-flex flex-col items-end">
                                                        <span className="px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-900">
                                                            -{rec.TotalReturnCount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>

                                            {/* Net Pieces */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap font-black text-emerald-800 bg-emerald-50/20">
                                                {rec.NetPieces.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Pcs</span>
                                            </td>

                                            {/* Total Wages */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap font-extrabold text-slate-900">
                                                ₹ {rec.TotalCalculatedWages.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Total Paid */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap font-bold text-cyan-800">
                                                {rec.TotalPaidAmount > 0 ? (
                                                    <span>₹ {rec.TotalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>

                                            {/* Balance Due */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap font-black text-rose-700 bg-rose-50/30">
                                                ₹ {rec.BalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                {rec.TotalFoldedGivenCount && rec.TotalFoldedGivenCount > 0 ? (
                                                    <span className="flex text-[9px] text-purple-700 font-bold mt-0.5 justify-end">
                                                        ({rec.TotalFoldedGivenCount.toLocaleString()} Folded)
                                                    </span>
                                                ) : null}
                                            </td>

                                            {/* Details & History Toggles */}
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRowExpand(rowKey, 'dcs')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${isExpanded && currentTab === 'dcs'
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                            }`}
                                                        title="View all DCs in this week"
                                                    >
                                                        <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                                                        DCs ({rec.TotalDcsCount})
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRowExpand(rowKey, 'payments')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${isExpanded && currentTab === 'payments'
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                            }`}
                                                        title="View all Payments in this week"
                                                    >
                                                        <CurrencyRupeeIcon className="h-3.5 w-3.5" />
                                                        {rec.Payments.length} Pay
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Action Button (Add Payment) */}
                                            <td className="py-3 pl-3 pr-6 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(rec)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
                                                >
                                                    <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
                                                    Add Payment
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Row Content with Details */}
                                        {isExpanded && (
                                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                                <td colSpan={12} className="py-4 px-6">
                                                    {/* Tabs Header inside expanded row */}
                                                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 flex-wrap gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setActiveTab(prev => ({ ...prev, [rowKey]: 'dcs' }))}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentTab === 'dcs'
                                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                    }`}
                                                            >
                                                                <DocumentDuplicateIcon className="h-4 w-4" />
                                                                All DCs Included in Week ({rec.TotalDcsCount} DCs)
                                                            </button>

                                                            <button
                                                                onClick={() => setActiveTab(prev => ({ ...prev, [rowKey]: 'payments' }))}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentTab === 'payments'
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

                                                    {/* TAB 1: All DCs Included in Week */}
                                                    {currentTab === 'dcs' && (
                                                        <WeeklyDcDetails
                                                            rec={rec}
                                                            looms={looms}
                                                            foldingItemList={foldingItemList}
                                                        />
                                                    )}

                                                    {/* TAB 2: Weekly Payments History */}
                                                    {currentTab === 'payments' && (
                                                        <WeeklyPaymentsTable
                                                            payments={rec.Payments}
                                                            onAddPayment={() => handleOpenModal(rec)}
                                                            onDeletePayment={handleDeletePayment}
                                                        />
                                                    )}
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

            {/* Payment Modal */}
            <PaymentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                record={selectedRecord}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
}
