import { ProductField } from "@/app/lib/definitions";
import React, { useEffect, useState } from "react";
import { WarpDhotieRow } from '@/app/lib/types';
import { formatDateToLocal } from "@/app/lib/utils";
import { Button } from "../button";

interface ProductsProps {
  warpDetails: any,
  invProducts: any;
  setInvProducts: React.Dispatch<React.SetStateAction<WarpDhotieRow[]>>;
}

export default function ProductForm({ warpDetails, invProducts, setInvProducts }: ProductsProps) {
  const [selectedProducts, setSelectedProducts] = useState<WarpDhotieRow[]>(
    [{ pId: 0, dc: "", date: "", weight: '', piece: 0, count: 0, color: warpDetails?.Color || "" }]
  );

  useEffect(() => {
    let formProducts: any = []
    let pId = 0
    invProducts.forEach((row: any, rowIndex: number) => {
      formProducts.push(
        {
          pId: rowIndex,
          dc: row.Dc,
          date: formatDateToLocal(row.Date),
          piece: row.Piece,
          count: row.Count,
          color: row.Color,
          weight: row.Weight,
        }
      )
      pId = rowIndex + 1
    });
    // formProducts.push({ pId: pId, dc: "", date: "", piece: 0, count: 0, color: warpDetails?.Color || "" })
    setSelectedProducts(formProducts)
  }, [invProducts?.length])

  const handleChange = (
    pId: number,
    field: keyof WarpDhotieRow,
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
      { pId: rowIndex, dc: "", date: "", weight: "", piece: 0, count: 0, color: warpDetails?.Color || "" },
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

  const totalPiece = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => sum + row.piece,
    0
  );

  const totalDhoties = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => sum + row.count,
    0
  );

  const totalWeight = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => sum + parseFloat(row.weight || "0"),
    0
  );

  useEffect(() => {
    setInvProducts(selectedProducts);
  }, [selectedProducts, setInvProducts]);

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Add DC</h2>

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
              placeholder="date"
            />

            {/* Dc */}
            <input
              type="text"
              value={row.dc || ""}
              onChange={(e) =>
                handleChange(rowIndex, "dc", Number(e.target.value))
              }
              className="border p-2 rounded"
              placeholder="DC No"
            />

            {/* piece */}
            <input
              type="text"
              value={row.piece || ""}
              onChange={(e) =>
                handleChange(rowIndex, "piece", Number(e.target.value))
              }
              className="border p-2 rounded"
              placeholder="Piece"
            />

            {/* Count */}
            <input
              type="text"
              value={row.count || ""}
              onChange={(e) =>
                handleChange(rowIndex, "count", Number(e.target.value))
              }
              className="border p-2 rounded"
              placeholder="Count"
            />

            {/* weight */}
            <input
              type="text"
              value={row.weight || ""}
              onChange={(e) =>
                handleChange(rowIndex, "weight", e.target.value)
              }
              className="border p-2 rounded"
              placeholder="weight"
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
      <Button type="button" color={'blue'} onClick={(e) => addProduct(e, selectedProducts?.length)}>+ Add Dc</Button>


      {/* Total */}
      <div className="flex">
        <div className="mt-4 font-bold text-lg pr-8">
          Piece: ₹{totalPiece?.toFixed(2)}
        </div>
        <div className="mt-4 font-bold text-lg pr-8">
          Dhoties: ₹{totalDhoties?.toFixed(2)}
        </div>
        <div className="mt-4 font-bold text-lg">
          Weight: ₹{totalWeight?.toFixed(3)}
        </div>
      </div>
    </div>
  );
}
