import { UpdateProduct, DeleteProduct } from '@/app/ui/products/buttons';
// import { fetchProducts } from '@/app/lib/data'; //prisma query
import { fetchProducts } from '@/app/api/node/product'; //node query
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
  // const products = await fetchProducts(query, currentPage); //prisma query
  const products = await fetchProducts(query, currentPage) //node query

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
          {/* <div className="md:hidden">
            {products?.map((prod: any) => (
              <div
                key={prod.Id}
                className="mb-2 w-full rounded-md bg-white p-4 shadow-xs border border-gray-100"
              >
                <p className="font-bold text-base text-gray-900">{prod?.Name}</p>
                <p className="text-sm text-gray-500">Code: {prod?.HSNCode}</p>

                {prod?.LastQuantity ? (
                  <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-gray-600 font-medium">Last Entry:</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">
                        {Number(prod.LastQuantity).toLocaleString()} pcs
                        <span className="text-gray-500 block text-[11px] pl-2">{formatDateNew(prod.LastEntryDate)}</span>
                      </span>
                      <span className="text-gray-500 block text-[11px]">{formatDateNew(prod.LastEntryDate)}</span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs border-t border-gray-100 pt-2">
                  <div>
                    <span className="text-gray-500 block">Total</span>
                    <span className="font-semibold text-gray-900">{prod?.TotalStock || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Sold</span>
                    <span className="font-semibold text-gray-900">{prod?.SoldCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Available</span>
                    <span className="font-bold text-purple-700">{prod?.AvailableStock || 0}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StockCreateModal
                    product={{ Id: prod.Id, Name: prod.Name, HSNCode: prod.HSNCode }}
                    buttonClassName="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    buttonLabel="+ Add Stock"
                  />
                  <Link
                    href={`/admin/products/${prod.Id}/stocks`}
                    className="rounded-md border p-2 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 transition-colors"
                  >
                    Manage Stock
                  </Link>
                  <UpdateProduct id={prod.Id} />
                  <DeleteProduct id={prod.Id} />
                </div>
              </div>
            ))}
          </div> */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold text-lg sm:pl-6">
                  Product Name
                </th>
                <th scope="col" className="px-4 py-5 font-bold text-lg sm:pl-6">
                  Code
                </th>
                <th scope="col" className="px-4 py-5 font-bold text-lg sm:pl-6">
                  Total
                </th>
                <th scope="col" className="px-4 py-5 font-bold text-lg sm:pl-6">
                  Sold
                </th>
                <th scope="col" className="px-4 py-5 font-bold text-lg sm:pl-6">
                  Last Entry
                </th>
                <th scope="col" className="px-4 py-5 font-bold text-lg sm:pl-6">
                  Available
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {products?.map((prod: any) => (
                <tr
                  key={`inv'${prod.Id}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {prod?.Name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {prod?.HSNCode}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 font-semibold text-blue-700">
                    {prod?.TotalStock || 0}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 font-semibold text-blue-700">
                    {prod?.SoldCount || 0}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {prod?.LastQuantity ? (
                      <div className="flex flex-col text-xs">
                        <span className="font-bold text-gray-900 text-sm">
                          {Number(prod.LastQuantity).toLocaleString()}
                          <span className="text-gray-500 text-xs font-normal">pcs</span>
                          <span className="text-gray-500 font-medium pl-2">{formatDateNew(prod.LastEntryDate)}</span>
                        </span>
                        <span className="text-gray-500 font-medium">{prod.LastNote}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 font-semibold text-purple-700">
                    {prod?.AvailableStock || 0}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-2 items-center">
                      <StockCreateModal
                        product={{ Id: prod.Id, Name: prod.Name, HSNCode: prod.HSNCode }}
                        buttonClassName="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        buttonLabel="Add Stock"
                      />
                      <Link
                        href={`/admin/products/${prod.Id}/stocks`}
                        className="rounded-md border p-2 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 transition-colors"
                        title="Manage Stock"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Stocks
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
