import { ProductField } from "@/app/lib/definitions";
import React, { useEffect, useRef, useState } from "react";
import { ProductRow } from '@/app/lib/types';
import { productType } from "@/app/lib/utils";
import { Button } from "../button";

interface ProductsProps {
  retProducts: any;
  products: ProductField[];
  setRetProducts: React.Dispatch<React.SetStateAction<ProductRow[]>>;
}

export default function ReturnProducts({ products, retProducts, setRetProducts }: ProductsProps) {
  const [selectedProducts, setSelectedProducts] = useState<ProductRow[]>(
    [{ pId: 0, product: 0, productName: '', quantity: 0, quantityType: "", price: 0, type: 'Folded' }]
  );
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (!retProducts?.length) return;
    initialized.current = true;

    const formProducts: ProductRow[] = retProducts.map((row: any, rowIndex: number) => ({
      pId: rowIndex,
      product: Number(row.ItemId),
      productName: row.ProductName,
      quantity: row.Quantity,
      quantityType: row.QuantityType,
      price: row.Price,
      type: row?.Type || 'Folded'
    }));
    setSelectedProducts(formProducts);
  }, [retProducts?.length])

  const handleChange = (
    pId: number,
    field: keyof ProductRow,
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
      { pId: rowIndex, product: 0, productName: '', quantity: 0, quantityType: "", price: 0, type: 'Folded' },
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

  const totalQuantity = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => sum + row.quantity,
    0
  );
  const totalAmount = selectedProducts?.length && selectedProducts.reduce(
    (sum, row) => sum + row.quantity * row.price,
    0
  );

  useEffect(() => {
    setRetProducts(selectedProducts);
  }, [selectedProducts, setRetProducts]);

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Return Products</h2>

      <div className="space-y-4">
        {selectedProducts?.length ?
          selectedProducts.map((row, rowIndex: number) => (
            <div
              key={`selP_${rowIndex}`}
              className="flex flex-col md:flex-row gap-3 md:items-center border border-slate-200 md:border-none p-4 md:p-0 rounded-xl md:rounded-none mb-4 md:mb-2 bg-white md:bg-transparent shadow-xs md:shadow-none"
            >
              {/* Mobile Header */}
              <div className="flex justify-between items-center md:hidden border-b border-slate-100 pb-2 mb-1">
                <span className="font-bold text-sm text-indigo-600">Return #{rowIndex + 1}</span>
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
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Select Product</span>
                  <select
                    value={row.product}
                    onChange={(e) => {
                      handleChange(rowIndex, "product", Number(e.target.value))
                      let productName = e.target.value && products.find((p: any) => Number(p.Id) === Number(e.target.value))?.Name || ""
                      let quantityType = e.target.value && products.find((p: any) => Number(p.Id) === Number(e.target.value))?.Type || ""
                      if (productName === "Custom") {
                        productName = ""
                        quantityType = ""
                      }
                      handleChange(rowIndex, "productName", productName)
                      handleChange(rowIndex, "quantityType", quantityType)
                    }}
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                  >
                    <option value="">Select Product</option>
                    {products?.map((product: any) => (
                      <option key={product.Id} value={product.Id}>
                        {product.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Product Name */}
                {products.find((p: any) => Number(p.Id) === Number(row.product))?.Name === "Custom" && (
                  <div className="w-full md:w-auto flex flex-col">
                    <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Product Name</span>
                    <input
                      type="text"
                      value={row.productName || ""}
                      onChange={(e) => handleChange(rowIndex, "productName", e.target.value)}
                      className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                      placeholder="Product Name"
                    />
                  </div>
                )}

                {/* Type Select */}
                <div className="w-full md:w-[130px] lg:w-[150px] flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Type</span>
                  <select
                    value={row.type}
                    onChange={(e) => handleChange(rowIndex, "type", e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                  >
                    <option value="">Select Type</option>
                    {productType()?.map((type: string) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qty Type */}
                <div className="w-full md:w-20 lg:w-24 flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Qty Type</span>
                  <input
                    type="text"
                    value={row.quantityType || ""}
                    onChange={(e) =>
                      handleChange(rowIndex, "quantityType", e.target.value)
                    }
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                    placeholder="Qty Type"
                  />
                </div>

                {/* Quantity */}
                <div className="w-full md:w-20 lg:w-24 flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Qty</span>
                  <input
                    type="text"
                    value={row.quantity || ""}
                    onChange={(e) =>
                      handleChange(rowIndex, "quantity", Number(e.target.value))
                    }
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                    placeholder="Qty"
                  />
                </div>

                {/* Price */}
                <div className="w-full md:w-24 lg:w-28 flex flex-col">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Price</span>
                  <input
                    type="number"
                    step="any"
                    value={row.price !== undefined && row.price !== null ? row.price : ""}
                    onChange={(e) =>
                      handleChange(rowIndex, "price", e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                    placeholder="Price"
                  />
                </div>

                {/* Amount */}
                <div className="w-full md:w-28 lg:w-32 flex flex-col justify-end md:justify-center">
                  <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Amount</span>
                  <div className="font-bold text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg md:p-0 md:bg-transparent md:border-none text-sm">
                    ₹{(row.quantity * row.price).toFixed(2)}
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
        <Button type="button" color={'blue'} onClick={(e) => addProduct(e, selectedProducts?.length)}>+ Add Return</Button>

        {/* Total */}
        <div className="border border-gray-300 rounded-lg bg-gray-100 p-2 flex gap-4">
          <div className="font-bold text-base md:text-lg">
            Qty: {totalQuantity}
          </div>
          <div className="font-bold text-base md:text-lg text-red-600">
            Amt: ₹{totalAmount?.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
