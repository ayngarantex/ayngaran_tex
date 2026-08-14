'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { formatDateToLocal } from '@/app/lib/utils';

export default function InvestmentEditForm({ investment }: { investment: any }) {
  const [date, setDate] = useState(formatDateToLocal(investment.Date));
  const [investorName, setInvestorName] = useState(investment.InvestorName || "");
  const [type, setType] = useState(investment.Type || "Cash");
  const [amount, setAmount] = useState(investment.Amount || "");
  const [notes, setNotes] = useState(investment.Notes || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!investorName.trim()) {
      alert("Investor Name is required");
      return;
    }
    if (!amount || parseFloat(amount) === 0 || isNaN(parseFloat(amount))) {
      alert("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const investmentData = {
        Date: date,
        InvestorName: investorName.trim(),
        Type: type,
        Amount: parseFloat(amount) || 0,
        Notes: notes.trim() || null
      };

      const res = await fetch('/api/investments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          InvestmentId: investment.InvestmentId,
          investmentData
        }),
      });

      if (res.ok) {
        window.location.href = '/admin/investments';
      } else {
        alert("Failed to update investment record");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Edit Investment Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div className="mb-4">
            <label htmlFor="date" className="mb-2 block text-sm font-medium text-gray-900">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 bg-white"
            />
          </div>

          {/* Investor Name */}
          <div className="mb-4">
            <label htmlFor="investorName" className="mb-2 block text-sm font-medium text-gray-900">
              Investor Name
            </label>
            <input
              id="investorName"
              type="text"
              required
              placeholder="e.g. Partner Capital, Suresh, etc."
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 bg-white"
            />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-900">
              Amount (₹)
            </label>
            <input
              id="amount"
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 bg-white"
            />
          </div>

          {/* Investment Type */}
          <div className="mb-4">
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-900">
              Investment Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer / Online</option>
              <option value="Check">Check</option>
              <option value="Partner Capital">Partner Capital</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-900">
            Notes / Description
          </label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Add any specific details regarding this investment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 bg-white"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/investments"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Updating..." : "Update Investment"}
        </Button>
      </div>
    </form>
  );
}
