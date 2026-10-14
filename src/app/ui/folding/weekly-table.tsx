'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    CurrencyRupeeIcon,
    PlusIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    TagIcon,
    DocumentTextIcon,
    DocumentDuplicateIcon,
    CubeIcon,
    ArrowDownLeftIcon,
    ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import PaymentModal, { WeeklyFoldingRecordDetails } from './payment-modal';
import {
    removeFoldingPayment,
    saveFoldingWageRate,
    saveFoldingOpeningBalance
} from '@/app/api/node/folding';
import { formatDateNew, FoldingItems } from '@/app/lib/utils';
import { UpdateFolding, DeleteFolding } from './buttons';

interface FoldingPaymentItem {
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
    NetPieces: number;
    TotalCalculatedWages: number;
    TotalPaidAmount: number;
    BalanceDue: number;
    ItemsSummary: Record<string, { given: number; return: number; net: number }>;
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
    const [isPending, startTransition] = useTransition();

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
    const [expandedDcId, setExpandedDcId] = useState<number | null>(null);

    // Top-level summary view mode state
    const [topViewMode, setTopViewMode] = useState<'both' | 'metrics' | 'products'>('both');
    const [productViewMode, setProductViewMode] = useState<'table' | 'cards'>('table');
    const [onlyActiveProducts, setOnlyActiveProducts] = useState(true);

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
    const overallProductSummary = React.useMemo(() => {
        const summary: Record<string, { given: number; return: number; net: number }> = {};
        foldingItemList.forEach(item => {
            summary[item] = { given: 0, return: 0, net: 0 };
        });

        records.forEach(rec => {
            for (const [item, stats] of Object.entries(rec.ItemsSummary || {})) {
                if (!summary[item]) {
                    summary[item] = { given: 0, return: 0, net: 0 };
                }
                summary[item].given += stats.given;
                summary[item].return += stats.return;
                summary[item].net += stats.net;
            }
        });

        return summary;
    }, [records, foldingItemList]);

    const activeOverallProducts = Object.entries(overallProductSummary).filter(
        ([_, stats]) => stats.given > 0 || stats.return > 0 || stats.net !== 0
    );
    const displayedOverallProducts = onlyActiveProducts
        ? activeOverallProducts
        : Object.entries(overallProductSummary);

