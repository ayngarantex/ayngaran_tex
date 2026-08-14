'use client'
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateNew, formatDateToLocalNew } from '@/app/lib/utils';
import { updateWarpSummary } from '@/app/api/node/warp';

export default function EditForm({
  summaryDetails,
}: {
  summaryDetails: any;
}) {
  const router = useRouter();
  const [summaryProducts, setSummaryProducts] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setSummaryProducts(summaryDetails.warp_summary_details || []);
    setIsCompleted(!!summaryDetails.IsCompleted);
  }, [summaryDetails]);

  const handleSubmit = async () => {
    let filteredProducts: any = [];
    if (summaryProducts?.length) {
      summaryProducts.forEach((row: any) => {
        if (row.Date) {
          filteredProducts.push({
            DcId: row.DcId ? String(row.DcId) : undefined,
            Dc: Number(row.Dc || 0),
            Date: formatDateToLocalNew(row.Date),
            Piece: Number(row.Piece || 0),
            Count: String(row.Count || ""),
            Weight: String(row.Weight || "")
          });
        }
      });
    }
    const summaryData = {
      SizingId: Number(summaryDetails.SizingId),
      LoomId: Number(summaryDetails.LoomId),
      IsCompleted: isCompleted ? 1 : 0,
      warp_summary_details: filteredProducts
    };

    const res = await updateWarpSummary(summaryData);

    if (res) {
      router.push('/admin/warp');
    }
  };

  const totalWarps = summaryDetails?.warp_detail?.length;

  const totalMeters = summaryDetails?.warp_detail?.length && summaryDetails?.warp_detail.reduce(
    (sum: any, row: any) => sum + Number(row.Meters),
    0
  );

  const totalWeight = summaryDetails?.warp_detail?.length && summaryDetails?.warp_detail.reduce(
    (sum: any, row: any) => sum + parseFloat(row.Weight || "0"),
    0
  );

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Customer Select */}
        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/6">
            <label htmlFor="color" className="mb-2 block text-sm font-medium">
              Date
            </label>
            <div className="mt-2 rounded-md">
              {summaryDetails?.InvoiceDate && (
                <p className='font-semibold text-lg'>{formatDateNew(summaryDetails?.InvoiceDate)}</p>
              )}
            </div>
          </div>
          <div className="mb-4 w-1/6">
            <label htmlFor="color" className="mb-2 block text-sm font-medium">
              Color
            </label>
            <div className="mt-2 rounded-md">
              <p className='font-semibold text-lg'>{summaryDetails?.Color}</p>
            </div>
          </div>

          {/* <div className="mb-8 w-1/6 ml-8">
            <label htmlFor="invoice meters" className="mb-2 block text-sm font-medium">
              Warp
            </label>
            <div className="mt-2 rounded-md">
              <p className='font-semibold text-lg'>{summaryDetails?.TotalWarps}</p>
            </div>
          </div>

          <div className="mb-8 w-1/6 ml-8">
            <label htmlFor="invoice meters" className="mb-2 block text-sm font-medium">
              Meters
            </label>
            <div className="mt-2 rounded-md">
            <p className='font-semibold text-lg'>{summaryDetails?.TotalMeters}</p>
            </div>
            </div> */}

          {/* <div className="mb-4 w-1/6 ml-8">
            <label htmlFor="weight" className="mb-2 block text-sm font-medium">
              Weight
            </label>
            <div className="mt-2 rounded-md">
              <p className='font-semibold text-lg'>{parseFloat(summaryDetails?.TotalWeight || 0).toFixed(2)}</p>
            </div>
          </div> */}
          <div className="mb-4 w-2/6">
            <label htmlFor="loom" className="mb-2 block text-sm font-medium">
              Loom
            </label>
            <div className="mt-2 rounded-md flex items-center gap-6">
              <p className="font-semibold text-lg">{summaryDetails?.LoomName}</p>
              <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1.5 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700 select-none">Completed</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-4">
          <div className="border rounded-lg mb-4 p-4 w-1/3 bg-white">
            <h1 className={`text-2xl mb-4`}>Warp Details ({totalWarps})</h1>
            <div
              key={`selP0`}
              className="flex gap-3 items-center mb-2 w-full"
            >
              <p className='font-semibold text-lg w-1/3'>Meter <span className='text-blue-600 font-medium'>({(totalMeters || 0).toFixed(2)})</span></p>
              <p className='font-semibold text-lg w-1/3'>Weight <span className='text-blue-600 font-medium'>({(totalWeight || 0).toFixed(2)})</span></p>
            </div>
            {summaryDetails?.warp_detail?.length ?
              summaryDetails?.warp_detail.map((row: any, rowIndex: number) => (
                <div
                  key={`selP_${rowIndex}`}
                  className="flex gap-3 items-center mb-2"
                >

                  {/* Count */}
                  {/* <input
                    type="text"
                    value={row.Color || ""}
                    className="border p-2 rounded w-1/3 bg-gray-50 text-gray-700"
                    readOnly
                  /> */}

                  {/* weight */}
                  <input
                    type="text"
                    value={row.Meters || ""}
                    className="border p-2 rounded w-1/3 bg-gray-50 text-gray-700"
                    readOnly
                  />

                  {/* Color */}
                  <input
                    type="text"
                    value={row.Weight || ""}
                    className="border p-2 rounded w-1/3 bg-gray-50 text-gray-700"
                    readOnly
                  />
                </div>
              ))
              : null}
          </div>

          <PieceReceivedDetails
            summaryProducts={summaryProducts}
            setSummaryProducts={setSummaryProducts}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/warp"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit}>Update</Button>
      </div>
    </form>
  );
}

