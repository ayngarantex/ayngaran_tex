'use client'
import { WarpDhotieRow } from '@/app/lib/types';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useState, useEffect, useMemo } from 'react';
import WarpProductForm from './products-form';
import { useRouter } from 'next/navigation';
import { formatDateToLocalNew } from '@/app/lib/utils';
import { updateWarp } from '@/app/api/node/warp';
export default function EditForm({
  warpDetails,
  looms
}: {
  warpDetails: any;
  looms: any;
}) {
  const router = useRouter();
  const [loomId, setLoomId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loomNumber, setLoomNumber] = useState("")
  const [invProducts, setInvProducts] = useState<WarpDhotieRow[]>([]);

  // Pre-fill state from invoice data
  useEffect(() => {
    setLoomId(warpDetails?.LoomId);
    setLoomNumber(warpDetails?.LoomNumber);
    if (warpDetails?.StartDate) {
      setStartDate(formatDateToLocalNew(warpDetails.StartDate))
    }
    if (warpDetails?.CompletedDate) {
      setEndDate(formatDateToLocalNew(warpDetails.CompletedDate))
    }

    setInvProducts(warpDetails.warp_dc_details || []);
  }, [warpDetails]);

  const invoiceProductData = useMemo(() => {
    return warpDetails?.warp_dc_details ?? [];
  }, [warpDetails?.warp_dc_details]);

  const handleSubmit = async () => {

    let filteredProduct: any = []
    if (invProducts?.length) {
      invProducts.forEach((row: any) => {
        if (row.date && row.dc) {
          filteredProduct.push(row)
        }
      })

      filteredProduct = filteredProduct.map(({ pId: any, ...rest }: any) => rest)
    }

    const warpData = {
      WarpId: warpDetails.WarpId,
      LoomId: loomId,
      LoomNumber: loomNumber,
      StartDate: startDate,
      EndDate: endDate,
      warp_dc_details: filteredProduct
    };

    const res = await updateWarp(warpData);

    if (res) {
      router.push('/admin/warp');
    }
  };

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Customer Select */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-4 w-full">
            <label htmlFor="color" className="mb-2 block text-sm font-medium">
              Color
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="color"
                  name="color"
                  type="text"
                  value={warpDetails?.Color || ""}
                  placeholder="Enter color"
                  className="peer block w-full rounded-md bg-blue-200 bg-blue-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="mb-8 w-full">
            <label htmlFor="invoice meters" className="mb-2 block text-sm font-medium">
              Meters
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="meters"
                  name="meters"
                  type="meters"
                  placeholder="meters"
                  className="peer block w-full rounded-md bg-blue-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  value={warpDetails?.Meters}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="mb-4 w-full">
            <label htmlFor="weight" className="mb-2 block text-sm font-medium">
              Weight
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="weight"
                  name="weight"
                  type="text"
                  value={warpDetails?.Weight || ''}
                  placeholder="Enter weight"
                  className="peer block w-full rounded-md bg-blue-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-8 w-full">
            <label htmlFor="invoice date" className="mb-2 block text-sm font-medium">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate || ""}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="border p-2 rounded"
                placeholder="date"
              />
            </div>
          </div>
          <div className="mb-8 w-full">
            <label htmlFor="invoice date" className="mb-2 block text-sm font-medium">
              Completed Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate || ""}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="border p-2 rounded"
                placeholder="date"
              />
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-8 w-full">
            <label htmlFor="invoice date" className="mb-2 block text-sm font-medium">
              Loom
            </label>
            <div className="relative">
              <select
                id="customer"
                name="customerId"
                onChange={(e) => {
                  setLoomId(e.target.value)
                }}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                value={loomId || ""}
              >
                <option value="" disabled>
                  Select a loom
                </option>
                {looms.map((row: any) => (
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
          <div className="mb-8 w-full">
            <label htmlFor="loom number" className="mb-2 block text-sm font-medium">
              Loom Number
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="loom number"
                  name="loom number"
                  type="text"
                  placeholder="loom number"
                  className="peer block w-full rounded-md py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  value={loomNumber || ""}
                  onChange={(e) => {
                    setLoomNumber(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <WarpProductForm
          warpDetails={warpDetails}
          invProducts={invoiceProductData}
          setInvProducts={setInvProducts}
        />

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/warp"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit}>Update Invoice</Button>
      </div>
    </form>
  );
}
