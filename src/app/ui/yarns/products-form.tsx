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
          varient: row.Varient || "",
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

  const totalAmount = selectedProducts?.length
    ? selectedProducts.reduce((sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.price) || 0), 0)
    : 0;

  const totalQuantity = selectedProducts?.length
    ? selectedProducts.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
    : 0;

  const totalBags = selectedProducts?.length
    ? selectedProducts.reduce((sum, row) => sum + (Number(row.bag) || 0), 0)
    : 0;

  useEffect(() => {
    setYrnProducts(selectedProducts);
  }, [selectedProducts, setYrnProducts]);

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Add Products</h2>

      <div className="space-y-4">
        {selectedProducts?.length ?
          selectedProducts.map((row, rowIndex: number) => (
            <div
              key={`selP_${rowIndex}`}
              className="flex flex-col md:flex-row gap-3 md:items-center border border-slate-200 md:border-none p-4 md:p-0 rounded-xl md:rounded-none mb-4 md:mb-2 bg-white md:bg-transparent shadow-xs md:shadow-none"
            >
              {/* Mobile Header */}
              <div className="flex justify-between items-center md:hidden border-b border-slate-100 pb-2 mb-1">
                <span className="font-bold text-sm text-indigo-600">Yarn #{rowIndex + 1}</span>
                <button
                  type="button"
                  onClick={() => removeProduct(rowIndex)}
                  className="text-red-500 text-xs font-semibold hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>

              {/* Desktop Index */}
              <p className="w-8 hidden md:block text-slate-500 font-semibold">{rowIndex + 1}</p>

              {/* Input fields wrapper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-3 items-end md:items-center w-full">
                {/* Product Select */}
                <div className="w-full md:w-[250px] lg:w-[300px] flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Count</span>
                  <select
                    value={row.count}
                    onChange={(e) => handleChange(rowIndex, "count", e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                  >
                    <option value="">Count</option>
                    {yarnCountList()?.map((count: string) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div className="w-full md:w-auto flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Color</span>
                  <input
                    type="text"
                    value={row.color || ""}
                    onChange={(e) =>
                      handleChange(rowIndex, "color", e.target.value)
                    }
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                    placeholder="Color"
                  />
                </div>

                {/* Varient Select */}
                <div className="w-full md:w-[250px] lg:w-[300px] flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Varient</span>
                  <select
                    value={row.varient}
                    onChange={(e) => handleChange(rowIndex, "varient", e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                  >
                    <option value="">Select Varient</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                </div>

                {/* Bag */}
                <div className="w-full md:w-auto flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Bag</span>
                  <input
                    type="text"
                    value={row.bag || ""}
                    onChange={(e) =>
                      handleChange(rowIndex, "bag", e.target.value)
                    }
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                    placeholder="Bag"
                  />
                </div>

                {/* Quantity */}
                <div className="w-full md:w-auto flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Qty</span>
                  <input
                    type="number"
                    step="0.001"
                    value={row.quantity || ""}
                    onChange={(e) =>
                      handleChange(rowIndex, "quantity", parseFloat(e.target.value) || 0)
                    }
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                    placeholder="Qty"
                  />
                </div>

                {/* Price */}
                <div className="w-full md:w-auto flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Price</span>
                  <input
                    type="text"
                    value={row.price || ""}
                    onChange={(e) =>
                      handleChange(rowIndex, "price", e.target.value)
                    }
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                    placeholder="Price"
                  />
                </div>

                {/* Amount */}
                <div className="w-full md:w-32 flex flex-col justify-end md:justify-center">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Amount</span>
                  <div className="font-bold text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg md:p-0 md:bg-transparent md:border-none text-sm">
                    ₹{(row.quantity * row.price).toFixed(2) || 0}
                  </div>
                </div>
              </div>

              {/* Desktop Remove Button */}
              <div className="hidden md:block">
                <button
                  type="button"
                  onClick={() => removeProduct(rowIndex)}
                  className="text-red-500 text-sm hover:text-red-700 font-semibold underline transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
          : null}
      </div>

      {/* Add Product Button */}
      <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
        <Button type="button" color={'blue'} onClick={(e) => addProduct(e, selectedProducts?.length)}>+ Add Product</Button>

        {/* Total */}
        <div className="border border-gray-300 rounded-lg bg-gray-100 p-2 flex gap-4">
          <div className="font-bold text-base md:text-lg">
            Bags: {totalBags}
          </div>
          <div className="font-bold text-base md:text-lg">
            Weight: {totalQuantity.toFixed(3)} kg
          </div>
          <div className="font-bold text-base md:text-lg text-indigo-700">
            Amt: ₹{totalAmount?.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
