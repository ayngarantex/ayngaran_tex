'use client';

import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import FoldingModal, { FoldingEntry } from './folding-modal';
import { removeFoldingEntry } from '@/app/api/node/folding';

export function CreateFolding({ looms, type }: { looms?: any[], type: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh();
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ${type === 'Return' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-sm font-bold text-white shadow-sm active:scale-95 transition-all cursor-pointer`}
            >
                <PlusIcon className="h-4 w-4 stroke-[3]" />
                New {type}
            </button>

            <FoldingModal
                isOpen={isOpen}
                newType={type}
                onClose={() => setIsOpen(false)}
                onSuccess={handleSuccess}
                looms={looms}
            />
        </>
    );
}

export function UpdateFolding({ entry, looms, type }: { entry: FoldingEntry; looms?: any[], type?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh();
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Edit Entry"
            >
                <PencilIcon className="h-4 w-4" />
            </button>

            <FoldingModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSuccess={handleSuccess}
                initialData={entry}
                looms={looms}
                newType={type || entry.Type || 'Given'}
            />
        </>
    );
}

export function DeleteFolding({ id }: { id: number }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this folding record?')) return;

        setLoading(true);
        try {
            const res = await removeFoldingEntry(id);
            if (res.success) {
                router.refresh();
            } else {
                alert(res.error || 'Failed to delete folding entry');
            }
        } catch (err: any) {
            console.error('Delete error:', err);
            alert(err?.message || 'Failed to delete folding entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete Entry"
        >
            <TrashIcon className="h-4 w-4" />
        </button>
    );
}
