import React from "react";
import { Button } from "../button";

export interface PurchaseProductRow {
  pId: number;
  itemName: string;
  quantity: number;
  price: number;
  quantityType: string;
}

interface ProductFormProps {
  products: PurchaseProductRow[];
  setProductsList: React.Dispatch<React.SetStateAction<PurchaseProductRow[]>>;
}

export default function ProductForm({ products, setProductsList }: ProductFormProps) {
  const handleChange = (
    pId: number,
    field: keyof PurchaseProductRow,
    value: string | number
  ) => {
    setProductsList((prev) =>
      prev.map((row) =>
        row.pId === pId ? { ...row, [field]: value } : row
      )
    );
  };

  const addProduct = (e: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    e.preventDefault();
    setProductsList((prev) => [
      ...prev,
      { pId: rowIndex, itemName: "", quantity: 0, price: 0, quantityType: "pcs" },
    ]);
  };

  const removeProduct = (rowIndex: number) => {
    setProductsList((prev) => {
      const prodcts = prev.filter((row) => row.pId !== rowIndex);
      return prodcts.map((row, index) => ({
        ...row,
        pId: index,
      }));
    });
  };

  const totalAmount = products?.length
    ? products.reduce((sum, row) => sum + row.quantity * row.price, 0)
    : 0;

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Add Products</h2>

      {products?.length ? (
        products.map((row, rowIndex: number) => (
          <div
            key={`selP_${rowIndex}`}
            className="flex gap-3 items-center mb-2"
          >
            <p className="w-16">{rowIndex + 1}</p>

            {/* Item Name */}
            <input
              type="text"
              value={row.itemName || ""}
              onChange={(e) => handleChange(rowIndex, "itemName", e.target.value)}
              className="border p-2 rounded w-[300px]"
              placeholder="Item Name (e.g. Dhoti 10x10, Box, Label)"
              required
            />

            {/* Quantity */}
            <input
              type="text"
              value={row.quantity || ""}
              onChange={(e) => handleChange(rowIndex, "quantity", parseFloat(e.target.value) || 0)}
              className="border p-2 rounded"
              placeholder="Qty"
              required
            />

            {/* Quantity Type */}
            <select
              value={row.quantityType || "pcs"}
              onChange={(e) => handleChange(rowIndex, "quantityType", e.target.value)}
              className="border p-2 rounded col-span-1"
            >
              <option value="pcs">pcs</option>
              <option value="bags">bags</option>
              <option value="kg">kg</option>
              <option value="meters">meters</option>
              <option value="box">box</option>
            </select>

            {/* Price */}
            <input
              type="text"
              value={row.price || ""}
              onChange={(e) => handleChange(rowIndex, "price", parseFloat(e.target.value) || 0)}
              className="border p-2 rounded"
              placeholder="Price"
              required
            />

            {/* Amount */}
            <div className="font-semibold w-32">
              ₹{(row.quantity * row.price).toFixed(2) || 0}
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
      ) : null}

      <div className="flex justify-between">
        <Button
          type="button"
          color={'blue'}
          onClick={(e) => addProduct(e, products?.length)}
        >
          + Add Product
        </Button>

        <div className="mt-4 font-bold text-lg">
          Total: ₹{totalAmount?.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
