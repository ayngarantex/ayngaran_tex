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
  console.log("summaryDetails", summaryDetails)
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
            WarpId: row.WarpId ? Number(row.WarpId) : null,
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
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-4 w-full">
            <label htmlFor="color" className="mb-2 block text-sm font-medium">
              Date
            </label>
            <div className="mt-2 rounded-md">
              {summaryDetails?.InvoiceDate && (
                <p className='font-semibold text-lg'>{formatDateNew(summaryDetails?.InvoiceDate)}</p>
              )}
            </div>
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="color" className="mb-2 block text-sm font-medium">
              Color
            </label>
            <div className="mt-2 rounded-md">
              <p className='font-semibold text-lg'>{summaryDetails?.Color}</p>
            </div>
          </div>

          <div className="mb-4 w-2/6">
            <label htmlFor="loom" className="mb-2 block text-sm font-medium">
              Loom
            </label>
            <div className="mt-2 rounded-md flex items-center gap-6">
              <p className="font-semibold text-lg whitespace-nowrap">{summaryDetails?.LoomName}</p>
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
              <div className='flex flex-col w-1/2'>
                <p className='font-semibold text-lg w-full'>
                  Meter
                  <span className='ml-2 text-blue-600 font-medium mr-1'>({(totalMeters || 0).toFixed(2)})</span>
                </p>
                <p className='font-semibold text-lg w-full my-2'>
                  Dhoties
                  <span className='ml-2 text-blue-600 font-medium'>({(summaryDetails.LoomId === 11 || summaryDetails.LoomId === 33) ? Math.floor((totalMeters || 0) / 1.89) : Math.floor((totalMeters || 0) / 1.93)})</span>
                </p>
              </div>
              <p className='font-semibold text-lg w-1/2'>Weight <span className='ml-2 text-blue-600 font-medium'>({(totalWeight || 0).toFixed(2)})</span></p>
            </div>
            {summaryDetails?.warp_detail?.length ?
              summaryDetails?.warp_detail.map((row: any, rowIndex: number) => {
                const warpReceivedDhoties = summaryProducts
                  .filter((p: any) => String(p.WarpId) === String(row.WarpId))
                  .reduce((sum: number, p: any) => sum + Number(p.Count || 0), 0);

                return (
                  <div
                    key={`selP_${rowIndex}`}
                    className="flex flex-col mb-3 p-2 bg-gray-50 rounded border text-sm"
                  >
                    <div className="flex font-medium text-gray-800 mb-1">
                      <span>Warp #{rowIndex + 1} (ID: {row.WarpId})</span>
                      {warpReceivedDhoties > 0 && (
                        <span className="text-blue-600 font-bold ml-2">Tot: ({(summaryDetails.LoomId === 11 || summaryDetails.LoomId === 33) ? Math.floor((row.Meters || 0) / 1.89) : Math.floor((row.Meters || 0) / 1.93)}) dhoties</span>
                      )}
                    </div>
                    <div className="flex justify-between font-medium text-gray-800 mb-1">
                      {warpReceivedDhoties > 0 && (
                        <>
                          <span className="text-blue-600 font-bold">Rcvd: {warpReceivedDhoties} dhoties</span>
                          <span className="text-red-600 font-bold">Diff: {(summaryDetails.LoomId === 11 || summaryDetails.LoomId === 33) ? Math.floor((row.Meters || 0) / 1.89) - warpReceivedDhoties : Math.floor((row.Meters || 0) / 1.93) - warpReceivedDhoties} dhoties</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/2 text-gray-600">Meter: <span className="font-semibold text-gray-900">{row.Meters || 0}</span></div>
                      <div className="w-1/2 text-gray-600">Weight: <span className="font-semibold text-gray-900">{row.Weight || 0}</span></div>
                    </div>
                  </div>
                );
              })
              : null}
          </div>

          <PieceReceivedDetails
            summaryDetails={summaryDetails}
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
  summaryDetails: any;
  summaryProducts: any[];
  setSummaryProducts: React.Dispatch<React.SetStateAction<any[]>>;
}

function PieceReceivedDetails({ summaryDetails, summaryProducts, setSummaryProducts }: PieceReceivedProps) {
  const handleChange = (
    index: number,
    field: string,
    value: string | number | null
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
      { DcId: undefined, WarpId: null, Dc: "", Date: "", Piece: 0, Count: "", Weight: "" },
    ]);
  };

  const autoFillWarps = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const warps = summaryDetails?.warp_detail || [];
    if (!warps.length) return;
    const newRows = warps.map((w: any) => ({
      DcId: undefined,
      WarpId: w.WarpId,
      Dc: "",
      Date: "",
      Piece: 0,
      Count: "",
      Weight: ""
    }));
    setSummaryProducts((prev) => [...prev, ...newRows]);
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

  const warpList = summaryDetails?.warp_detail || [];

  return (
    <div className="p-4 border rounded-lg mb-4 w-2/3 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Piece Received Details</h2>
        {warpList.length > 0 && (
          <button
            type="button"
            onClick={autoFillWarps}
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded border border-blue-200 transition-colors"
          >
            + Add Row For Each Warp ({warpList.length})
          </button>
        )}
      </div>

      {summaryProducts?.length ? (
        <div className="flex flex-col gap-2 mb-4 w-full">
          <div className="flex gap-2 font-semibold text-xs text-gray-600 mb-1 w-full items-center">
            <span className="w-6 text-center">S.No</span>
            <span className="w-[20%]">Warp</span>
            <span className="w-[22%]">Date</span>
            <span className="w-[14%]">DC No</span>
            <span className="w-[12%]">Piece</span>
            <span className="w-[12%]">Count</span>
            <span className="w-[12%]">Weight</span>
            <span className="w-12"></span>
          </div>

          {summaryProducts.map((row, rowIndex: number) => (
            <div
              key={`summary_row_${rowIndex}`}
              className="flex gap-2 items-center w-full"
            >
              <p className="w-6 text-center font-medium text-xs">{rowIndex + 1}</p>

              {/* Warp Selector */}
              <select
                value={row.WarpId || ""}
                onChange={(e) =>
                  handleChange(rowIndex, "WarpId", e.target.value ? Number(e.target.value) : null)
                }
                className="border p-2 rounded w-[20%] text-xs bg-white"
              >
                <option value="">General / Unassigned</option>
                {warpList.map((w: any, wIdx: number) => (
                  <option key={`w_opt_${w.WarpId}`} value={w.WarpId}>
                    Warp #{wIdx + 1}
                  </option>
                ))}
              </select>

              {/* Date */}
              <input
                type="date"
                value={row.Date ? formatDateToLocalNew(row.Date) : ""}
                onChange={(e) =>
                  handleChange(rowIndex, "Date", e.target.value)
                }
                className="border p-2 rounded w-[22%] text-xs"
              />

              {/* Dc */}
              <input
                type="text"
                value={row.Dc || ""}
                onChange={(e) =>
                  handleChange(rowIndex, "Dc", e.target.value)
                }
                className="border p-2 rounded w-[14%] text-xs"
                placeholder="DC"
              />

              {/* piece */}
              <input
                type="number"
                value={row.Piece || ''}
                onChange={(e) =>
                  handleChange(rowIndex, "Piece", Number(e.target.value))
                }
                className="border p-2 rounded w-[12%] text-xs"
                placeholder="Piece"
              />

              {/* Count */}
              <input
                type="text"
                value={row.Count || ""}
                onChange={(e) =>
                  handleChange(rowIndex, "Count", e.target.value)
                }
                className="border p-2 rounded w-[12%] text-xs"
                placeholder="Count"
              />

              {/* weight */}
              <input
                type="text"
                value={row.Weight || ""}
                onChange={(e) =>
                  handleChange(rowIndex, "Weight", e.target.value)
                }
                className="border p-2 rounded w-[12%] text-xs"
                placeholder="Wt"
              /> {((Number(row.Weight) / Number(row.Count)).toFixed(3))}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeProduct(rowIndex)}
                className="text-red-500 hover:text-red-700 text-xs underline w-12 text-left"
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
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={addProduct}
        >
          + Add Row
        </Button>
      </div>

      {/* Total */}
      <div className="flex border-t mt-4 pt-4">
        <div className="mt-2 font-bold text-sm pr-8">
          Piece: {totalPiece || 0}
        </div>
        <div className="mt-2 font-bold text-sm pr-8">
          Dhoties: {totalDhoties || 0}
        </div>
        <div className="mt-2 font-bold text-sm pr-8">
          Meter {totalDhoties ? ((summaryDetails.LoomId === 11 || summaryDetails.LoomId === 33) ? ((totalDhoties || 0) * 1.89) : ((totalDhoties || 0) * 1.93)) : 0}
        </div>
        <div className="mt-2 font-bold text-sm">
          Weight: {(totalWeight || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
