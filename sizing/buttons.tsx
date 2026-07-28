"use client";
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/sizing/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Sizing</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/sizing/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: number }) {
    const handleDelete = async () => {
      const invoiceData = {
        SizingId: id,
      };
  
      const jsonBody = JSON.stringify({
        invoiceData,
      });
  
      const res = await fetch(`/api/sizing`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody,
      });
  
      redirect('/dashboard/sizing');
    }
  
    return (
      <>
        <button type="button" onClick={handleDelete} className="rounded-md border p-2 hover:bg-blue-100">
          <span className="sr-only">Delete</span>
          <TrashIcon className="w-5" />
        </button>
      </>
    );
}
