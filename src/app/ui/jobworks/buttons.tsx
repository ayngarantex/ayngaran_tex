"use client";
import { deleteLoom } from '@/app/api/node/looms';
import { PencilIcon, PlusIcon, TrashIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ActionLink, ActionButton } from '@/app/ui/action-button';


export function CreateLoom() {
  return (
    <ActionLink
      href="/admin/jobworks/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Loom</span>{' '}
      <PlusIcon className="h-5 md:" />
    </ActionLink>
  );
}

export function CreateLoomEntry({ loomId }: { loomId: string }) {
  return (
    <ActionLink
      href={loomId === "0" ? `/admin/jobworks/entries` : `/admin/jobworks/entries?loomId=${loomId}`}
      className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">New Entry</span>{' '}
      <PlusIcon className="h-5 md:" />
    </ActionLink>
  );
}

export function UpdateLoom({ id }: { id: string }) {
  return (
    <ActionLink
      href={`/admin/jobworks/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100 flex items-center justify-center"
      title="Edit"
    >
      <PencilIcon className="w-5" />
    </ActionLink>
  );
}

export function ViewLoomEntries({ id }: { id: string }) {
  return (
    <ActionLink
      href={`/admin/jobworks/${id}/view`}
      className="rounded-md border p-2 hover:bg-blue-100 flex items-center justify-center"
      title="View Entries & Warp Details"
    >
      <ListBulletIcon className="w-5" />
    </ActionLink>
  );
}

export function DeleteLoom({ id }: { id: string }) {

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    await deleteLoom(id);
    redirect('/admin/jobworks');
  }

  return (
    <ActionButton onClick={handleDelete} className="rounded-md border p-2 hover:bg-blue-100 flex items-center justify-center" title="Delete">
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </ActionButton>
  );
}
