'use client'

import Link from 'next/link';
import { Button } from '@/app/ui/button';
import ExpensesProductForm from './products-form';
import { redirect } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { ExpensesRow } from '@/app/lib/types';
export default function EditForm({
  expenses
}: {
  expenses: any
}) {
  const [invProducts, setInvProducts] = useState<ExpensesRow[]>([]);

  useEffect(() => {
    setInvProducts(expenses || []);
  }, [expenses]);

  const handleSubmit = async () => {
    let expanseData = {
      Date: invProducts?.[0]?.date || '',
      Reason: invProducts?.[0].reason,
      Type: invProducts?.[0]?.type || '',
      Amount: invProducts?.[0].amount,
    }
    const jsonBody = JSON.stringify({
      ExpenseId: expenses?.[0]?.ExpenseId,
      expanseData
    })

    const res = await fetch('/api/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonBody,
    });

    const data = await res.json();
    if (data?.ExpenseId) {
      redirect('/admin/expenses');
    }
  };

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        <ExpensesProductForm
          invProducts={invProducts}
          setInvProducts={setInvProducts}
          edit
        />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/expenses"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit}>Update Expense</Button>
      </div>
    </form>
  );
}
