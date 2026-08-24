'use client';

import { formatDateToLocalNew } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateEntry } from '@/app/api/node/looms';

interface Entry {
  date: string;
  type: string;
  details: string;
  weight: number | '';
  loomId: string;
  babbin: number | 0;
}

const emptyEntry = (entry: any): Entry => ({
  date: entry?.Date ? formatDateToLocalNew(entry.Date) : '',
  type: entry?.Type || '',
  details: entry?.Details || '',
  weight: entry?.Weight || '',
  loomId: entry?.LoomId || '',
  babbin: entry?.BabbinCount || 0
});


export default function BabbinEntryDetails({ looms, entry }: { looms: any[], entry?: any }) {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>(() => [emptyEntry(entry)]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const updateRow = (index: number, field: keyof Entry, value: string) => {
    setEntries((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
            ...row,
            [field]: field === 'weight'
              ? (value === '' ? '' : Number(value))
              : field === 'babbin'
                ? (value === '' ? 0 : parseInt(value, 10) || 0)
                : value,
          }
          : row
      )
    );
  };

  const canSave = entries.some((row) => row.date || row.type || row.details || row.weight !== '' || row.loomId !== '' || row.babbin !== 0);

  const handleUpdate = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const payload = entries
        .filter((row) => row.date || row.type || row.details || row.weight !== '' || row.loomId !== '')
        .map((row) => ({
          LoomEntryId: entry.LoomEntryId,
          BabbinCount: row.babbin ? Number(row.babbin) : 0,
          Date: row.date,
          Type: row.type,
          Details: row.details,
          Weight: row.weight === '' ? 0 : row.weight,
          LoomId: row.loomId ? Number(row.loomId) : null,
        }));

      const res = await updateEntry(payload?.length > 0 ? payload[0] : {})

      if (res?.data?.updateEntry) {
        router.push(`/admin/jobworks/${entry.LoomId}/view`);
      }
    } catch (err) {
      setStatus(`Save failed: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mt-6 grid gap-3">
        {entries.map((entry, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-4 md:grid-cols-12">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <input
                type="date"
                value={entry.date}
                onChange={(e) => updateRow(index, 'date', e.target.value)}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Type</label>
              <select
                value={entry.type}
                onChange={(e) => updateRow(index, 'type', e.target.value)}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select Type</option>
                <option value="Weft">Weft</option>
                <option value="Babbin Given">Babbin Given</option>
                <option value="Babbin Return">Babbin Return</option>
                <option value="Return Cone">Return Cone</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Loom {entry.type}</label>
              <select
                value={entry.loomId}
                onChange={(e) => updateRow(index, 'loomId', e.target.value)}
                className={`mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm ${entry.loomId ? 'bg-gray-100 disabled' : ''}`}
              >
                <option value="">Select Loom</option>
                {looms.map((loom) => (
                  <option key={loom.LoomId} value={loom.LoomId}>
                    {loom.LoomName}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${entry.type === 'Babbin Given' || entry.type === 'Babbin Return' ? 'md:col-span-3' : 'md:col-span-4'}`}>
              <label className="text-xs font-semibold text-slate-500">Details</label>
              <input
                type="text"
                value={entry.details}
                onChange={(e) => updateRow(index, 'details', e.target.value)}
                placeholder="Details"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            {(entry.type === 'Babbin Given' || entry.type === 'Babbin Return') && (
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-500">Babbin</label>
                <input
                  type="number"
                  step="any"
                  value={entry.babbin}
                  onChange={(e) => updateRow(index, 'babbin', e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            )}

            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-500">Weight</label>
              <input
                type="number"
                step="any"
                value={entry.weight}
                onChange={(e) => updateRow(index, 'weight', e.target.value)}
                placeholder="0"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {status ? (
        <div className="mt-6 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700">{status}</div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={!canSave || saving}
          className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-green-700"
        >
          {saving ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
}
