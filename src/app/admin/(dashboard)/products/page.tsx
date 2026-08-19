import Pagination from '@/app/lib/pagination';
import Search from '@/app/ui/search';
import { CreateProduct } from '@/app/ui/products/buttons';
import Table from '@/app/ui/products/table';
import { fetchProductCount, fetchProductTotals } from '@/app/api/node/product'; //node query
import { pageLimit } from '@/app/lib/utils';
import Link from 'next/link';
// import { fetchAllProducts, fetchProductPages } from '@/app/lib/data'; //prisma query

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalProducts = await fetchProductCount(query); //node query
  const totalPages = Math.ceil(Number(totalProducts) / pageLimit); //node query

  const totals = await fetchProductTotals(query, "");

  const totalStockSum = totals?.TotalStock || 0;
  const totalSoldSum = totals?.SoldCount || 0;
  const totalAvailableSum = totals?.AvailableStock || 0;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        {/* ${lusitana.className} */}
        <h1 className={`text-2xl`}>Products ({totalProducts || 0})</h1>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 my-3">
        <div className="rounded-xl p-6 shadow-sm border border-blue-200/60 bg-blue-50/70 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Total Stock</p>
            <p className="text-3xl font-extrabold text-blue-900 mt-1">{totalStockSum.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/85 rounded-lg text-blue-600 shadow-sm flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm border border-emerald-200/60 bg-emerald-50/70 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Total Sold</p>
            <p className="text-3xl font-extrabold text-emerald-900 mt-1">{totalSoldSum.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/85 rounded-lg text-emerald-600 shadow-sm flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm border border-purple-200/60 bg-purple-50/70 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-700 uppercase tracking-wider">Available Stock</p>
            <p className="text-3xl font-extrabold text-purple-900 mt-1">{totalAvailableSum.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/85 rounded-lg text-purple-600 shadow-sm flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className='w-1/3'>
          <Search placeholder="Search products..." />
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/stocks"
            className="flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Stock Ledger
          </Link>
          <CreateProduct />
        </div>
      </div>
      {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
      <Table query={query} currentPage={currentPage} />
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}