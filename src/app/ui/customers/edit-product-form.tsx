'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { redirect } from 'next/navigation';
import { updateCustomerProduct } from '@/app/api/node/customers';

export default function EditForm({ CustomerId, Products }: { CustomerId: number, Products: any[] }) {
  // Store product codes for all Products
  const [codes, setCodes] = useState(
    Products.map((p: any) => ({
      id: p.Id,
      code: p.ProductCode || ''
    }))
  );

  const handleCodeChange = (id: number, value: string) => {
    setCodes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, code: value } : item
      )
    );
  };

  const handleSubmit = async () => {
    const filtered = codes.filter((item) => item.code?.trim() !== "");
    let customerData = {
      CustomerId: CustomerId,
      Products: filtered,
    };

    const res = await updateCustomerProduct(customerData);
    if (res?.data?.updateCustomer) {
      redirect('/admin/customers');
    }
  };

  return (
    <form>
      <div className="mb-6 flex justify-end gap-4">
        <Link
          href="/admin/customers"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Back
        </Link>
      </div>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {Products.map((product: any, index: number) => {
          const current = codes.find((x) => x.id === product.Id);

          return (
            <div key={product.Id}>
              {!index && (
                <div className="hidden md:grid grid-cols-4 gap-6 mb-4 font-semibold text-sm text-gray-700 pb-2 border-b border-blue-200">
                  <label>Product</label>
                  <label>Code</label>
                  <label>Last Purchase Price / Type</label>
                  <label>Total Purchase Qty</label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4 border-b border-blue-100 items-end">
                <div>
                  <label className="block md:hidden text-xs text-gray-500 font-bold mb-1 uppercase">Product</label>
                  <h2 className="text-base font-bold text-gray-800 self-center">
                    {product.Name}
                  </h2>
                </div>

                <div>
                  <label className="block md:hidden text-xs text-gray-500 font-bold mb-1 uppercase">Code</label>
                  <div className="relative rounded-md">
                    <input
                      type="text"
                      value={current?.code || ''}
                      onChange={(e) => handleCodeChange(product.Id, e.target.value)}
                      placeholder="Product Code"
                      className="peer block w-full rounded-md border border-gray-200 bg-blue-100 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block md:hidden text-xs text-gray-500 font-bold mb-1 uppercase">Last Purchase Price / Type</label>
                  <div className="relative rounded-md">
                    <input
                      type="text"
                      value={product.ProductPrice ? `${product.ProductPrice}  / ${product?.PurchaseType}` : 'No purchases yet'}
                      disabled={true}
                      className="peer block w-full rounded-md border border-gray-200 bg-gray-100 py-2 pl-4 text-sm outline-none text-gray-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block md:hidden text-xs text-gray-500 font-bold mb-1 uppercase">Total Purchase Qty</label>
                  <div className="relative rounded-md">
                    <input
                      type="text"
                      value={product.ProductSoldQuantity ? `${product.ProductSoldQuantity}` : 'No purchases'}
                      disabled={true}
                      className="peer block w-full rounded-md border border-gray-200 bg-gray-100 py-2 pl-4 text-sm outline-none text-gray-600 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/customers"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Back
        </Link>
        <Button type="button" onClick={handleSubmit}>
          Update Product
        </Button>
      </div>
    </form>
  );
}