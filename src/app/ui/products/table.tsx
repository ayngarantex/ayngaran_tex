import { UpdateProduct, DeleteProduct } from '@/app/ui/products/buttons';
// import { fetchProducts } from '@/app/lib/data'; //prisma query
import { fetchProducts } from '@/app/api/node/product'; //node query
import Link from 'next/link';

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
          <div className="md:hidden">
            {products?.map((prod: any) => (
              <div
                key={prod.Id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <p className="font-bold">{prod?.Name}</p>
                <p className="text-sm text-gray-500">Code: {prod?.HSNCode}</p>
                <p className="text-xs text-gray-500">Total: {prod?.TotalStock || 0}</p>
                <p className="text-xs text-gray-500">Sold: {prod?.SoldCount || 0}</p>
                <p className="text-sm text-gray-700 font-semibold">Available: {prod?.AvailableStock || 0}</p>
                <div className="mt-4 flex gap-2">
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
          </div>
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
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 font-semibold text-blue-700">
                    {prod?.AvailableStock || 0}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/products/${prod.Id}/stocks`}
                        className="rounded-md border p-2 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 transition-colors"
                        title="Manage Stock"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Stock
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
