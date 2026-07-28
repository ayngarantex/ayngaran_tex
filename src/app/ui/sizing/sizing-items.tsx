import React, { useEffect, useState } from "react";
import { SizingItemsRow } from '@/app/lib/types';
import { Button } from "../button";

const paymentType = ["Bank", "Cash", "Check", "Gpay", "PhonePay"]

interface SizingItemProps {
  yarnGiven: any,
  setYarnGiven: React.Dispatch<React.SetStateAction<SizingItemsRow[]>>;
}


export default function SizingItems({ yarnGiven, setYarnGiven }: SizingItemProps) {
  const [selectedItems, setSelectedItems] = useState<SizingItemsRow[]>([
    { pId: 0, color: "", yarnSent: 0, yarnUsed: 0, yarnBalance: 0 },
  ]);

  useEffect(() => {
    let formProducts = []
    let pId = 0
    if (yarnGiven.length) {
      yarnGiven.forEach((row: any, rowIndex: number) => {
        formProducts.push(
          {
            pId: rowIndex,
            color: row.Color,
            yarnSent: row.YarnSent,
            yarnUsed: row.YarnUsed,
            yarnBalance: row.YarnBalance,
          }
        )
        pId = rowIndex + 1
      });
    } else {
      formProducts.push({ pId: pId, color: "", yarnSent: 0, yarnUsed: 0, yarnBalance: 0 })
    }
    setSelectedItems(formProducts)
  }, [yarnGiven?.length])

  const handleChange = (
    pId: number,
    field: keyof SizingItemsRow,
    value: string | number
  ) => {
    let selected = selectedItems.filter(e => e.pId === pId)?.[0]
    let yarnBalance = parseFloat(String(selected.yarnSent)) - parseFloat(String(selected.yarnUsed))
    if (field === 'yarnSent') {
      yarnBalance = parseFloat(String(value)) - parseFloat(String(selected.yarnUsed));
    } else if (field === 'yarnUsed') {
      yarnBalance = parseFloat(String(selected.yarnSent)) - parseFloat(String(value));
    }

    // if(field !== 'color') {
    //   value = parseFloat(String(value))
    // }

    setSelectedItems((prev) =>
      prev.map((row) =>
        row.pId === pId ? { ...row, [field]: value, yarnBalance: parseFloat(yarnBalance?.toFixed(2)) } : row
      )
    );
  };

  const addItems = (e: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    e.preventDefault();
    setSelectedItems((prev) => [
      ...prev,
      { pId: rowIndex, color: "", yarnSent: 0, yarnUsed: 0, yarnBalance: 0 },
    ]);
  };

  const removeItems = (rowIndex: number) => {
    let products = selectedItems.filter((row) => row.pId !== rowIndex);
    let withUpdatedId: any = []
    products.forEach((row, index) => {
      row.pId = index
      withUpdatedId.push(row)
    })
    setSelectedItems(withUpdatedId);
  };

  useEffect(() => {
    setYarnGiven(selectedItems);
  }, [selectedItems, setYarnGiven]);

  const totalYanrSent = selectedItems?.length && selectedItems.reduce(
    (sum, row) => sum + parseFloat(String(row?.yarnSent)),
    0
  );

  const totalYarnUsed = selectedItems?.length && selectedItems.reduce(
    (sum, row) => sum + parseFloat(String(row.yarnUsed)),
    0
  );

  const totalYarnBalance = selectedItems?.length && selectedItems.reduce(
    (sum, row) => sum + parseFloat(String(row.yarnBalance)),
    0
  );

  return (
    <div className="p-4 border rounded-lg w-full mt-4">
      <h2 className="text-xl font-bold mb-4">Add Sizing Items</h2>
      <div
        className="flex gap-3 items-center mb-4"
      >
        <p className="w-16">S No</p>

        <div className='flex flex-wrap'>
          <div className="w-40 pl-3">Color</div>
          <div className="w-40 pl-3">Yarn Sent</div>
          <div className="w-40 pl-3">Yarn Used</div>
          <div className="w-40 pl-3">Yarn Balance</div>
          <div className="w-40 pl-3">Price</div>
        </div>
      </div>
      {selectedItems.map((row, rowIndex: number) => (
        <div
          key={row.pId}
          className="flex gap-3 items-center mb-4"
        >
          <p className="w-16">{rowIndex + 1}</p>

          <div className='flex flex-wrap'>
            <div className="w-40 pl-3">
              <input
                id="color"
                name="color"
                type="text"
                placeholder="Enter color"
                value={row.color || ""}
                onChange={(e) => {
                  handleChange(rowIndex, "color", e.target.value)
                }}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>

            <div className="w-40 pl-3">
              <input
                id="yarnSent"
                name="yarnSent"
                type="number"
                step="any"
                placeholder="yarnSent"
                value={row?.yarnSent || ""}
                onChange={(e) => {
                  handleChange(rowIndex, "yarnSent", e.target.value ? parseFloat(e.target.value) : "");
                }}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>

            <div className="w-40 pl-3">
              <input
                id="yarnUsed"
                name="yarnUsed"
                type="number"
                step="any"
                placeholder="yarnUsed"
                value={row?.yarnUsed || ""}
                onChange={(e) => {
                  handleChange(rowIndex, "yarnUsed", e.target.value ? parseFloat(e.target.value) : "");
                }}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>

            <div className="w-40 pl-3">
              <input
                id="yarnBalance"
                name="yarnBalance"
                type="text"
                placeholder="yarnBalance"
                value={row?.yarnBalance}
                readOnly
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
            {/* Remove Button */}
            <button
              type='button'
              onClick={() => removeItems(rowIndex)}
              className="text-red-500 text-sm underline pl-3"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {/* Add Product Button */}
      <div className="flex justify-between">
        <Button type="button" color={'blue'} onClick={(e) => addItems(e, selectedItems?.length)}>+ Add Item</Button>
      </div>

      <div className="flex">
        {/* Meters */}
        <div className="mt-4 font-bold text-lg pr-5">
          Meters: ₹{totalYanrSent.toFixed(2)}
        </div>

        {/* Meters */}
        <div className="mt-4 font-bold text-lg pr-5">
          Weight: ₹{totalYarnUsed.toFixed(2)}
        </div>

        {/* Total */}
        <div className="mt-4 font-bold text-lg pr-5">
          Total: ₹{totalYarnBalance.toFixed(2)}
        </div>

      </div>
    </div>
  );
}
