'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createStockEntry } from '@/app/api/node/stock';

interface StockCreateFormProps {
  product: {
    Id: string;
    Name: string;
    HSNCode: string | null;
  };
}

export default function StockCreateForm({ product }: StockCreateFormProps) {
  const router = useRouter();
  
  // Format today's date for default input value (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [quantity, setQuantity] = useState<number | ''>('');
  const [entryDate, setEntryDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || isNaN(Number(quantity))) {
      alert('Please enter a valid stock quantity');
      return;
    }

    if (!entryDate) {
      alert('Please select an entry date');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createStockEntry({
        ProductId: Number(product.Id),
        Quantity: Number(quantity),
        EntryDate: entryDate,
        Notes: notes.trim() || null
      });

      if (res?.data?.createStockEntry) {
        router.push(`/admin/products/${product.Id}/stocks`);
        router.refresh();
      } else {
        alert(res?.errors?.[0]?.message || 'Failed to create stock entry');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating stock entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="rounded-lg bg-blue-50 p-6 md:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Record Stock Entry</h1>
        <p className="text-sm text-slate-500 mb-6">
          Add inventory changes for product: <strong className="text-slate-800">{product.Name}</strong>
        </p>

        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="entryDate" className="block text-sm font-semibold text-gray-700">
              Entry Date <span className="text-red-500">*</span>
            </label>
            <input
              id="entryDate"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
              className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val === '' ? '' : Number(val));
              }}
              required
              placeholder="e.g. 50 (or -5 if removing stock)"
              className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Use positive numbers to add stock, and negative numbers to remove stock.</p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
              Notes / Remarks
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received batch, Damaged goods adjustment, Sales deduct..."
              className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Link
          href={`/admin/products/${product.Id}/stocks`}
          className="flex h-10 items-center rounded-lg bg-blue-100 px-5 text-sm font-semibold text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Record Entry'}
        </Button>
      </div>
    </form>
  );
}