interface PieceReceivedProps {
  summaryProducts: any[];
  setSummaryProducts: React.Dispatch<React.SetStateAction<any[]>>;
}

function PieceReceivedDetails({ summaryProducts, setSummaryProducts }: PieceReceivedProps) {
  const handleChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setSummaryProducts((prev) =>
      prev.map((row, idx) =>
        idx === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addProduct = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSummaryProducts((prev) => [
      ...prev,
      { DcId: undefined, Dc: "", Date: "", Piece: 0, Count: "", Weight: "" },
    ]);
  };

  const removeProduct = (indexToRemove: number) => {
    setSummaryProducts((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const totalPiece = summaryProducts?.length && summaryProducts.reduce(
    (sum, row) => sum + Number(row.Piece || 0),
    0
  );

  const totalDhoties = summaryProducts?.length && summaryProducts.reduce(
    (sum, row) => sum + Number(row.Count || 0),
    0
  );

  const totalWeight = summaryProducts?.length && summaryProducts.reduce(
    (sum, row) => sum + parseFloat(row.Weight || "0"),
    0
  );

  return (
    <div className="p-4 border rounded-lg mb-4 w-2/3 bg-white">
      <h2 className="text-xl font-bold mb-4">Piece Received Details</h2>

      {summaryProducts?.length ? (
        <div className="flex flex-col gap-2 mb-4 w-full">
          <div className="flex gap-3 font-semibold text-sm text-gray-600 mb-1 w-full">
            <span className="w-10">S.No</span>
            <span className="w-[30%]">Date</span>
            <span className="w-[18%]">DC No</span>
            <span className="w-[15%]">Piece</span>
            <span className="w-[15%]">Count</span>
            <span className="w-[15%]">Weight</span>
            <span className="w-16"></span>
          </div>

          {summaryProducts.map((row, rowIndex: number) => (
            <div
              key={`summary_row_${rowIndex}`}
              className="flex gap-3 items-center w-full"
            >
              <p className="w-10 text-center font-medium">{rowIndex + 1}</p>

              {/* Date */}
              <input
                type="date"
                value={row.Date ? formatDateToLocalNew(row.Date) : ""}
                onChange={(e) =>
                  handleChange(rowIndex, "Date", e.target.value)
                }
                className="border p-2 rounded w-[30%] text-sm"
              />

              {/* Dc */}
              <input
                type="text"
                value={row.Dc || ""}
                onChange={(e) =>
                  handleChange(rowIndex, "Dc", e.target.value)
                }
                className="border p-2 rounded w-[18%] text-sm"
                placeholder="DC"
              />

              {/* piece */}
              <input
                type="number"
                value={row.Piece || ''}
                onChange={(e) =>
                  handleChange(rowIndex, "Piece", Number(e.target.value))
                }
                className="border p-2 rounded w-[15%] text-sm"
                placeholder="Piece"
              />

              {/* Count */}
              <input
                type="text"
                value={row.Count || ""}
                onChange={(e) =>
                  handleChange(rowIndex, "Count", e.target.value)
                }
                className="border p-2 rounded w-[15%] text-sm"
                placeholder="Count"
              />

              {/* weight */}
              <input
                type="text"
                value={row.Weight || ""}
                onChange={(e) =>
                  handleChange(rowIndex, "Weight", e.target.value)
                }
                className="border p-2 rounded w-[15%] text-sm"
                placeholder="Wt"
              />{((Number(row.Weight) / Number(row.Count)).toFixed(3))}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeProduct(rowIndex)}
                className="text-red-500 hover:text-red-700 text-sm underline w-16 text-left"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-4">No pieces received records added yet.</p>
      )}

      {/* Add Product Button */}
      <Button
        type="button"
        onClick={addProduct}
      >
        + Add Row
      </Button>

      {/* Total */}
      <div className="flex border-t mt-4 pt-4">
        <div className="mt-2 font-bold text-sm pr-8">
          Piece: {totalPiece || 0}
        </div>
        <div className="mt-2 font-bold text-sm pr-8">
          Dhoties: {totalDhoties || 0}
        </div>
        <div className="mt-2 font-bold text-sm">
          Weight: {(totalWeight || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
