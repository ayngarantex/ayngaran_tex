'use client'

import Link from 'next/link';
import { Button } from '@/app/ui/button';
import ExpensesProductForm from './products-form';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { ExpensesRow } from '@/app/lib/types';

export default function Form() {

  const [invProducts, setInvProducts] = useState<ExpensesRow[]>([]);

  const handleSubmit = async () => {
    const jsonBody = JSON.stringify({
      expensesData: invProducts.filter(e => e.type !== ""),
    })

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonBody,
    });

    const data = await res.json();
    if (data?.count > 0) {
      redirect('/admin/expenses');
    }
  };

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        <ExpensesProductForm
          invProducts={[]}
          setInvProducts={setInvProducts}
          edit={false}
        />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/expenses"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit}>Create Expenses</Button>
      </div>
    </form>
  );
}
