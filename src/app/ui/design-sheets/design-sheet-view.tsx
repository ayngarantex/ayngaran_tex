"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { PrintButton, WhatsAppShareButton, CopyDesignSheetTopButton } from './buttons';
import type { DesignSheet, DesignSheetItem } from '@/app/lib/types';

export default function DesignSheetView({
  sheet
}: {
  sheet: DesignSheet;
}) {
  const items: DesignSheetItem[] = sheet.Items || [];

  // Pre-calculate groups so we can use rowSpan in table
  interface RowGroupInfo {
    item: DesignSheetItem;
    originalIndex: number;
    isFirstInGroup: boolean;
    groupSpan: number;
    isGrouped: boolean;
  }

  const processedRows: RowGroupInfo[] = [];
  let i = 0;
  while (i < items.length) {
    const cur = items[i];
    if (cur.isGrouped && cur.groupId) {
      // Find all contiguous items with same groupId
      let j = i;
      while (j < items.length && items[j].isGrouped && items[j].groupId === cur.groupId) {
        j++;
      }
      const groupSpan = j - i;
      for (let k = i; k < j; k++) {
        processedRows.push({
          item: items[k],
          originalIndex: k,
          isFirstInGroup: k === i,
          groupSpan: groupSpan,
          isGrouped: true
        });
      }
      i = j;
    } else {
      processedRows.push({
        item: cur,
        originalIndex: i,
        isFirstInGroup: true,
        groupSpan: 1,
        isGrouped: false
      });
      i++;
    }
  }

  // Generate WhatsApp summary text
  const generateWhatsAppText = () => {
    let msg = `*AYNGARAN TEXTILES - SIZING DESIGN SHEET*\n`;
    msg += `📋 *Design No:* ${sheet.DesignNumber}\n`;
    msg += `🏷️ *Design:* ${sheet.DesignName}\n`;
    msg += `📏 *Item Width:* ${sheet.ItemWidth || '54"'}\n`;
    msg += `🧵 *Total Ends:* ${sheet.TotalEnds?.toLocaleString()} ends\n`;
    if (sheet.ColorSummary) {
      msg += `🎨 *Colors:* ${Object.entries(sheet.ColorSummary).map(([c, n]) => `${c}: ${n}`).join(', ')}\n`;
    }
    msg += `\n*CREEL / PATTERN SETUP:*\n`;

    let idx = 0;
    while (idx < items.length) {
      const it = items[idx];
      if (it.isGrouped && it.groupId) {
        let endIdx = idx;
        const groupMembers: DesignSheetItem[] = [];
        while (endIdx < items.length && items[endIdx].isGrouped && items[endIdx].groupId === it.groupId) {
          groupMembers.push(items[endIdx]);
          endIdx++;
        }
        msg += `[ ${groupMembers.map(m => `${m.color}: ${m.value}`).join(' + ')} ] × ${it.groupRepeat || 1} sets`;
        if (it.groupDescription) msg += ` (${it.groupDescription})`;
        msg += `\n`;
        idx = endIdx;
      } else {
        msg += `• ${it.color}: ${it.value}\n`;
        idx++;
      }
    }

    if (sheet.Notes) {
      msg += `\n📝 *Notes:* ${sheet.Notes}\n`;
    }

    return msg;
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Top Action Bar (Hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        <Link
          href="/admin/design-sheets"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Design Sheets</span>
        </Link>
        <div className="flex items-center gap-3">
          <WhatsAppShareButton
            title={`Design Sheet ${sheet.DesignNumber}`}
            text={generateWhatsAppText()}
          />
          <PrintButton />
          <CopyDesignSheetTopButton
            id={sheet.Id}
            designNumber={sheet.DesignNumber}
            designName={sheet.DesignName}
          />
          <Link
            href={`/admin/design-sheets/${sheet.Id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Edit Design</span>
          </Link>
        </div>
      </div>

      {/* Printable Design Sheet Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 overflow-hidden">
        {/* Header Banner */}
        <div className="border-b border-slate-200 p-6 sm:p-8 bg-slate-50/50 print:bg-transparent print:border-b-2 print:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 print:text-slate-600">
                Ayngaran Tex • Sizing Specification
              </div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1`}>
                {sheet.DesignName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600 font-medium">
                <span className="inline-flex items-center font-bold text-slate-900">
                  Design No: <span className="ml-1.5 font-mono text-blue-700">{sheet.DesignNumber}</span>
                </span>
                <span>•</span>
                <span>Width: <strong className="text-slate-900">{sheet.ItemWidth || '54"'}</strong></span>
                <span>•</span>
                <span>Total Ends: <strong className="text-slate-900">{sheet.TotalEnds?.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Quick summary badges */}
            {sheet.ColorSummary && (
              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Color Breakdown
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(sheet.ColorSummary).map(([color, count]) => {
                    const isWhite = color.toLowerCase().includes('white') || color.includes('சலவை');
                    const isBlack = color.toLowerCase().includes('black') || color.includes('கருப்பு');
                    return (
                      <span
                        key={color}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold border ${isBlack
                          ? 'bg-slate-900 text-white border-slate-900'
                          : isWhite
                            ? 'bg-white text-slate-900 border-slate-300'
                            : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                      >
                        <span>{color}:</span>
                        <span className="font-mono">{count} ends</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pattern Table Matching User's Photo */}
        <div className="p-4 sm:p-8 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-300 text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                <th className="py-3 px-3 sm:px-4 w-5/12">
                  Color / Pattern Description
                </th>
                <th className="py-3 px-3 sm:px-4 w-2/12 font-bold">
                  Value
                </th>
                <th className="py-3 px-3 sm:px-4 w-5/12">
                  Grouping
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {processedRows.map((row, idx) => {
                const { item, isFirstInGroup, groupSpan, isGrouped } = row;
                const isWhite = item.color.toLowerCase().includes('white') || item.color.includes('சலவை');
                const isBlack = item.color.toLowerCase().includes('black') || item.color.includes('கருப்பு');

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    {/* Color / Pattern Description */}
                    <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full border ${isBlack
                            ? 'bg-slate-900 border-slate-900'
                            : isWhite
                              ? 'bg-white border-slate-400'
                              : 'bg-blue-500 border-blue-600'
                            }`}
                        />
                        <span>{item.color}</span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-2.5 px-3 sm:px-4 font-bold font-mono text-base text-slate-900">
                      {item.value}
                    </td>

                    {/* Bracket Grouping column */}
                    {isGrouped ? (
                      isFirstInGroup ? (
                        <td
                          rowSpan={groupSpan}
                          className="py-1 px-3 sm:px-4 align-middle border-l border-slate-100 bg-slate-50/40 print:bg-transparent"
                        >
                          <div className="flex items-center gap-2 h-full py-1">
                            {/* Scalable SVG Curly Brace pointing right */}
                            <svg
                              className="w-4 h-full min-h-[44px] text-slate-800 flex-shrink-0"
                              viewBox="0 0 20 100"
                              preserveAspectRatio="none"
                            >
                              <path
                                d="M 4 2 C 12 2, 14 20, 14 42 C 14 48, 17 50, 20 50 C 17 50, 14 52, 14 58 C 14 80, 12 98, 4 98"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>

                            <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                              <strong className="text-sm sm:text-base font-extrabold text-slate-900">
                                × {item.groupRepeat || 1} sets
                              </strong>{' '}
                              {/* {item.groupDescription && (
                                <span className="text-slate-600 font-medium block sm:inline">
                                  ({item.groupDescription})
                                </span>
                              )} */}
                            </div>
                          </div>
                        </td>
                      ) : null
                    ) : (
                      <td className="py-2.5 px-3 sm:px-4 text-slate-400">
                        {/* Empty for non-grouped rows */}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Dotted / Dashed Separator 1 */}
          <div className="my-3 flex items-center justify-between text-xs font-mono text-slate-400 select-none">
            <span className="flex-1 border-b-2 border-dashed border-slate-300"></span>
            <span className="px-4 font-bold text-slate-500">:-:</span>
            <span className="flex-1 border-b-2 border-dashed border-slate-300"></span>
          </div>

          {/* Grand Total Row */}
          <div className="py-3 px-3 sm:px-4 flex items-center justify-between text-base sm:text-lg font-bold text-slate-900 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">மொத்தம் (Total)</span>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-blue-700">
              {sheet.TotalEnds?.toLocaleString()}
            </div>
          </div>

          {/* Dotted / Dashed Separator 2 */}
          <div className="my-3 flex items-center justify-between text-xs font-mono text-slate-400 select-none">
            <span className="flex-1 border-b-2 border-dashed border-slate-300"></span>
            <span className="px-4 font-bold text-slate-500">:-:</span>
            <span className="flex-1 border-b-2 border-dashed border-slate-300"></span>
          </div>

          {/* Item Width Row */}
          <div className="py-3 px-3 sm:px-4 flex items-center justify-between text-base sm:text-lg font-bold text-slate-900 bg-white rounded-lg border border-slate-200">
            <div>
              <span>உருப்படி அகலம் (Item Width)</span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold text-purple-700">
              {sheet.ItemWidth || '54"'}
            </div>
          </div>

          {/* Notes / Special Instructions for Sizing Master */}
          {sheet.Notes && (
            <div className="mt-6 rounded-lg bg-amber-50/70 border border-amber-200 p-4 text-sm text-amber-900">
              <strong className="block font-bold mb-1 text-amber-950">
                📌 Sizing Master Notes / குறிப்புகள்:
              </strong>
              <p className="whitespace-pre-line">{sheet.Notes}</p>
            </div>
          )}

          {/* Sizing Team Signoff Section (Great for physical printouts) */}
          <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs font-semibold text-slate-500">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
              <span>Prepared By (Office)</span>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
              <span>Sizing Master Sign</span>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
              <span>Creel Verified Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
