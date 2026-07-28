"use client";
import { deleteLoom } from '@/app/api/node/looms';
import { PencilIcon, PlusIcon, TrashIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect } from 'next/navigation';


export function CreateLoom() {
  return (
    <Link
      href="/admin/jobworks/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Loom</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreateLoomEntry({ loomId }: { loomId: string }) {
  return (
    <Link
      href={loomId === "0" ? `/admin/jobworks/entries` : `/admin/jobworks/entries?loomId=${loomId}`}
      className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">New Entry</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateLoom({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/jobworks/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function ViewLoomEntries({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/jobworks/${id}/view`}
      className="rounded-md border p-2 hover:bg-blue-100"
      title="View Entries & Warp Details"
    >
      <ListBulletIcon className="w-5" />
    </Link>
  );
}

export function DeleteLoom({ id }: { id: string }) {

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    const res = await deleteLoom(id);

    // const jsonBody = JSON.stringify({
    //   productData,
    // });

    // const res = await fetch(`/api/jobworks`, {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: jsonBody,
    // });

    // const data = await res.json();
    redirect('/admin/jobworks');
    // return
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
