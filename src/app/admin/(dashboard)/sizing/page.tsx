import Pagination from '@/app/lib/pagination';
import Search from '@/app/ui/search';
import { CreateSizing } from '@/app/ui/sizing/buttons';
import Table from '@/app/ui/sizing/table';
import { fetchSizingPages, fetchSizing, fetchSizingTotal } from '@/app/api/node/sizing';
import Financialyear from '@/app/lib/financialyear';
import { formatCurrency } from '@/app/lib/utils';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';
  const billType = searchParams?.billType || '';
  const orderBy = searchParams?.orderBy || '';
  const currentPage = Number(searchParams?.page) || 1;
  const data = await fetchSizingPages(query, startDate, endDate, billType);
  const totalPages = data.totalPages || 0
  const sizing = await fetchSizing(query, currentPage, startDate, endDate, billType, orderBy);
  const sizngTotal: any = await fetchSizingTotal(query, startDate, endDate, billType, orderBy);

  console.log("sizing", sizing)

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        {/* ${lusitana.className} */}
        <h1 className={`text-2xl`}>Sizing ({data?.count || 0})</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className='flex w-1/2'>
          <div className='w-1/4'>
            <Search placeholder="Search sizing..." />
          </div>
          <div className='w-3/4 pl-2'>
            <Financialyear
              orderBy={true}
            />
          </div>
        </div>
        <CreateSizing />
      </div>
      <div className="flex justify-between px-4 py-5 mt-5 bg-blue-300 rounded-lg self-center">
        <div className="w-full flex">
          <label htmlFor="mobile" className="block text-sm self-center font-bold">
            Purchase
          </label>
          <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
            {formatCurrency(sizngTotal?.totalInvoiceAmount || 0)}
          </div>
        </div>
        <div className="w-full flex justify-center">
          <label htmlFor="mobile" className="block text-sm self-center font-bold">
            Paid
          </label>
          <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
            {formatCurrency(sizngTotal?.totalReceived || 0)}
          </div>
        </div>
        <div className="w-full flex justify-end">
          <label htmlFor="mobile" className="block text-sm self-center font-bold">
            Pending
          </label>
          <div className="relative pl-4 tex-2xl w-40 text-right text-red-600 text-lg text-center">
            {formatCurrency(sizngTotal?.balance || 0)}
          </div>
        </div>
      </div>
      {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
      <Table sizing={sizing || []} />
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}