    // Calculate Summary Metrics
    const totalGivenCount = records.reduce((sum, r) => sum + r.TotalGivenCount, 0);
    const totalReturnCount = records.reduce((sum, r) => sum + r.TotalReturnCount, 0);
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
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                topViewMode === 'both'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Combined View
                        </button>
                        <button
                            type="button"
                            onClick={() => setTopViewMode('metrics')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                topViewMode === 'metrics'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Overview Metrics
                        </button>
                        <button
                            type="button"
                            onClick={() => setTopViewMode('products')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                topViewMode === 'products'
                                    ? 'bg-white text-purple-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <CubeIcon className="h-4 w-4 text-purple-600" />
                            <span>Product-wise Totals ({activeOverallProducts.length})</span>
                        </button>
                    </div>
                </div>

                {/* 1. Overview Metric Cards */}
                {(topViewMode === 'both' || topViewMode === 'metrics') && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-4 shadow-sm">
                            <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
                                <ArrowUpRightIcon className="h-4 w-4" />
                                Total Given
                            </div>
                            <p className="text-xl font-extrabold text-blue-900">
                                {totalGivenCount.toLocaleString()} <span className="text-[11px] font-semibold text-blue-600">Pcs</span>
                            </p>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-orange-50/50 p-4 shadow-sm">
                            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                                <ArrowDownLeftIcon className="h-4 w-4" />
                                Total Return
                            </div>
                            <p className="text-xl font-extrabold text-amber-900">
                                {totalReturnCount.toLocaleString()} <span className="text-[11px] font-semibold text-amber-600">Pcs</span>
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-4 shadow-sm">
                            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
                                <TagIcon className="h-4 w-4" />
                                Net with Folder
                            </div>
                            <p className="text-xl font-extrabold text-emerald-900">
                                {netPiecesRemaining.toLocaleString()} <span className="text-[11px] font-semibold text-emerald-600">Pcs</span>
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-violet-50/50 p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Total Wages</p>
                            <p className="text-xl font-extrabold text-purple-900">
                                ₹ {totalCalculatedWagesSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50/70 to-sky-50/50 p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">Total Paid</p>
                            <p className="text-xl font-extrabold text-cyan-900">
                                ₹ {totalPaymentsSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/70 to-red-50/50 p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">Balance Due</p>
                            <p className="text-xl font-extrabold text-rose-900">
                                ₹ {totalBalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                )}

                {/* 2. Top-Level Product-wise Totals Panel */}
                {(topViewMode === 'both' || topViewMode === 'products') && (
                    <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <CubeIcon className="h-5 w-5 text-purple-600" />
                                    Product-wise Aggregate Reconciliation
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Consolidated piece counts (Given vs Return &amp; Net with Folder) for each product across all {records.length} periods
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
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            productViewMode === 'table' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Table
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProductViewMode('cards')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            productViewMode === 'cards' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
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
                                            <th className="px-3 py-2.5 text-right text-amber-700">Total Return</th>
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
                                                                    className={`h-full rounded-full ${
                                                                        returnRate >= 100
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
                                            <td className="px-3 py-2.5 text-right font-black text-amber-700">-{totalReturnCount.toLocaleString()} Pcs</td>
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
                                                        className={`h-full rounded-full ${
                                                            returnRate >= 100
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
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3.5 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative min-w-[220px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search DC #, folder, notes..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleFilterChange(e.target.value, undefined, undefined);
                            }}
                            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                    </div>

                    {/* Folder / Loom Selector */}
                    <select
                        value={selectedLoomId}
                        onChange={(e) => {
                            setSelectedLoomId(e.target.value);
                            handleFilterChange(undefined, e.target.value, undefined);
                        }}
                        className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all"
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
                            onChange={(e) => {
                                setStartDateFilter(e.target.value);
                                handleFilterChange(undefined, undefined, e.target.value);
                            }}
                            className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs font-semibold text-slate-400">
                        {records.length} Weekly Period{records.length === 1 ? '' : 's'}
                    </div>
                </div>
            </div>

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
                                                            className="text-emerald-600 hover:text-emerald-800 p-0.5"
                                                            title="Save rate"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingLoomId(null)}
                                                            className="text-slate-400 hover:text-slate-600 p-0.5"
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
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition-opacity p-0.5"
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
                                                            className="text-emerald-600 hover:text-emerald-800 p-0.5"
                                                            title="Save balance"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingBalanceLoomId(null)}
                                                            className="text-slate-400 hover:text-slate-600 p-0.5"
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
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition-opacity p-0.5"
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
                                                    <span className="px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800">
                                                        +{rec.TotalGivenCount.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>

                                            {/* Return Count */}
                                            <td className="px-3 py-3 text-right whitespace-nowrap font-bold text-amber-700 bg-amber-50/20">
                                                {rec.TotalReturnCount > 0 ? (
                                                    <span className="px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-900">
                                                        -{rec.TotalReturnCount.toLocaleString()}
                                                    </span>
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
                                            </td>

                                            {/* Details & History Toggles (Same as loom-wages) */}
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
                                                        <div className="space-y-4">
                                                            {/* Summary Pills for this Week */}
                                                            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                                                <span className="font-bold text-slate-700">Week Summary:</span>
                                                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                                                                    Total Given: +{rec.TotalGivenCount.toLocaleString()} Pcs
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                                                                    Total Return: -{rec.TotalReturnCount.toLocaleString()} Pcs
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-black">
                                                                    Net Pieces: {rec.NetPieces.toLocaleString()} Pcs
                                                                </span>
                                                                <span className="ml-auto font-extrabold text-slate-800">
                                                                    Calculated Wages: ₹ {rec.TotalCalculatedWages.toFixed(2)}
                                                                </span>
                                                            </div>

                                                            {/* Individual DC Cards (Same as loom-wages) */}
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
                                                                                    ? 'border-amber-200 bg-amber-50/30'
                                                                                    : 'border-slate-200/80 bg-white'
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
                                                                                        className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-md ${isReturn
                                                                                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                                                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                                                                                            }`}
                                                                                    >
                                                                                        {entry.Type}
                                                                                    </span>
                                                                                    {entry.Notes && (
                                                                                        <span className="text-slate-500 italic max-w-xs truncate">
                                                                                            Note: {entry.Notes}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="font-bold text-slate-800">
                                                                                        Total:{' '}
                                                                                        <span
                                                                                            className={`font-black text-sm ${isReturn ? 'text-amber-800' : 'text-blue-800'
                                                                                                }`}
                                                                                        >
                                                                                            {isReturn ? '-' : '+'}{Number(entry.TotalCount || 0).toLocaleString()} Pcs
                                                                                        </span>
                                                                                    </span>

                                                                                    {isReturn && (
                                                                                        <span className="font-extrabold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                                                                            Wages: ₹ {(Number(entry.TotalCount || 0) * rec.WageRate).toFixed(2)}
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
                                                                                <th className="px-2 py-2.5">Type</th>
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
                                                                                        className={`hover:bg-slate-50/90 transition-colors ${isReturn ? 'bg-amber-50/30' : ''
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
                                                                                                className={`inline-flex items-center text-[10px] font-extrabold px-1.5 py-0.5 rounded ${isReturn
                                                                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                                                                        : 'bg-blue-100 text-blue-900 border border-blue-200'
                                                                                                    }`}
                                                                                            >
                                                                                                {entry.Type}
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
                                                                                            <span
                                                                                                className={`px-1.5 py-0.5 rounded font-bold ${isReturn
                                                                                                        ? 'bg-amber-100 text-amber-900'
                                                                                                        : 'bg-blue-100 text-blue-900'
                                                                                                    }`}
                                                                                            >
                                                                                                {isReturn ? '-' : '+'}{Number(entry.TotalCount || 0).toLocaleString()}
                                                                                            </span>
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
                                                    )}


                                                    {/* TAB 3: Weekly Payments History */}
                                                    {currentTab === 'payments' && (
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                                    Weekly Payment History ({rec.Payments.length})
                                                                </h5>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenModal(rec)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs"
                                                                >
                                                                    <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
                                                                    Add Payment
                                                                </button>
                                                            </div>

                                                            {rec.Payments.length === 0 ? (
                                                                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
                                                                    No payments recorded for this week yet. Click "+ Add Payment" above to record one.
                                                                </div>
                                                            ) : (
                                                                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                                                    <table className="min-w-full text-left text-xs text-slate-600">
                                                                        <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                                                            <tr>
                                                                                <th className="py-2.5 pl-4 pr-3">Payment Date</th>
                                                                                <th className="px-3 py-2.5">Payment Type</th>
                                                                                <th className="px-3 py-2.5 text-right font-black text-emerald-800">Amount (₹)</th>
                                                                                <th className="px-3 py-2.5">Notes</th>
                                                                                <th className="py-2.5 pl-3 pr-4 text-center">Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-100">
                                                                            {rec.Payments.map((p) => (
                                                                                <tr key={p.PaymentId} className="hover:bg-slate-50 transition-colors">
                                                                                    <td className="py-2.5 pl-4 pr-3 font-semibold text-slate-800 whitespace-nowrap">
                                                                                        {formatDateNew(p.PaymentDate)}
                                                                                    </td>
                                                                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10px]">
                                                                                            {p.PaymentType}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-3 py-2.5 text-right font-black text-emerald-700 whitespace-nowrap">
                                                                                        ₹ {p.Amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                                    </td>
                                                                                    <td className="px-3 py-2.5 text-slate-500 text-xs">
                                                                                        {p.Note || '-'}
                                                                                    </td>
                                                                                    <td className="py-2.5 pl-3 pr-4 text-center whitespace-nowrap">
                                                                                        <button
                                                                                            onClick={() => handleDeletePayment(p.PaymentId)}
                                                                                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                                            title="Delete Payment"
                                                                                        >
                                                                                            <TrashIcon className="h-4 w-4" />
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
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
