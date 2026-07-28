import React, { useEffect, useState } from "react";
import { YarnRow } from '@/app/lib/types';
import { yarnCountList } from "@/app/lib/utils";
import { Button } from "../button";

interface YarnProps {
  yrnProducts: any;
  setYrnProducts: React.Dispatch<React.SetStateAction<YarnRow[]>>;
}

export default function ProductForm({ yrnProducts, setYrnProducts }: YarnProps) {
  const [selectedProducts, setSelectedProducts] = useState<YarnRow[]>(
    [{ pId: 0, count: "", color: "", varient: "", bag: "", quantity: 0, price: "" }]
  );

  useEffect(() => {
    let formProducts: any = []
    let pId = 0
    yrnProducts.forEach((row: any, rowIndex: number) => {
      formProducts.push(
        {
          pId: rowIndex,
          count: row.Count,
          color: row.Color,
          varient: row.Varient,
          bag: row.Bag,
          quantity: row.Quantity,
          price: row.Price
        }
      )
      pId = rowIndex + 1
    });
    if (yrnProducts.length === 0) {
      formProducts.push({ pId: pId, count: "", color: "", varient: "", bag: "", quantity: 0, price: "" })
    }
    setSelectedProducts(formProducts)
  }, [yrnProducts?.length])

  const handleChange = (
    pId: number,
    field: any,
    value: string | number
  ) => {
    if (field === "bag") {
      setSelectedProducts((prev) =>
        prev.map((row) =>
          row.pId === pId ? { ...row, [field]: value, quantity: (Number(value) * 60) } : row,
        )
      );
    } else {
      setSelectedProducts((prev) =>
        prev.map((row) =>
          row.pId === pId ? { ...row, [field]: value } : row
        )
      );
    };
  };

  const addProduct = (e: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    e.preventDefault();
    setSelectedProducts((prev) => [
      ...prev,
      { pId: rowIndex, count: "", color: "", varient: "", bag: "", quantity: 0, price: "" },
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

  const totalAmount = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => sum + row.quantity * row.price,
    0
  );

  useEffect(() => {
    setYrnProducts(selectedProducts);
  }, [selectedProducts, setYrnProducts]);

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
            {/* Product Select */}
            <select
              value={row.count}
              onChange={(e) => handleChange(rowIndex, "count", e.target.value)}
              className="border p-2 rounded col-span-2 w-[300px]"
            >
              <option value="">Count</option>
              {yarnCountList()?.map((count: string) => (
                <option
                  key={count}
                  value={count}
                >
                  {count}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={row.color || ""}
              onChange={(e) =>
                handleChange(rowIndex, "color", e.target.value)
              }
              className="border p-2 rounded"
              placeholder="color"
            />

            <select
              value={row.varient}
              onChange={(e) => handleChange(rowIndex, "varient", e.target.value)}
              className="border p-2 rounded col-span-2 w-[300px]"
            >
              <option value="">Select Varient</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Diamond">Diamond</option>
            </select>

            {/* Bag */}
            <input
              type="text"
              value={row.bag || ""}
              onChange={(e) =>
                handleChange(rowIndex, "bag", e.target.value)
              }
              className="border p-2 rounded"
              placeholder="bag"
            />


            {/* Quantity */}
            <input
              type="text"
              value={row.quantity || ""}
              onChange={(e) =>
                handleChange(rowIndex, "quantity", Number(e.target.value))
              }
              className="border p-2 rounded"
              placeholder="Qty"
            />

            {/* Price */}
            <input
              type="text"
              value={row.price || ""}
              onChange={(e) =>
                handleChange(rowIndex, "price", e.target.value)
              }
              className="border p-2 rounded"
              placeholder="Price"
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
        : null}

      {/* Add Product Button */}
      <Button type="button" color={'blue'} onClick={(e) => addProduct(e, selectedProducts?.length)}>+ Add Product</Button>

      {/* Total */}
      <div className="mt-4 font-bold text-lg">
        Total: ₹{totalAmount?.toFixed(2)}
      </div>
    </div>
  );
}
