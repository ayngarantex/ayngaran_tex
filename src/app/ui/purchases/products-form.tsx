import React, { useMemo } from "react";
import { Button } from "../button";
import SearchDropdown from "../search-dropdown";

export interface PurchaseProductRow {
  pId: number;
  product: number; // Product ID
  itemName: string; // Product Name (Custom or selected)
  quantity: number;
  price: number;
  quantityType: string;
}

interface ProductFormProps {
  products: any[]; // Master products from database
  productsList: PurchaseProductRow[];
  setProductsList: React.Dispatch<React.SetStateAction<PurchaseProductRow[]>>;
}

export default function ProductForm({ products, productsList, setProductsList }: ProductFormProps) {
  const dropdownProducts = useMemo(() => {
    return (products || []).map((p) => ({
      id: p.Id,
      label: p.Name || '',
    }));
  }, [products]);

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

  const handleProductSelect = (pId: number, item: any) => {
    if (!item) {
      handleChange(pId, "product", 0);
      handleChange(pId, "itemName", "");
      handleChange(pId, "quantityType", "pcs");
      handleChange(pId, "price", 0);
      return;
    }
    const productId = Number(item.id);
    const selectedProd = products.find((p: any) => Number(p.Id) === productId);
    let productName = selectedProd?.Name || "";
    let quantityType = selectedProd?.Type || "pcs";
    let productPrice = selectedProd?.ProductPrice || 0; // if price exists, otherwise 0

    if (productName === "Custom") {
      productName = "";
      quantityType = "pcs";
    }

    handleChange(pId, "product", productId);
    handleChange(pId, "itemName", productName);
    handleChange(pId, "quantityType", quantityType);
    handleChange(pId, "price", productPrice);
  };

  const addProduct = (e: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    e.preventDefault();
    setProductsList((prev) => [
      ...prev,
      { pId: rowIndex, product: 0, itemName: "", quantity: 0, price: 0, quantityType: "pcs" },
    ]);
  };

  const removeProduct = (rowIndex: number) => {
    setProductsList((prev) => {
      const prods = prev.filter((row) => row.pId !== rowIndex);
      return prods.map((row, index) => ({
        ...row,
        pId: index,
      }));
    });
  };

  const totalAmount = productsList?.length
    ? productsList.reduce((sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.price) || 0), 0)
    : 0;

  const totalQuantity = productsList?.length
    ? productsList.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
    : 0;

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Add Products</h2>

      <div className="space-y-4">
        {productsList?.length ? (
          productsList.map((row, rowIndex: number) => {
            const selectedProd = products.find((p: any) => Number(p.Id) === Number(row.product));
            const isCustom = selectedProd?.Name === "Custom";

            return (
              <div
                key={`selP_${rowIndex}`}
                className="flex flex-col md:flex-row gap-3 md:items-center border border-slate-200 md:border-none p-4 md:p-0 rounded-xl md:rounded-none mb-4 md:mb-2 bg-white md:bg-transparent shadow-xs md:shadow-none"
              >
                {/* Mobile Header */}
                <div className="flex justify-between items-center md:hidden border-b border-slate-100 pb-2 mb-1">
                  <span className="font-bold text-sm text-indigo-600">Product #{rowIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProduct(row.pId)}
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
                    <SearchDropdown
                      items={dropdownProducts}
                      onSelect={(item) => handleProductSelect(row.pId, item)}
                      placeholder="Select Product"
                      value={selectedProd?.Name || ''}
                      hideLabel={true}
                      showUserIcon={false}
                      className="w-full bg-white"
                    />
                  </div>

                  {/* Custom Product Name */}
                  {isCustom && (
                    <div className="w-full md:w-auto flex flex-col">
                      <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Product Name</span>
                      <input
                        type="text"
                        value={row.itemName || ""}
                        onChange={(e) => handleChange(row.pId, "itemName", e.target.value)}
                        className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                        placeholder="Product Name"
                        required
                      />
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="w-full md:w-auto flex flex-col">
                    <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Qty</span>
                    <input
                      type="number"
                      step="any"
                      value={row.quantity || ""}
                      onChange={(e) => handleChange(row.pId, "quantity", parseFloat(e.target.value) || 0)}
                      className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                      placeholder="Qty"
                      required
                    />
                  </div>

                  {/* Quantity Type */}
                  <div className="w-full md:w-auto flex flex-col">
                    <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Qty Type</span>
                    <select
                      value={row.quantityType || "pcs"}
                      onChange={(e) => handleChange(row.pId, "quantityType", e.target.value)}
                      className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                    >
                      <option value="pcs">pcs</option>
                      <option value="bags">bags</option>
                      <option value="kg">kg</option>
                      <option value="meters">meters</option>
                      <option value="box">box</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="w-full md:w-auto flex flex-col">
                    <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Price</span>
                    <input
                      type="number"
                      step="any"
                      value={row.price || ""}
                      onChange={(e) => handleChange(row.pId, "price", parseFloat(e.target.value) || 0)}
                      className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                      placeholder="Price"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div className="w-full md:w-32 flex flex-col justify-end md:justify-center">
                    <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Amount</span>
                    <div className="font-bold text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg md:p-0 md:bg-transparent md:border-none text-sm">
                      ₹{((row.quantity || 0) * (row.price || 0)).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Desktop Remove Button */}
                <div className="hidden md:block">
                  <button
                    type="button"
                    onClick={() => removeProduct(row.pId)}
                    className="text-red-500 text-sm hover:text-red-700 font-semibold underline transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
        <Button
          type="button"
          color={'blue'}
          onClick={(e) => addProduct(e, productsList?.length)}
        >
          + Add Product
        </Button>

        {/* Total */}
        <div className="border border-gray-300 rounded-lg bg-gray-100 p-2 flex gap-4">
          <div className="font-bold text-base md:text-lg">
            Qty: {totalQuantity}
          </div>
          <div className="font-bold text-base md:text-lg text-indigo-700">
            Amt: ₹{totalAmount?.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
