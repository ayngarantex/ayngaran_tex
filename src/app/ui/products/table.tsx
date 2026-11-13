import { UpdateProduct, DeleteProduct } from '@/app/ui/products/buttons';
import { fetchProducts } from '@/app/api/node/product';
import { formatDateNew } from '@/app/lib/utils';
import Link from 'next/link';
import StockCreateModal from '@/app/ui/products/StockCreateModal';

export default async function ProductTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const products = await fetchProducts(query, currentPage);

  if (!products || products.length === 0) {
    return (
      <div className="mt-6 rounded-xl bg-white border border-slate-200 p-12 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-xl bg-white border border-slate-200 p-2 md:p-4 shadow-sm overflow-x-auto">
          <table className="min-w-full text-slate-900 align-middle">
            <thead className="rounded-lg text-left text-xs sm:text-sm font-bold bg-slate-100 text-slate-900 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold sm:pl-6">
                  Product Name
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Code
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Total
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Sold
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Last Entry
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Available
                </th>
                <th scope="col" className="relative py-3.5 pl-6 pr-3 text-right font-bold">
                  Actions
                </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm font-medium">
              {products?.map((prod: any) => (
                <tr
                  key={`prod_${prod.Id}`}
                  className="hover:bg-slate-50/80 transition-colors text-slate-900"
                >
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 font-semibold text-slate-900">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{prod?.Name}</span>
                      <div className="flex items-center gap-1.5 mt-1 md:hidden">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/70 rounded-md px-1.5 py-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-500">Avail:</span>
                          <span>{prod?.AvailableStock ? Number(prod.AvailableStock).toLocaleString() : 0}</span>
                        </span>
                        {prod?.HSNCode && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            #{prod.HSNCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-700 font-mono text-xs font-semibold">
                    {prod?.HSNCode || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold text-blue-700">
                    {prod?.TotalStock ? Number(prod.TotalStock).toLocaleString() : 0}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-700">
                    {prod?.SoldCount ? Number(prod.SoldCount).toLocaleString() : 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {prod?.LastQuantity ? (
                      <div className="flex flex-col text-xs">
                        <span className="font-bold text-slate-900">
                          {Number(prod.LastQuantity).toLocaleString()}
                          <span className="text-slate-500 text-xs font-normal ml-1">pcs</span>
                          <span className="text-slate-500 font-medium pl-2">{formatDateNew(prod.LastEntryDate)}</span>
                        </span>
                        {prod.LastNote && (
                          <span className="text-slate-500 text-[11px] font-medium">{prod.LastNote}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold text-purple-700">
                    {prod?.AvailableStock ? Number(prod.AvailableStock).toLocaleString() : 0}
                  </td>
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <StockCreateModal
                        product={{ Id: prod.Id, Name: prod.Name, HSNCode: prod.HSNCode }}
                        buttonClassName="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        buttonLabel="Add Stock"
                      />
                      <Link
                        href={`/admin/products/${prod.Id}/stocks`}
                        className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 transition-colors"
                        title="Manage Stock"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Stocks</span>
                      </Link>
                      <UpdateProduct id={prod.Id} />
                      <DeleteProduct id={prod.Id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
