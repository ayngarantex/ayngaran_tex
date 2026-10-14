import React, { useEffect, useState } from "react";
import { SizingRow } from '@/app/lib/types';
import { Button } from "../button";
import { UserCircleIcon, CurrencyRupeeIcon } from "@heroicons/react/24/outline";
import { formatDateToLocalNew } from "@/app/lib/utils";

interface ProductsProps {
  warpDetails: any;
  setWarpDetails: React.Dispatch<React.SetStateAction<SizingRow[]>>;
  looms: any;
}

export default function WarpForm({ warpDetails, setWarpDetails, looms }: ProductsProps) {
  const [selectedProducts, setSelectedProducts] = useState<SizingRow[]>(
    [{ pId: 0, warpId: 0, meters: 0, color: "", date: "", weight: 0, loomId: 0, wageRate: 0 }]
  );

  useEffect(() => {
    let formProducts: SizingRow[] = [];
    let pId = 0;

    if (warpDetails && warpDetails.length > 0) {
      warpDetails.forEach((row: any, rowIndex: number) => {
        formProducts.push({
          pId: rowIndex,
          warpId: row.WarpId || row.warpId || 0,
          meters: row.Meters || row.meters || 0,
          color: row.Color || row.color || "",
          date: row.DeliveredDate ? formatDateToLocalNew(row.DeliveredDate) : (row.date || ""),
          weight: row.Weight || row.weight || 0,
          loomId: row.LoomId || row.loomId || 0,
          wageRate: row.WageRate !== undefined ? Number(row.WageRate) : (row.wageRate ? Number(row.wageRate) : 0)
        });
        pId = rowIndex + 1;
      });
      formProducts.push({ pId: pId, warpId: 0, meters: 0, color: "", date: "", weight: 0, loomId: 0, wageRate: 0 });
      setSelectedProducts(formProducts);
    }
  }, [warpDetails?.length]);

  const handleChange = (
    pId: number,
    field: keyof SizingRow,
    value: string | number
  ) => {
    setSelectedProducts((prev) =>
      prev.map((row) => {
        if (row.pId === pId) {
          const updated = { ...row, [field]: value };
          // Auto fill default loom wage rate if loomId changes and wageRate is 0 or empty
          if (field === 'loomId' && Number(value) > 0) {
            const selectedLoom = looms?.find((l: any) => Number(l.LoomId) === Number(value));
            if (selectedLoom && selectedLoom.WageRate && (!row.wageRate || row.wageRate === 0)) {
              updated.wageRate = Number(selectedLoom.WageRate);
            }
          }
          return updated;
        }
        return row;
      })
    );
  };

  const addProduct = (e: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    e.preventDefault();
    setSelectedProducts((prev) => [
      ...prev,
      { pId: rowIndex, warpId: 0, meters: 0, color: "", date: "", weight: 0, loomId: 0, wageRate: 0 },
    ]);
  };

  const removeProduct = (rowIndex: number) => {
    let prodcts = selectedProducts.filter((row) => row.pId !== rowIndex);
    let withUpdatedId: SizingRow[] = [];
    prodcts.forEach((row, index) => {
      row.pId = index;
      withUpdatedId.push(row);
    });
    setSelectedProducts(withUpdatedId);
  };

  const totalMeters = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => sum + (Number(row.meters) || 0),
    0
  );

  const totalWeight = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => Math.round((sum + parseFloat(String(row.weight || 0))) * 100) / 100,
    0
  );

  useEffect(() => {
    setWarpDetails(selectedProducts);
  }, [selectedProducts, setWarpDetails]);

  return (
    <div className="p-4 border rounded-lg mt-4 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Add Warp & Wages</h2>

      {selectedProducts?.length ?
        selectedProducts.map((row, rowIndex: number) => (
          <div
            key={`selP_${rowIndex}`}
            className="flex flex-wrap md:flex-nowrap gap-3 items-center mb-3 p-2 border border-gray-100 rounded-lg bg-gray-50/50"
          >
            <p className="w-8 font-bold text-gray-500 text-center">{rowIndex + 1}</p>

            {/* Date */}
            <input
              type="date"
              value={row.date || ""}
              onChange={(e) =>
                handleChange(rowIndex, "date", e.target.value)
              }
              className="border p-2 rounded text-sm w-36"
              placeholder="Date"
            />

            {/* Color */}
            <input
              type="text"
              value={row.color || ""}
              onChange={(e) =>
                handleChange(rowIndex, "color", e.target.value)
              }
              className="border p-2 rounded text-sm flex-1 min-w-[100px]"
              placeholder="Color"
            />

            {/* Meters */}
            <input
              type="number"
              step="any"
              value={row.meters || ""}
              onChange={(e) =>
                handleChange(rowIndex, "meters", Number(e.target.value))
              }
              className="border p-2 rounded text-sm w-28"
              placeholder="Meters"
            />

            {/* Weight */}
            <input
              type="number"
              step="any"
              value={row.weight || ""}
              onChange={(e) =>
                handleChange(rowIndex, "weight", e.target.value)
              }
              className="border p-2 rounded text-sm w-28"
              placeholder="Weight"
            />

            {/* Loom Select */}
            <div className="relative w-44">
              <select
                id="loom"
                name="loomId"
                onChange={(e) => {
                  handleChange(rowIndex, "loomId", parseInt(e.target.value))
                }}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-9 pr-2 text-sm outline-2 placeholder:text-gray-500 bg-white"
                value={row.loomId || ''}
              >
                <option value="">
                  Select a Loom
                </option>
                {looms?.map((l: any) => (
                  <option
                    key={l.LoomId}
                    value={l.LoomId}
                  >
                    {l.LoomName}
                  </option>
                ))}
              </select>
              <UserCircleIcon className="pointer-events-none absolute left-2.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>

            {/* Wages Per Dhoti Field */}
            <div className="relative w-36" title="Wages per Dhoti for this Warp">
              <input
                type="number"
                step="0.01"
                value={row.wageRate !== undefined && row.wageRate !== 0 ? row.wageRate : ''}
                onChange={(e) =>
                  handleChange(rowIndex, "wageRate", Number(e.target.value))
                }
                className="border border-indigo-200 p-2 pl-8 rounded text-sm font-semibold text-indigo-900 w-full focus:border-indigo-500 outline-none"
                placeholder="Wages/Dhoti"
              />
              <CurrencyRupeeIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeProduct(rowIndex)}
              className="text-red-500 text-xs font-bold underline px-2"
            >
              Remove
            </button>
          </div>
        ))
        : null}

      {/* Add Product Button */}
      <div className="mt-3">
        <Button type="button" color={'blue'} onClick={(e) => addProduct(e, selectedProducts?.length)}>+ Add Warp</Button>
      </div>

      <div className="flex gap-6 mt-4 pt-3 border-t border-gray-200">
        <div className="font-bold text-sm text-gray-700">
          Total Meters: <span className="text-blue-700">{totalMeters?.toFixed(2)} m</span>
        </div>

        <div className="font-bold text-sm text-gray-700">
          Total Weight: <span className="text-blue-700">{totalWeight} kg</span>
        </div>
      </div>
    </div>
  );
}
