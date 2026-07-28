"use client";
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function BeemDetails() {
  return (
    <Link
      href="/admin/beem/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateBeem({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/beem/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}