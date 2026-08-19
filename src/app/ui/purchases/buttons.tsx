"use client";
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deletePurchase } from '@/app/api/node/purchases';

export function CreatePurchase() {
  return (
    <Link
      href="/admin/purchases/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Add Purchase</span>{' '}
      <PlusIcon className="h-5 md:" />
    </Link>
  );
}

export function UpdatePurchase({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/purchases/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeletePurchase({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this purchase record?')) {
      await deletePurchase(id);
      router.refresh();
    }
  };

  return (
    <button type="button" onClick={handleDelete} className="rounded-md border p-2 hover:bg-blue-100 text-red-600 hover:text-red-800">
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );
}
