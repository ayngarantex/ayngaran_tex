"use client";
import { BookOpenIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteSupplier } from '@/app/api/node/supplier';

export function CreateSupplier() {
  return (
    <Link
      href="/admin/suppliers/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Supplier</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateSupplier({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/suppliers/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function SupplierLeader({ id, startDate, endDate, billType }: { id: string, startDate: string, endDate: string, billType: string }) {
  let string = ''
  if(startDate) {
    string += `?startDate=${startDate}&endDate=${endDate}`
    if(billType) {
      string += `&billType=${billType}`
    }
  } else {
    if(billType) {
      string += `?billType=${billType}`
    }
  }
  return (
    <Link
      href={`/admin/suppliers/${id}/ledger${string}`}
      className="rounded-md border p-2 hover:bg-blue-100"
      title="ledger"
    >
      <BookOpenIcon className="w-5" />
    </Link>
  );
}

export function DeleteSupplier({ id }: { id: number }) {
    const router = useRouter();

    const handleDelete = async () => {
      if (confirm('Are you sure you want to delete this supplier?')) {
        await deleteSupplier(id);
        router.refresh();
      }
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