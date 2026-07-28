'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEntry } from '@/app/api/node/looms';

interface Entry {
  date: string;
  type: string;
  details: string;
  weight: number | '';
  babbin: number | '';
  loomId: string;
}

const emptyEntry = (loomId: number): Entry => ({ date: '', type: '', details: '', weight: '', babbin: 0, loomId: loomId.toString() });

export default function WarpMultiForm({ looms = [], loomId = 0 }: { looms?: any[], loomId?: number }) {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([emptyEntry(loomId)]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const totalWeight = useMemo(
    () =>
      entries.reduce((sum, row) => {
        const w = typeof row.weight === 'number' ? row.weight : parseFloat(String(row.weight));
        return sum + (isNaN(w) ? 0 : w);
      }, 0),
    [entries]
  );

  const updateRow = (index: number, field: keyof Entry, value: string) => {
    setEntries((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
            ...row,
            [field]: field === 'weight' ? (value === '' ? '' : Number(value)) : value,
          }
          : row
      )
    );
  };

  const addRow = () => setEntries((prev) => [...prev, emptyEntry(loomId)]);

  const removeRow = (index: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== index));

  const canSave = entries.some((row) => row.date || row.type || row.babbin || row.details || row.weight !== '' || row.loomId !== '');

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const payload = entries
        .filter((row) => row.date || row.type || row.babbin || row.details || row.weight !== '' || row.loomId !== '')
        .map((row) => ({
          Date: row.date,
          Type: row.type,
          BabbinCount: row.babbin ? Number(row.babbin) : 0,
          Details: row.details,
          Weight: row.weight === '' ? 0 : row.weight,
          LoomId: row.loomId ? Number(row.loomId) : null,
        }));

      const res = await createEntry(payload)

      setEntries([emptyEntry(loomId)]);
      if (res.data.createEntry) {
        router.push(`/admin/jobworks/${loomId}/view`);
      }
    } catch (err) {
      setStatus(`Save failed: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">entries</h3>
          <p className="text-sm text-slate-600">Add multiple rows and save them all together.</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="text-sm text-slate-600">
            Total weight: <span className="font-semibold">{totalWeight}</span>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add row
          </button>
        </div>
        <Link
          href={
            loomId ? `/admin/jobworks/${loomId}/view` : `/admin/jobworks`
          }
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Go Back
        </Link>
      </div>

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
                <option value="Warp">Warp</option>
                <option value="Babbin">Babbin</option>
                <option value="Babbin Given">Babbin Given</option>
                <option value="Babbin Return">Babbin Return</option>
                <option value="Kuri Cone">Kuri Cone</option>
                <option value="Vesti">Vesti</option>
                <option value="Return Cone">Return Cone</option>
                <option value="Wast Percentage">Wast Percentage</option>
                <option value="Closed Negative">Closed Negative</option>
                <option value="Closed Positive">Closed Positive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Loom</label>
              <select
                value={entry.loomId}
                onChange={(e) => updateRow(index, 'loomId', e.target.value)}
                className={`mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm ${loomId ? 'bg-gray-100 disabled' : ''}`}
                disabled={loomId > 0}
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

            <div className="md:col-span-1 md:flex md:items-end md:justify-end">
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="mt-1 w-full rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {status ? (
        <div className="mt-6 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700">{status}</div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          Tip: leave a row blank to skip it when saving.
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-green-700"
        >
          {saving ? 'Saving…' : 'Save all'}
        </button>
      </div>
    </div>
  );
}
