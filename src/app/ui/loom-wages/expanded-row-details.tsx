'use client';

import React from 'react';
import {
    DocumentDuplicateIcon,
    CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { formatDateNew } from '@/app/lib/utils';
import { WeeklyConsolidatedRecord } from './types';
import DcsTab from './dcs-tab';
import PaymentsTab from './payments-tab';

interface ExpandedRowDetailsProps {
    record: WeeklyConsolidatedRecord;
    rowKey: string;
    currentTab: 'dcs' | 'payments';
    onTabChange: (tab: 'dcs' | 'payments') => void;
    onReload: () => void;
}

export default function ExpandedRowDetails({
    record,
    rowKey,
    currentTab,
    onTabChange,
    onReload
}: ExpandedRowDetailsProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            {/* Sub-row Header & Tab Switcher */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onTabChange('dcs')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            currentTab === 'dcs'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        DCs &amp; Warp Pieces Breakdown ({record.TotalDcsCount} DCs)
                    </button>

                    <button
                        onClick={() => onTabChange('payments')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            currentTab === 'payments'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <CurrencyRupeeIcon className="h-4 w-4" />
                        Weekly Payment History ({record.Payments.length})
                    </button>
                </div>

                <span className="text-xs font-semibold text-slate-500">
                    {record.LoomName} ({formatDateNew(record.WeekStartDate)} – {formatDateNew(record.WeekEndDate)})
                </span>
            </div>

            {/* TAB 1: DCs & Pieces Breakdown for the Week */}
            {currentTab === 'dcs' && (
                <DcsTab record={record} rowKey={rowKey} onReload={onReload} />
            )}

            {/* TAB 2: Payment History for the Week */}
            {currentTab === 'payments' && (
                <PaymentsTab record={record} rowKey={rowKey} onReload={onReload} />
            )}
        </div>
    );
}

