"use client";

import React, { useState } from 'react';
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PrinterIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeDesignSheet, duplicateDesignSheet } from '@/app/api/node/design-sheets';

export function CreateDesignSheet() {
  return (
    <Link
      href="/admin/design-sheets/create"
      className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 shadow-sm"
    >
      <PlusIcon className="h-5 w-5" />
      <span className="hidden md:inline">Create Design Sheet</span>
    </Link>
  );
}

export function ViewDesignSheet({ id }: { id: number | string }) {
  return (
    <Link
      href={`/admin/design-sheets/${id}`}
      title="View Design Sheet"
      className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
    >
      <EyeIcon className="w-4 h-4" />
    </Link>
  );
}

export function UpdateDesignSheet({ id }: { id: number | string }) {
  return (
    <Link
      href={`/admin/design-sheets/${id}/edit`}
      title="Edit Design Sheet"
      className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
    >
      <PencilIcon className="w-4 h-4" />
    </Link>
  );
}

export function DeleteDesignSheet({ id, designNumber }: { id: number; designNumber?: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmMsg = designNumber
      ? `Are you sure you want to delete Design Sheet "${designNumber}"?`
      : "Are you sure you want to delete this design sheet?";
    if (!confirm(confirmMsg)) {
      return;
    }

    const res = await removeDesignSheet(id);
    if (res.success) {
      router.refresh();
    } else {
      alert("Failed to delete design sheet: " + (res.error || "Unknown error"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      title="Delete Design Sheet"
      className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-4 h-4" />
    </button>
  );
}

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
    >
      <PrinterIcon className="w-4 h-4 text-slate-500" />
      <span>Print / PDF</span>
    </button>
  );
}

export function WhatsAppShareButton({
  title,
  text,
  url
}: {
  title: string;
  text: string;
  url?: string;
}) {
  const handleShare = () => {
    const fullText = `${text}\n${url || (typeof window !== 'undefined' ? window.location.href : '')}`;
    const encoded = encodeURIComponent(fullText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors"
    >
      {/* WhatsApp SVG Icon */}
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.055-1.92-.477-1.528-.63-2.516-2.181-2.593-2.282-.077-.101-.62-823-.62-1.569 0-.746.391-1.112.53-1.261.139-.149.303-.186.405-.186.102 0 .204.001.293.006.094.005.219-.036.342.261.127.307.434 1.057.472 1.134.038.077.064.167.013.268-.051.101-.077.164-.153.253-.077.089-.161.199-.23.267-.078.077-.16.16-.069.316.091.156.406.669.871 1.083.598.532 1.103.697 1.259.774.156.077.247.064.339-.041.092-.105.395-.46.5-.618.105-.158.21-.132.353-.079.143.053.906.427 1.062.505.156.078.26.117.299.183.039.066.039.381-.105.786z" />
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.184L2 22l4.957-1.393A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.155-.472-4.44-1.286l-.318-.2-2.937.825.845-2.859-.208-.334A8.145 8.145 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
      </svg>
      <span>Share via WhatsApp</span>
    </button>
  );
}

export function CopyDesignModal({
  isOpen,
  onClose,
  id,
  designNumber,
  designName,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  id: number | string;
  designNumber?: string;
  designName?: string;
  onSuccess?: (newId: number) => void;
}) {
  const router = useRouter();
  const [newDesignNumber, setNewDesignNumber] = useState(
    designNumber ? `${designNumber}-COPY` : ''
  );
  const [newDesignName, setNewDesignName] = useState(
    designName ? `${designName} (Copy)` : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setNewDesignNumber(designNumber ? `${designNumber}-COPY` : '');
      setNewDesignName(designName ? `${designName} (Copy)` : '');
      setError(null);
    }
  }, [isOpen, designNumber, designName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignNumber.trim()) {
      setError("Please enter a Design Number.");
      return;
    }
    if (!newDesignName.trim()) {
      setError("Please enter a Design Name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await duplicateDesignSheet(
        Number(id),
        newDesignNumber.trim(),
        newDesignName.trim()
      );

      if (res.success && res.id) {
        onClose();
        if (onSuccess) {
          onSuccess(res.id);
        } else {
          router.push(`/admin/design-sheets/${res.id}`);
          router.refresh();
        }
      } else {
        setError(res.error || "Failed to copy design sheet");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <DocumentDuplicateIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Copy Design Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Create a duplicate copy with creel setup & brackets.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Source Banner */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Source: </span>
            <span className="font-mono font-bold text-slate-900">{designNumber}</span>
            {designName && <span className="ml-1 text-slate-700">— {designName}</span>}
          </div>

          {/* Textbox 1: New Design Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Design Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={newDesignNumber}
              onChange={(e) => setNewDesignNumber(e.target.value)}
              placeholder="e.g. DS-001-COPY or DS-002"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Textbox 2: New Design Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Design Name (Tamil & English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newDesignName}
              onChange={(e) => setNewDesignName(e.target.value)}
              placeholder="e.g. கருப்பு சலவை பார்டர் வேட்டி (54&quot; Dhoti) (Copy)"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Saving Copy...</span>
                </>
              ) : (
                <span>Save Copy</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CopyDesignSheet({
  id,
  designNumber,
  designName,
  onSuccess
}: {
  id: number | string;
  designNumber?: string;
  designName?: string;
  onSuccess?: (newId: number) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        title="Duplicate / Copy Design Sheet"
        className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
      >
        <span className="sr-only">Copy Design</span>
        <DocumentDuplicateIcon className="w-4 h-4" />
      </button>

      <CopyDesignModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        id={id}
        designNumber={designNumber}
        designName={designName}
        onSuccess={onSuccess}
      />
    </>
  );
}

export function CopyDesignSheetTopButton({
  id,
  designNumber,
  designName
}: {
  id: number | string;
  designNumber?: string;
  designName?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        title="Duplicate / Copy this design sheet"
        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3.5 py-2 text-sm font-medium text-purple-700 shadow-sm hover:bg-purple-100 transition-colors"
      >
        <DocumentDuplicateIcon className="w-4 h-4 text-purple-600" />
        <span>Copy Design</span>
      </button>

      <CopyDesignModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        id={id}
        designNumber={designNumber}
        designName={designName}
      />
    </>
  );
}

