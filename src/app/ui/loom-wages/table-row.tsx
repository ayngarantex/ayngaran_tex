'use client';

import React from 'react';
import {
    CalendarIcon,
    DocumentDuplicateIcon,
    CurrencyRupeeIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { formatDateNew } from '@/app/lib/utils';
import { WeeklyConsolidatedRecord } from './types';
import ExpandedRowDetails from './expanded-row-details';

interface TableRowProps {
    record: WeeklyConsolidatedRecord;
    rowKey: string;
    isExpanded: boolean;
    currentTab: 'dcs' | 'payments';
    onToggleExpand: (defaultTab?: 'dcs' | 'payments') => void;
    onTabChange: (tab: 'dcs' | 'payments') => void;
    onOpenModal: (record: WeeklyConsolidatedRecord) => void;
    onReload: () => void;
}

export default function TableRow({
    record,
    rowKey,
    isExpanded,
    currentTab,
    onToggleExpand,
    onTabChange,
    onOpenModal,
    onReload
}: TableRowProps) {
    return (
        <React.Fragment>
            <tr className="hover:bg-slate-50/80 transition-colors">
                {/* Loom Name, Common Rate & Opening Balance */}
                <td className="py-4 pl-6 pr-3 font-bold text-slate-800 whitespace-nowrap">
                    <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                            {record.LoomName}
                        </span>
                        <div className="text-[11px] text-slate-500 font-medium">
                            Rate: <span className="font-bold text-slate-700">₹{record.DefaultWageRate.toFixed(2)}</span>
                            {record.OpeningBalance !== 0 && (
                                <span className="ml-1.5 text-amber-700 font-bold">
                                    (Open: ₹{record.OpeningBalance.toFixed(2)})
                                </span>
                            )}
                        </div>
                    </div>
                </td>

                {/* Weekly Period */}
                <td className="px-3 py-4 font-bold text-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-xs">
                        <CalendarIcon className="h-4 w-4 text-indigo-500" />
                        <span>{formatDateNew(record.WeekStartDate)} – {formatDateNew(record.WeekEndDate)}</span>
                    </div>
                </td>

                {/* DCs Count */}
                <td className="px-3 py-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        <DocumentDuplicateIcon className="h-3.5 w-3.5 text-slate-500" />
                        {record.TotalDcsCount} DCs
                    </span>
                </td>

                {/* Weekly Sum Dhoties */}
                <td className="px-3 py-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                    {record.TotalCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
                </td>

                {/* Calculated Wages */}
                <td className="px-3 py-4 text-right font-extrabold text-blue-700 whitespace-nowrap">
                    ₹ {record.TotalCalculatedWages.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>

                {/* Total Paid Amount */}
                <td className="px-3 py-4 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                    ₹ {record.TotalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>

                {/* Balance Due */}
                <td className="px-3 py-4 text-right font-extrabold whitespace-nowrap">
                    {record.BalanceDue > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                            ₹ {record.BalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                            onClick={() => onToggleExpand('dcs')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                                isExpanded && currentTab === 'dcs'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            }`}
                        >
                            <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                            DCs ({record.TotalDcsCount})
                        </button>

                        <button
                            onClick={() => onToggleExpand('payments')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                                isExpanded && currentTab === 'payments'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                        >
                            <CurrencyRupeeIcon className="h-3.5 w-3.5" />
                            {record.Payments.length} Pay
                        </button>
                    </div>
                </td>

                {/* Action Button */}
                <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                    <button
                        onClick={() => onOpenModal(record)}
                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
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
                        <ExpandedRowDetails
                            record={record}
                            rowKey={rowKey}
                            currentTab={currentTab}
                            onTabChange={onTabChange}
                            onReload={onReload}
                        />
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
}

