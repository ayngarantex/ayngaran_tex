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

      {selectedProducts?.length ?
        selectedProducts.map((row, rowIndex: number) => (
          <div
            key={`selP_${rowIndex}`}
            className="flex gap-3 items-center mb-2"
          >
            <p className="w-16">{rowIndex + 1}</p>
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
              className="border p-2 rounded col-span-2 w-[300px]"
            >
              <option value="">Select Product</option>
              {products?.map((product: any) => (
                <option
                  key={product.Id}
                  value={product.Id}
                >
                  {product.Name}
                </option>
              ))}
            </select>
            {products.find((p: any) => Number(p.Id) === Number(row.product))?.Name === "Custom" && (
              <input
                type="text"
                value={row.productName || ""}
                onChange={(e) => handleChange(rowIndex, "productName", e.target.value)}
                className="border p-2 rounded"
                placeholder="Product Name"
              />
            )}
            <select
              value={row.type}
              onChange={(e) => handleChange(rowIndex, "type", e.target.value)}
              className="border p-2 rounded col-span-2 w-[150px]"
            >
              <option value="">Select Type</option>
              {productType()?.map((type: string) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={row.quantityType || ""}
              onChange={(e) =>
                handleChange(rowIndex, "quantityType", e.target.value)
              }
              className="border p-2 rounded w-30"
              placeholder="Qty Type"
            />

            {/* Quantity */}
            <input
              type="text"
              value={row.quantity || ""}
              onChange={(e) =>
                handleChange(rowIndex, "quantity", Number(e.target.value))
              }
              className="border p-2 rounded w-30"
              placeholder="Qty"
            />

            {/* Price */}
            <input
              type="number"
              step="any"
              value={row.price || ""}
              onChange={(e) =>
                handleChange(rowIndex, "price", Number(e.target.value))
              }
              className="border p-2 rounded"
              placeholder="Price"
            />

            {/* Amount */}
            <div className="font-semibold">
              ₹{(row.quantity * row.price).toFixed(2)}
            </div>

            {/* Remove Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeProduct(rowIndex)}
                className="text-red-500 text-sm underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))
        : null}

      {/* Add Product Button */}
      <Button type="button" color={'blue'} onClick={(e) => addProduct(e, selectedProducts?.length)}>+ Add Return</Button>

      {/* Total */}
      <div className="mt-4 flex justify-end">
        <div className="font-bold text-lg mr-8 self-center">
          Total
        </div>
        <div className="border border-gray-300 rounded-lg bg-gray-100 p-2 flex">
          <div className="font-bold text-lg mr-8">
            Qty: {totalQuantity}
          </div>
          <div className="font-bold text-lg">
            Amt: ₹{totalAmount?.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
