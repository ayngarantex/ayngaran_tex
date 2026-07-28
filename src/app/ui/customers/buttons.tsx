"use client";
import { useState } from 'react';
import { deleteCustomer } from '@/app/api/node/customers';
import { BookOpenIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export function CreateCustomer() {
  return (
    <Link
      href="/admin/customers/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Customer</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateCustomer({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/customers/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function CustomerLeader({ id, startDate, endDate, billType }: { id: string, startDate: string, endDate: string, billType: string }) {
  let string = ''
  if (startDate) {
    string += `?startDate=${startDate}&endDate=${endDate}`
    if (billType) {
      string += `&billType=${billType}`
    }
  } else {
    if (billType) {
      string += `?billType=${billType}`
    }
  }
  return (
    <Link
      href={`/admin/customers/${id}/ledger${string}`}
      className="rounded-md border p-2 hover:bg-blue-100"
      title="ledger"
    >
      <BookOpenIcon className="w-5" />
    </Link>
  );
}

export function DeleteCustomer({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }
    await deleteCustomer(id); //node query
    redirect('/admin/customers');
  }

  return (
    <>
      <button type="button" onClick={handleDelete} className="rounded-md border p-2 hover:bg-red-200">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}

export function UpdateCustomerProduct({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/customers/${id}/product`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      Prod
    </Link>
  );
}

export function PrintCustomers({ query, startDate, endDate, billType, orderBy }: { query: string, startDate: string, endDate: string, billType: string, orderBy: string }) {
  const handlePrint = () => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (billType) params.set('billType', billType);
    if (orderBy) params.set('orderBy', orderBy);
    params.set('print', 'true');
    window.open(`/admin/customers?${params.toString()}`, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="flex h-10 items-center rounded-lg bg-gray-100 border border-gray-300 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 no-print"
      title="Print List"
    >
      <span className="hidden md:block">Print List</span>
      <PrinterIcon className="h-5 md:ml-2 w-5 text-gray-500" />
    </button>
  );
}

export function PrintSelector() {
  const [fields, setFields] = useState({
    name: true,
    gst: true,
    state: true,
    mobile: true,
    agent: true,
    pending: true,
    address: true,
  });

  const handleToggle = (field: keyof typeof fields) => {
    const nextVal = !fields[field];
    setFields(prev => ({ ...prev, [field]: nextVal }));

    const elements = document.querySelectorAll(`.col-${field}`);
    elements.forEach(el => {
      if (nextVal) {
        el.classList.remove('hidden-print-col');
      } else {
        el.classList.add('hidden-print-col');
      }
    });
  };

  return (
    <div className="no-print p-6 bg-blue-50/50 border border-blue-200/60 rounded-xl mb-6 shadow-sm">
      <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002-2zm-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Select Columns to Print
      </h2>
      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
        {Object.keys(fields).map((key) => {
          let label = '';
          if (key === 'gst') label = 'GST Number';
          else if (key === 'name') label = 'Customer Name';
          else label = key.charAt(0).toUpperCase() + key.slice(1);
          return (
            <label key={key} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fields[key as keyof typeof fields]}
                onChange={() => handleToggle(key as keyof typeof fields)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              {label}
            </label>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Selected Columns
        </button>
        <button
          onClick={() => window.close()}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg border border-gray-300 transition-colors"
        >
          Cancel / Close
        </button>
      </div>
    </div>
  );
}