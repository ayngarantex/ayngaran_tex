'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteStockEntry } from '@/app/api/node/stock';
import { formatDateNew, formatDateToLocalNew } from '@/app/lib/utils';

interface StockEntry {
  Id: string;
  ProductId: number;
  Quantity: number;
  EntryDate: string;
  Notes: string | null;
}

interface StockEntriesListProps {
  initialEntries: StockEntry[];
  product: {
    Id: string;
    Name: string;
    HSNCode: string | null;
    AvailableStock: number;
  };
  stockDetails: {
    TotalStock: number;
    SoldCount: number;
    AvailableStock: number;
  }
}

export default function StockEntriesList({ initialEntries, product, stockDetails }: StockEntriesListProps) {
  const [entries, setEntries] = useState<StockEntry[]>(initialEntries);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stock entry?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteStockEntry(Number(id));
      if (res?.data?.deleteStockEntry) {
        setEntries((prev) => prev.filter((entry) => entry.Id !== id));
      } else {
        alert(res?.errors?.[0]?.message || 'Failed to delete stock entry');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting stock entry');
    } finally {
      setDeletingId(null);
    }
  };

  const totalStock = entries.reduce((sum, entry) => sum + entry.Quantity, 0);

  return (
    <div className="w-full max-w-5xl">
      {/* Product Summary Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Stock Management</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{product.Name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Product Code (HSN): {product.HSNCode || 'N/A'}
          </p>
        </div>
        <div className="shadow-sm border border-blue-200/60 bg-blue-50/70 rounded-xl px-5 py-3 text-center">
          <span className="text-xs font-semibold text-blue-700 block">Total</span>
          <span className="text-3xl font-black text-blue-700 mt-0.5 block">{stockDetails?.TotalStock}</span>
        </div>
        <div className="shadow-sm border border-emerald-200/60 bg-emerald-50/70 rounded-xl px-5 py-3 text-center">
          <span className="text-xs font-semibold text-emerald-700 block">Sold</span>
          <span className="text-3xl font-black text-emerald-700 mt-0.5 block">{stockDetails?.SoldCount}</span>
        </div>
        <div className="shadow-sm border border-purple-200/60 bg-purple-50/70 rounded-xl px-5 py-3 text-center">
          <span className="text-xs font-semibold text-purple-700 block">Available</span>
          <span className="text-3xl font-black text-purple-700 mt-0.5 block">{stockDetails?.AvailableStock}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Stock Ledger Entries</h2>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="flex h-10 items-center rounded-lg bg-blue-100 px-5 text-sm font-semibold text-gray-600 transition-colors hover:bg-blue-200"
          >
            Back to Products
          </Link>
          <Link
            href={`/admin/products/${product.Id}/stocks/create`}
            className="flex h-10 items-center rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            + Add Stock Entry
          </Link>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 font-medium">No stock entries found for this product.</p>
            <p className="text-xs text-slate-400 mt-1">Click "+ Add Stock Entry" to record inventory additions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-slate-900 text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-600">Entry Date</th>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-600">Quantity Added</th>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-600">Notes / Remarks</th>
                  <th scope="col" className="px-6 py-4 font-bold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => {
                  // Formating date
                  const dateStr = entry.EntryDate
                    ? formatDateNew(entry.EntryDate)
                    : 'N/A';

                  return (
                    <tr key={entry.Id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{dateStr}</td>
                      <td className="px-6 py-4 font-bold text-blue-700">
                        {entry.Quantity > 0 ? `+${entry.Quantity}` : entry.Quantity}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-pre-wrap">{entry.Notes || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/admin/products/${product.Id}/stocks/${entry.Id}/edit`}
                            className="rounded-md border p-1.5 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 transition-colors"
                            title="Edit Entry"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.Id)}
                            disabled={deletingId === entry.Id}
                            className="rounded-md border p-1.5 border-red-100 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                            title="Delete Entry"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
