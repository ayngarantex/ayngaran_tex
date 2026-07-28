import React, { useEffect, useState } from "react";
import { SizingRow } from '@/app/lib/types';
import { Button } from "../button";
import { UserCircleIcon } from "@heroicons/react/24/outline";

interface ProductsProps {
  invProducts: any;
  setInvProducts: React.Dispatch<React.SetStateAction<SizingRow[]>>;
  looms: any;
}


export default function WarpForm({ invProducts, setInvProducts, looms }: ProductsProps) {
  const [selectedProducts, setSelectedProducts] = useState<SizingRow[]>(
    [{ pId: 0, warpId: 0, meters: 0, color: "", date: "", weight: 0, loomId: 0 }]
  );

  useEffect(() => {
    let formProducts = []
    let pId = 0

    invProducts.forEach((row: any, rowIndex: number) => {
      formProducts.push(
        {
          pId: rowIndex,
          warpId: row.WarpId,
          meters: row.Meters,
          color: row.Color,
          date: row.DeliveredDate ? new Date(row.DeliveredDate).toISOString().split('T')[0] : "",
          weight: row.Weight,
          loomId: row.LoomId
        }
      )
      pId = rowIndex + 1
    });
    formProducts.push({ pId: pId, warpId: 0, meters: 0, color: "", date: "", weight: 0, loomId: 0 })
    setSelectedProducts(formProducts)
  }, [invProducts?.length])

  const handleChange = (
    pId: number,
    field: keyof SizingRow,
    value: string | number
  ) => {
    setSelectedProducts((prev) =>
      prev.map((row) =>
        row.pId === pId ? { ...row, [field]: value } : row
      )
    );
  };

  const addProduct = (e: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    e.preventDefault();
    setSelectedProducts((prev) => [
      ...prev,
      { pId: rowIndex, warpId: 0, meters: 0, color: "", date: "", weight: 0, loomId: 0 },
    ]);
  };

  const removeProduct = (rowIndex: number) => {
    let prodcts = selectedProducts.filter((row) => row.pId !== rowIndex);
    let withUpdatedId: any = []
    prodcts.forEach((row, index) => {
      row.pId = index
      withUpdatedId.push(row)
    })
    setSelectedProducts(withUpdatedId);
  };

  const totalMeters = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => sum + row.meters,
    0
  );

  const totalWeight = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => Math.round((sum + parseFloat(row.weight)) * 100) / 100,
    0
  );

  useEffect(() => {
    setInvProducts(selectedProducts);
  }, [selectedProducts, setInvProducts]);

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Add Warp</h2>

      {selectedProducts?.length ?
        selectedProducts.map((row, rowIndex: number) => (
          <div
            key={`selP_${rowIndex}`}
            className="flex gap-3 items-center mb-2"
          >
            <p className="w-16">{rowIndex + 1}</p>

            {/* Date */}
            <input
              type="date"
              value={row.date || ""}
              onChange={(e) =>
                handleChange(rowIndex, "date", e.target.value)
              }
              className="border p-2 rounded"
              placeholder="Date"
            />

            {/* Color */}
            <input
              type="text"
              value={row.color || ""}
              onChange={(e) =>
                handleChange(rowIndex, "color", e.target.value)
              }
              className="border p-2 rounded"
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
              className="border p-2 rounded"
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
              className="border p-2 rounded"
              placeholder="Weight"
            />

            <div className="relative">
              <select
                id="loom"
                name="loomId"
                onChange={(e) => {
                  handleChange(rowIndex, "loomId", parseInt(e.target.value))
                }}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                value={row.loomId}
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

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeProduct(rowIndex)}
              className="text-red-500 text-sm underline"
            >
              Remove
            </button>
          </div>
        ))
        : null}

      {/* Add Product Button */}
      <Button type="button" color={'blue'} onClick={(e) => addProduct(e, selectedProducts?.length)}>+ Add Warp</Button>

      <div className="flex">
        {/* Meters */}
        <div className="mt-4 font-bold text-lg pr-5">
          Meters: ₹{totalMeters?.toFixed(2)}
        </div>

        {/* Meters */}
        <div className="mt-4 font-bold text-lg pr-5">
          Weight: ₹{totalWeight}
        </div>
      </div>
    </div>
  );
}
