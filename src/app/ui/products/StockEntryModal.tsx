'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createStockEntry, updateStockEntry } from '@/app/api/node/stock';
import { formatDateToLocalNew } from '@/app/lib/utils';
import { PlusIcon, PencilIcon, XMarkIcon, CubeIcon } from '@heroicons/react/24/outline';

interface StockEntryModalProps {
  mode: 'create' | 'edit';
  product: {
    Id: string;
    Name: string;
    HSNCode?: string | null;
  };
  entry?: {
    Id: string;
    ProductId: number;
    Quantity: number;
    EntryDate: string;
    Notes: string | null;
  };
  buttonClassName?: string;
  buttonLabel?: string;
  showIcon?: boolean;
  onSuccess?: (updatedEntry?: any) => void;
}

export default function StockEntryModal({
  mode,
  product,
  entry,
  buttonClassName,
  buttonLabel,
  showIcon = true,
  onSuccess,
}: StockEntryModalProps) {
  const router = useRouter();

  // Helper to format today's date for default input value (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format date string for edit mode
  const getEditDateString = () => {
    if (!entry?.EntryDate) return getTodayDateString();
    return formatDateToLocalNew(entry.EntryDate);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState<number | ''>(
    mode === 'edit' && entry ? entry.Quantity : ''
  );
  const [entryDate, setEntryDate] = useState<string>(
    mode === 'edit' ? getEditDateString() : getTodayDateString()
  );
  const [notes, setNotes] = useState<string>(
    mode === 'edit' && entry ? entry.Notes || '' : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpen = () => {
    if (mode === 'edit' && entry) {
      setQuantity(entry.Quantity);
      setEntryDate(getEditDateString());
      setNotes(entry.Notes || '');
    } else {
      setQuantity('');
      setEntryDate(getTodayDateString());
      setNotes('');
    }
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (quantity === '' || isNaN(Number(quantity))) {
      setErrorMsg('Please enter a valid stock quantity');
      return;
    }

    if (!entryDate) {
      setErrorMsg('Please select an entry date');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const res = await createStockEntry({
          ProductId: Number(product.Id),
          Quantity: Number(quantity),
          EntryDate: entryDate,
          Notes: notes.trim() || null,
        });

        if (res?.data?.createStockEntry || (res && !res.errors)) {
          setIsOpen(false);
          if (onSuccess) onSuccess();
          router.refresh();
        } else {
          const msg = res?.errors?.[0]?.message || 'Error recording stock entry';
          setErrorMsg(msg);
        }
      } else {
        if (!entry?.Id) {
          setErrorMsg('Invalid entry ID');
          return;
        }
        const res = await updateStockEntry({
          Id: entry.Id,
          ProductId: Number(product.Id),
          Quantity: Number(quantity),
          EntryDate: entryDate,
          Notes: notes.trim() || null,
        });

        if (res?.data?.updateStockEntry || (res && !res.errors)) {
          setIsOpen(false);
          const updatedObj = {
            ...entry,
            Quantity: Number(quantity),
            EntryDate: entryDate,
            Notes: notes.trim() || null,
          };
          if (onSuccess) onSuccess(updatedObj);
          router.refresh();
        } else {
          const msg = res?.errors?.[0]?.message || 'Error updating stock entry';
          setErrorMsg(msg);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'An error occurred while saving');
    } finally {
      setSubmitting(false);
    }
  };

  // Default button styles
  const defaultClass =
    mode === 'create'
      ? 'rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 flex items-center gap-1 transition-colors shadow-2xs'
      : 'rounded-md border p-1.5 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 transition-colors';

  const defaultLabel = mode === 'create' ? '+ Add Stock' : 'Edit';

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={buttonClassName || defaultClass}
        title={mode === 'create' ? `Add Stock Entry for ${product.Name}` : 'Edit Entry'}
      >
        {showIcon && (
          mode === 'create' ? (
            <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <PencilIcon className="w-3.5 h-3.5 text-gray-600" />
          )
        )}
        <span>{buttonLabel || defaultLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                  <CubeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {mode === 'create' ? 'Record Stock Entry' : 'Edit Stock Entry'}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 truncate max-w-[280px]">
                    Product: <span className="font-semibold text-blue-700">{product.Name}</span>
                    {product.HSNCode ? ` (${product.HSNCode})` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body - Completely Identical structure for Add and Edit */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label
                  htmlFor={`stock-entryDate-${mode}-${product.Id}-${entry?.Id || 'new'}`}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Entry Date <span className="text-red-500">*</span>
                </label>
                <input
                  id={`stock-entryDate-${mode}-${product.Id}-${entry?.Id || 'new'}`}
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label
                  htmlFor={`stock-quantity-${mode}-${product.Id}-${entry?.Id || 'new'}`}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Quantity (pcs) <span className="text-red-500">*</span>
                </label>
                <input
                  id={`stock-quantity-${mode}-${product.Id}-${entry?.Id || 'new'}`}
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuantity(val === '' ? '' : Number(val));
                  }}
                  required
                  placeholder="e.g. 50 (or -5 to deduct)"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Use positive numbers to add stock, negative numbers to remove stock.
                </p>
              </div>

              <div>
                <label
                  htmlFor={`stock-notes-${mode}-${product.Id}-${entry?.Id || 'new'}`}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Notes / Remarks
                </label>
                <textarea
                  id={`stock-notes-${mode}-${product.Id}-${entry?.Id || 'new'}`}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received batch, Damaged goods adjustment..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting
                    ? 'Saving...'
                    : mode === 'create'
                      ? 'Save Stock Entry'
                      : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
