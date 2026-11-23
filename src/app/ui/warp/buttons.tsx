"use client";
import { PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ActionLink } from '@/app/ui/action-button';

export function UpdateWarp({ id }: { id: string }) {
  return (
    <ActionLink
      href={`/admin/warp/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100 flex items-center justify-center"
      title="Edit Warp"
    >
      <PencilIcon className="w-5" />
    </ActionLink>
  );
}

export function EditSUmmary({ Id, LoomId }: { Id: string, LoomId: number | string }) {
  const safeId = Id || '0';
  const safeLoomId = LoomId !== undefined && LoomId !== null && LoomId !== '' ? LoomId : '0';
  return (
    <ActionLink
      href={`/admin/warp/${safeId}/${safeLoomId}/summary`}
      className="rounded-md border p-2 hover:bg-blue-100 flex items-center justify-center"
      title="Summary"
    >
      <PencilIcon className="w-5" />
    </ActionLink>
  );
}