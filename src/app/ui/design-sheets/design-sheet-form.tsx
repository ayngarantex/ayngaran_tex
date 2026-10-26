"use client";

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  saveDesignSheet,
  modifyDesignSheet
} from '@/app/api/node/design-sheets';
import type { DesignSheet, DesignSheetItem, DesignSheetPayload } from '@/app/lib/types';

const QUICK_COLORS = [
  'கருப்பு (Black)',
  'சலவை (White)',
  'காவி (Kaavi)',
  'மஞ்சள் (Yellow)',
  'பச்சை (Green)',
  'நீலம் (Blue)',
  'மெரூன் (Maroon)',
  'ஆரஞ்சு (Orange)'
];

const STANDARD_WIDTHS = ['48"', '50"', '52"', '54"', '56"', '58"', '60"'];

export default function DesignSheetForm({
  initialData,
  isEdit = false
}: {
  initialData?: DesignSheet | null;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [designNumber, setDesignNumber] = useState(initialData?.DesignNumber || '');
  const [designName, setDesignName] = useState(initialData?.DesignName || '');
  const [itemWidth, setItemWidth] = useState(initialData?.ItemWidth || '54"');
  const [notes, setNotes] = useState(initialData?.Notes || '');

  // Rows state
  const [items, setItems] = useState<DesignSheetItem[]>(() => {
    if (initialData?.Items && initialData.Items.length > 0) {
      return initialData.Items;
    }
    // Default starter rows
    return [
      { id: 'row_1', color: 'கருப்பு (Black)', value: 48, isGrouped: false },
      { id: 'row_2', color: 'சலவை (White)', value: 4, isGrouped: false },
      { id: 'row_3', color: 'கருப்பு (Black)', value: 4, isGrouped: false },
      { id: 'row_4', color: 'சலவை (White)', value: 2, isGrouped: true, groupId: 'grp_1', groupRepeat: 100, groupDescription: 'Both White & Black lines' },
      { id: 'row_5', color: 'கருப்பு (Black)', value: 2, isGrouped: true, groupId: 'grp_1', groupRepeat: 100, groupDescription: 'Both White & Black lines' },
      { id: 'row_6', color: 'கருப்பு (Black)', value: 1408, isGrouped: false },
    ];
  });

  // Calculate live total ends & color breakdown
  const calculateTotals = () => {
    let total = 0;
    const colors: Record<string, number> = {};

    items.forEach((it) => {
      const val = Number(it.value) || 0;
      const repeat = it.isGrouped && it.groupRepeat ? Number(it.groupRepeat) : 1;
      const rowEnds = val * repeat;

      total += rowEnds;
      const c = (it.color || 'Unspecified').trim();
      colors[c] = (colors[c] || 0) + rowEnds;
    });

    return { total, colors };
  };

  const { total: totalEnds, colors: colorSummary } = calculateTotals();

  // Add a standard single row
  const addSingleRow = () => {
    const newId = 'row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setItems((prev) => [
      ...prev,
      { id: newId, color: 'கருப்பு (Black)', value: 4, isGrouped: false }
    ]);
  };

  // Add a 2-color repeat bracket set
  const addBracketRepeatSet = () => {
    const grpId = 'grp_' + Date.now();
    const id1 = 'row_' + Date.now() + '_1';
    const id2 = 'row_' + Date.now() + '_2';
    setItems((prev) => [
      ...prev,
      {
        id: id1,
        color: 'சலவை (White)',
        value: 2,
        isGrouped: true,
        groupId: grpId,
        groupRepeat: 18,
        groupDescription: 'Both White & Black lines'
      },
      {
        id: id2,
        color: 'கருப்பு (Black)',
        value: 2,
        isGrouped: true,
        groupId: grpId,
        groupRepeat: 18,
        groupDescription: 'Both White & Black lines'
      }
    ]);
  };

  // Mirror pattern for symmetrical dhoti/saree borders
  const mirrorBorder = () => {
    if (items.length === 0) return;
    if (!confirm('This will duplicate and reverse the rows above (except the center body) to create a mirrored bottom border. Continue?')) {
      return;
    }

    const newRows = items.slice(0, -1).reverse().map((r) => {
      const newId = 'row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const newGrpId = r.groupId ? 'grp_mirror_' + Date.now() + '_' + r.groupId : undefined;
      return {
        ...r,
        id: newId,
        groupId: newGrpId
      };
    });

    setItems((prev) => [...prev, ...newRows]);
  };

  const updateRow = (index: number, updates: Partial<DesignSheetItem>) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };

      // If groupId or groupRepeat or groupDescription changed, sync across all rows in the same group
      if (copy[index].isGrouped && copy[index].groupId) {
        const curGrpId = copy[index].groupId;
        if ('groupRepeat' in updates || 'groupDescription' in updates) {
          copy.forEach((row, i) => {
            if (row.isGrouped && row.groupId === curGrpId) {
              copy[i] = {
                ...row,
                groupRepeat: updates.groupRepeat !== undefined ? updates.groupRepeat : row.groupRepeat,
                groupDescription: updates.groupDescription !== undefined ? updates.groupDescription : row.groupDescription
              };
            }
          });
        }
      }

      return copy;
    });
  };

  const toggleGroupForRow = (index: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const row = copy[index];
      if (row.isGrouped) {
        copy[index] = {
          ...row,
          isGrouped: false,
          groupId: undefined,
          groupRepeat: undefined,
          groupDescription: undefined
        };
      } else {
        // Link with previous row's group if previous row is grouped
        const prevRow = copy[index - 1];
        if (prevRow && prevRow.isGrouped && prevRow.groupId) {
          copy[index] = {
            ...row,
            isGrouped: true,
            groupId: prevRow.groupId,
            groupRepeat: prevRow.groupRepeat || 10,
            groupDescription: prevRow.groupDescription || ''
          };
        } else {
          const newGrpId = 'grp_' + Date.now();
          copy[index] = {
            ...row,
            isGrouped: true,
            groupId: newGrpId,
            groupRepeat: 10,
            groupDescription: ''
          };
        }
      }
      return copy;
    });
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const duplicateRow = (index: number) => {
    const item = items[index];
    const newId = 'row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setItems((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, { ...item, id: newId });
      return copy;
    });
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) {
      alert('Design sheet must have at least 1 row.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!designNumber.trim()) {
      setError('Design Number is required.');
      return;
    }

    if (!designName.trim()) {
      setError('Design Name is required.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one row of warp pattern.');
      return;
    }

    setSubmitting(true);

    const payload: DesignSheetPayload = {
      DesignNumber: designNumber.trim(),
      DesignName: designName.trim(),
      ItemWidth: itemWidth.trim() || '54"',
      Notes: notes.trim() || null,
      Items: items
    };

    try {
      if (isEdit && initialData?.Id) {
        const res = await modifyDesignSheet(initialData.Id, payload);
        if (res.success) {
          router.push(`/admin/design-sheets/${initialData.Id}`);
          router.refresh();
        } else {
          setError(res.error || 'Failed to update design sheet');
        }
      } else {
        const res = await saveDesignSheet(payload);
        if (res.success && res.id) {
          router.push(`/admin/design-sheets/${res.id}`);
          router.refresh();
        } else {
          setError(res.error || 'Failed to create design sheet');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={isEdit && initialData?.Id ? `/admin/design-sheets/${initialData.Id}` : '/admin/design-sheets'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Cancel & Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>{isEdit ? 'Update Design Sheet' : 'Save Design Sheet'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main Metadata Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {isEdit ? 'Edit Design Sheet Details' : 'New Design Sheet Details'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Design Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Design Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={designNumber}
              onChange={(e) => setDesignNumber(e.target.value)}
              placeholder="e.g. DS-001"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Design Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Design Name (Tamil & English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="e.g. கருப்பு சலவை பார்டர் வேட்டி (54&quot; Dhoti)"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Item Width */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Width (உருப்படி அகலம்)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={itemWidth}
                onChange={(e) => setItemWidth(e.target.value)}
                placeholder="54&quot;"
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-1">
                {STANDARD_WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setItemWidth(w)}
                    className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${itemWidth === w
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes for Sizing Master */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Sizing Master Instructions / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Set creel according to bracket grouping. Maintain tension on border white sets."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Live Total Ends & Color Breakdown Summary Ribbon */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-blue-200 tracking-wider">
              Real-Time Calculated Warp Ends
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold font-mono text-white">
                {totalEnds.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-blue-200">மொத்தம் (Total Ends)</span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase font-semibold text-blue-200 tracking-wider block mb-1">
              Color Breakdown
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(colorSummary).map(([color, count]) => (
                <div
                  key={color}
                  className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs"
                >
                  <span className="text-blue-100">{color}:</span>{' '}
                  <strong className="font-mono text-white text-sm">{count.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Lines Builder Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="border-b border-slate-200 p-4 sm:px-6 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Creel Pattern & Bracket Setup
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add rows in creel sequence. Toggle &quot;Bracket Group&quot; for repeated border patterns.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addSingleRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <PlusIcon className="w-4 h-4 text-blue-600" />
              <span>+ Add Line</span>
            </button>
            <button
              type="button"
              onClick={addBracketRepeatSet}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 shadow-sm"
            >
              <PlusIcon className="w-4 h-4 text-blue-600" />
              <span>+ Add Repeat Bracket (2-Line)</span>
            </button>
            <button
              type="button"
              onClick={mirrorBorder}
              title="Duplicate & reverse top rows for bottom border"
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 shadow-sm"
            >
              <DocumentDuplicateIcon className="w-4 h-4 text-purple-600" />
              <span>Mirror Bottom Border</span>
            </button>
          </div>
        </div>

        {/* Rows List */}
        <div className="divide-y divide-slate-100 p-2 sm:p-4">
          {items.map((row, index) => {
            const isGrouped = !!row.isGrouped;
            const repeat = row.groupRepeat || 1;
            const rowEnds = (Number(row.value) || 0) * (isGrouped ? repeat : 1);

            return (
              <div
                key={row.id || index}
                className={`p-3 rounded-lg transition-colors mb-1.5 ${isGrouped ? 'bg-amber-50/40 border border-amber-200/80' : 'hover:bg-slate-50 border border-transparent'
                  }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  {/* Row Index Badge & Reordering */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="w-7 text-center font-mono text-xs font-bold text-slate-400">
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveRow(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveRow(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Color Selection */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.color}
                        onChange={(e) => updateRow(index, { color: e.target.value })}
                        placeholder="Color / Pattern"
                        className="w-full sm:w-48 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      {/* Color shortcuts */}
                      <div className="hidden sm:flex flex-wrap gap-1">
                        {QUICK_COLORS.slice(0, 4).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => updateRow(index, { color: c })}
                            className={`rounded px-1.5 py-0.5 text-[11px] font-medium border ${row.color === c
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                              }`}
                          >
                            {c.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Value (Ends Count) */}
                  <div className="w-32 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">Ends:</span>
                      <input
                        type="number"
                        min="1"
                        value={row.value || ''}
                        onChange={(e) => updateRow(index, { value: Number(e.target.value) || 0 })}
                        className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bracket Grouping Controls */}
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleGroupForRow(index)}
                      className={`rounded px-2.5 py-1 text-xs font-bold transition-colors border ${isGrouped
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                    >
                      {isGrouped ? '✓ In Bracket' : '+ Bracket Group'}
                    </button>

                    {isGrouped && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-amber-900">×</span>
                          <input
                            type="number"
                            min="1"
                            value={row.groupRepeat || ''}
                            onChange={(e) => updateRow(index, { groupRepeat: Number(e.target.value) || 1 })}
                            placeholder="Sets"
                            title="Repeat sets count"
                            className="w-16 rounded border border-amber-300 bg-white px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                          />
                          <span className="text-xs text-amber-900 font-medium">sets</span>
                        </div>

                        <input
                          type="text"
                          value={row.groupDescription || ''}
                          onChange={(e) => updateRow(index, { groupDescription: e.target.value })}
                          placeholder="e.g. Both White & Black lines"
                          title="Group description"
                          className="w-48 rounded border border-amber-300 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Total Ends for this row */}
                  <div className="w-24 text-right flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      = {rowEnds.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">ends</span>
                  </div>

                  {/* Row Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => duplicateRow(index)}
                      title="Duplicate row"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      title="Delete row"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions inside Card */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addSingleRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              <PlusIcon className="w-4 h-4 text-blue-600" />
              <span>Add Single Row</span>
            </button>
            <button
              type="button"
              onClick={addBracketRepeatSet}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 shadow-sm"
            >
              <PlusIcon className="w-4 h-4 text-blue-600" />
              <span>Add Repeat Bracket Set</span>
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Grand Total: </span>
            <strong className="font-mono text-base font-extrabold text-blue-700">
              {totalEnds.toLocaleString()} ends
            </strong>
          </div>
        </div>
      </div>

      {/* Submit / Cancel Bar */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href={isEdit && initialData?.Id ? `/admin/design-sheets/${initialData.Id}` : '/admin/design-sheets'}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {submitting ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>{isEdit ? 'Update Design Sheet' : 'Save Design Sheet'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
