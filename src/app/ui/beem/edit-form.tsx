'use client'
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { formatDateToLocal, loomsList } from '@/app/lib/utils';
import { LoomField } from '@/app/lib/definitions';
export default function EditForm({
  looms,
  beemDetails,
  beemDetailsByLoomId
}: {
  looms: LoomField[];
  beemDetails: any,
  beemDetailsByLoomId: any
}) {
  const [selectedLoom, setSelectedLoom] = useState<LoomField | undefined>(undefined);
  const [selectedBeem, setSelectedBeem] = useState<any>(undefined);
  const [selectedLoomId, setSelectedLoomId] = useState<number | string>("");
  const [loadedBeem, setLoadedBeem] = useState<number | string>("");
  const [runningBeem, setRunningBeem] = useState<number | string>("");
  const [emptyBeem, setEmptyBeem] = useState<number | string>("");
  const [returnBeem, setReturnBeem] = useState<number | string>("");
  const [totalBeem, setTotalBeem] = useState<number | string>("");
  const [date, setDate] = useState<number | string>("");
  const [loading, setLoading] = useState(false)

  // Pre-fill state from invoice data
  useEffect(() => {
    const selected = beemDetails?.[0]

    setSelectedBeem(selected);
    setSelectedLoom(beemDetails);
    setSelectedLoomId(beemDetails?.LoomId)
    setDate(beemDetails?.Date ? formatDateToLocal(beemDetails?.Date) : "")
    setLoadedBeem(beemDetails?.Loaded);
    setRunningBeem(beemDetails?.Running);
    setEmptyBeem(beemDetails?.Empty);
    setReturnBeem(beemDetails?.Return)
    const total = (beemDetails?.Loaded ? Number(beemDetails?.Loaded) : 0) + (beemDetails?.Running ? Number(beemDetails?.Running) : 0) + (beemDetails?.Empty ? Number(beemDetails?.Empty) : 0);
    setTotalBeem(total);
  }, [beemDetails]);

  const handleSubmit = async () => {
    setLoading(true)
    const loomData = {
      BeemId: beemDetails?.BeemId,
      LoomId: beemDetails?.LoomId,
      Loaded: loadedBeem,
      Running: runningBeem,
      Empty: emptyBeem,
      Count: totalBeem,
      Return: returnBeem,
      Date: date
    };

    if (!date || !selectedLoom?.LoomId) {
      setLoading(false)
      alert("Please select a date and loom")
      return
    }

    const jsonBody = JSON.stringify({
      loomData
    });

    const res = await fetch('/api/beem', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonBody,
    });

    const data = await res.json();
    if (data?.BeemId) {
      redirect('/admin/beem');
    }
  };

  useEffect(() => {
    const total = (loadedBeem ? Number(loadedBeem) : 0) + (runningBeem ? Number(runningBeem) : 0) + (emptyBeem ? Number(emptyBeem) : 0);
    setTotalBeem(total);

  }, [loadedBeem, runningBeem, emptyBeem])

  return (
    <>
      <form>
        <div className="rounded-md bg-blue-50 p-4 md:p-6">
          {/* Loom Select */}
          <div className='flex flex-wrap'>
            <div className="mb-4 w-1/4">
              <label htmlFor="loomId" className="mb-2 block text-sm font-medium">
                Loom
              </label>
              <div className="relative">
                <select
                  id="loomId"
                  name="loomId"
                  onChange={(e) => {
                    const selected = looms.find(
                      (loom: any) => loom.LoomId.toString() === e.target.value
                    );
                    setSelectedLoom(selected)
                    setSelectedLoomId(e.target.value)
                  }}
                  className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  value={selectedLoomId}
                >
                  <option value="">
                    Select a Loom
                  </option>
                  {looms?.map((row: any) => (
                    <option
                      key={row.LoomId}
                      value={row.LoomId}
                    >
                      {row.LoomName}
                    </option>
                  ))}
                </select>
                <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div className="mb-4 w-1/4 ml-8">
              <label htmlFor="address" className="mb-2 block text-sm font-medium">
                No. Loom
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    type="text"
                    id="count"
                    name="count"
                    readOnly={true}
                    value={selectedLoom?.Count || ""}
                    className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
                  />
                </div>
              </div>
            </div>
            <div className="mb-4 w-1/4 ml-8">
              <label htmlFor="invoice date" className="mb-2 block text-sm font-medium">
                Date
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="date"
                    name="date"
                    type="date"
                    placeholder="Date"
                    className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-wrap pt-8'>
            {/* Invoice Number */}
            <div className="mb-4 w-1/4">
              <label htmlFor="loaded" className="mb-2 block text-sm font-medium">
                New Beem
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    type="number"
                    id="loaded"
                    name="loaded"
                    placeholder='Enter Loaded Beem'
                    // disabled={type !== "Loaded" && type !== 'New'}
                    value={loadedBeem}
                    onChange={(e) => {
                      setLoadedBeem(e.target.value)
                    }}
                    className={`peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500`}
                  // ${type !== "Loaded" && type !== 'New' ? 'bg-blue-100' : ""}
                  />
                </div>
              </div>
            </div>
            <div className="mb-4 w-1/4 pl-8">
              <label htmlFor="running" className="mb-2 block text-sm font-medium">
                Running Beem
              </label>
              <div className="relative mt-2 rounded-md">
                <input
                  id="running"
                  name="running"
                  type="number"
                  value={runningBeem}
                  onChange={(e) => {
                    setRunningBeem(e.target.value)
                  }}
                  // disabled={type !== "Running" && type !== 'New'}
                  placeholder="Enter Running Beem"
                  className={`peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500`}
                // ${type !== "Running" && type !== 'New' ? 'bg-blue-100' : ""}
                />
              </div>
            </div>
            <div className="mb-4 w-1/4 pl-8">
              <label htmlFor="empty" className="mb-2 block text-sm font-medium">
                Empty Beem
              </label>
              <div className="relative mt-2 rounded-md">
                <input
                  id="empty"
                  name="empty"
                  type="number"
                  value={emptyBeem}
                  onChange={(e) => {
                    setEmptyBeem(e.target.value)
                  }}
                  // disabled={type !== "Return" && type !== 'New'}
                  placeholder="Enter Empty Beem"
                  className={`peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500`}
                //${type !== "Empty" && type !== "Return" && type !== 'New' ? 'bg-blue-100' : ""}
                />
              </div>
            </div>
            <div className="mb-4 w-1/4 pl-8">
              <label htmlFor="empty" className="mb-2 block text-sm font-medium">
                Return Beem
              </label>
              <div className="relative mt-2 rounded-md">
                <input
                  id="return"
                  name="return"
                  type="number"
                  value={returnBeem}
                  onChange={(e) => {
                    setReturnBeem(e.target.value)
                  }}
                  // disabled={type !== "Return" && type !== 'New'}
                  placeholder="Enter Return Beem"
                  className={`peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500`}
                //${type !== "Empty" && type !== "Return" && type !== 'New' ? 'bg-blue-100' : ""}
                />
              </div>
            </div>
            <div className="mb-4 w-1/4 pt-8">
              <label htmlFor="empty" className="mb-2 block text-sm font-medium">
                Total Beem in Hand
              </label>
              <div className="relative mt-2 rounded-md text-2xl font-bold"> {totalBeem}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/admin/beem"
            className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
          >
            Cancel
          </Link>
          <Button type="button" onClick={handleSubmit}>Update</Button>
        </div>

      </form>
    </>
  );
}
