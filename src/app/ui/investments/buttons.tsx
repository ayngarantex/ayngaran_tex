"use client";
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function CreateInvestment() {
  return (
    <Link
      href="/admin/investments/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Add Investment</span>{' '}
      <PlusIcon className="h-5 md:" />
    </Link>
  );
}

export function UpdateInvestment({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/investments/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvestment({ id, onDeleteSuccess }: { id: number, onDeleteSuccess?: () => void }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this investment?")) {
      return;
    }

    const investmentData = {
      InvestmentId: id,
    };

    const jsonBody = JSON.stringify({
      investmentData
    });

    const res = await fetch(`/api/investments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: jsonBody,
    });

    if (res.ok) {
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.refresh();
      }
    } else {
      alert("Failed to delete investment");
    }
  }

  return (
    <button type="button" onClick={handleDelete} className="rounded-md border p-2 hover:bg-blue-100 text-red-600">
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );
}
