'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PaymentModal from './payment-modal';
import MetricsCards from './metrics-cards';
import FilterToolbar from './filter-toolbar';
import TableRow from './table-row';
import { WeeklyConsolidatedRecord, DcSummaryItem, WarpPieceEntry, PaymentItem } from './types';

// Re-export types for backward compatibility
export type { WeeklyConsolidatedRecord, DcSummaryItem, WarpPieceEntry, PaymentItem };

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

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<WeeklyConsolidatedRecord | null>(null);

    const handleOpenModal = (rec: WeeklyConsolidatedRecord) => {
        setSelectedRecord(rec);
        setModalOpen(true);
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
            <MetricsCards
                totalDhotiesCount={totalDhotiesCount}
                totalCalculatedWagesSum={totalCalculatedWagesSum}
                totalPaymentsSum={totalPaymentsSum}
                totalBalanceDue={totalBalanceDue}
            />

            {/* Filter Toolbar & Loom Default Wage Config */}
            <FilterToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedLoomId={selectedLoomId}
                setSelectedLoomId={setSelectedLoomId}
                startDateFilter={startDateFilter}
                setStartDateFilter={setStartDateFilter}
                looms={looms}
                onFilterChange={handleFilterChange}
                onReload={handleReload}
            />

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
                                        <TableRow
                                            key={rowKey}
                                            record={rec}
                                            rowKey={rowKey}
                                            isExpanded={isExpanded}
                                            currentTab={currentTab}
                                            onToggleExpand={(defaultTab) => toggleRowExpand(rowKey, defaultTab)}
                                            onTabChange={(tab) => setActiveTab(prev => ({ ...prev, [rowKey]: tab }))}
                                            onOpenModal={handleOpenModal}
                                            onReload={handleReload}
                                        />
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
