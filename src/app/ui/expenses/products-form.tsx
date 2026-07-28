import React, { useEffect, useState } from "react";
import { ExpensesRow } from '@/app/lib/types';
import { formatDateToLocal, productType } from "@/app/lib/utils";
import { Button } from "../button";

interface ProductsProps {
  invProducts: any;
  setInvProducts: React.Dispatch<React.SetStateAction<ExpensesRow[]>>;
  edit: boolean;
}

export default function ProductForm({ invProducts, setInvProducts, edit = false }: ProductsProps) {
  const [selectedProducts, setSelectedProducts] = useState<ExpensesRow[]>(
    [{ pId: 0, date: "", reason: "", type: "", amount: 0 }]
  );

  useEffect(() => {
    if (invProducts?.length) {
      let formProducts: any = []
      let pId = 0
      invProducts.forEach((row: any, rowIndex: number) => {
        formProducts.push(
          {
            pId: rowIndex,
            date: formatDateToLocal(row.Date),
            reason: row.Reason,
            type: row.Type,
            amount: row.Amount
          }
        )
        pId = rowIndex + 1
      });
      setSelectedProducts(formProducts)
    }
  }, [invProducts?.length])

  const handleChange = (
    pId: number,
    field: keyof ExpensesRow,
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
      { pId: rowIndex, date: "", reason: "", type: "", amount: 0 },
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

  useEffect(() => {
    setInvProducts(selectedProducts);
  }, [selectedProducts, setInvProducts]);

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Add Products</h2>

      {selectedProducts?.length ?
        selectedProducts.map((row, rowIndex: number) => (
          <div
            key={`selP_${rowIndex}`}
            className="flex gap-3 items-center mb-2"
          >
            <p className="w-16">{rowIndex + 1}</p>
            {/* date */}
            <input
              type="date"
              value={row.date || ""}
              onChange={(e) =>
                handleChange(rowIndex, "date", e.target.value)
              }
              className="border p-2 rounded"
              placeholder="Date"
            />

            {/* Quantity */}
            <input
              type="text"
              value={row.reason || ""}
              onChange={(e) =>
                handleChange(rowIndex, "reason", e.target.value)
              }
              className="border p-2 rounded w-100"
              placeholder="Reason"
            />

            {/* Price */}
            <input
              type="text"
              value={row.type || ""}
              onChange={(e) =>
                handleChange(rowIndex, "type", e.target.value)
              }
              className="border p-2 rounded"
              placeholder="Type"
            />

            {/* Price */}
            <input
              type="number"
              step="any"
              value={row.amount || ""}
              onChange={(e) =>
                handleChange(rowIndex, "amount", e.target.value)
              }
              className="border p-2 rounded"
              placeholder="Amount"
            />

            {/* Remove Button */}
            {!edit && (
              <button
                type="button"
                onClick={() => removeProduct(rowIndex)}
                className="text-red-500 text-sm underline"
              >
                Remove
              </button>
            )}
          </div>
        ))
        : null}

      {/* Add Product Button */}
      {!edit ?
        <Button type="button" color={'blue'} onClick={(e) => addProduct(e, selectedProducts?.length)}>+ Add Product</Button>
        : null}
    </div>
  );
}
