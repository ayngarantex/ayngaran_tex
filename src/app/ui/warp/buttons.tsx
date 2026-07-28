"use client";
import { PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function UpdateWarp({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/warp/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function EditSUmmary({ Id, LoomId }: { Id: string, LoomId: number }) {
  return (
    <Link
      href={`/admin/warp/${Id}/${LoomId}/summary`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}