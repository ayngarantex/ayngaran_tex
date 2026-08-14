import Pagination from '@/app/lib/pagination';
import Search from '@/app/ui/search';
import { CreateYarn } from '@/app/ui/yarns/buttons';
import Table from '@/app/ui/yarns/table';
import { fetchYarnPages, fetchYarns, fetchYarnsDetails } from '@/app/lib/data';
import Financialyear from '@/app/lib/financialyear';
import { formatCurrency } from '@/app/lib/utils';
// import FinancialYearDropdownWrapper from '@/app/lib/FinancialYearDropdownWrapper';

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
  const data = await fetchYarnPages(query, startDate, endDate, billType);
  const totalPages = data.totalPages || 0
  const yarns = await fetchYarns(query, currentPage, startDate, endDate, billType, orderBy);
  const yarnsPurchaseDetatils: any = await fetchYarnsDetails(query, startDate, endDate, billType, orderBy);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        {/* ${lusitana.className} */}
        <h1 className={`text-2xl`}>Yarns ({data?.count || 0})</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className='flex w-1/2'>
          <div className='w-1/4'>
            <Search placeholder="Search yarns..." />
          </div>
          <div className='w-3/4 pl-2'>
            <Financialyear
              orderBy={true}
            />
          </div>
        </div>
        <CreateYarn />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Purchased</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(yarnsPurchaseDetatils?.totalInvoiceAmount || 0)}</h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid</span>
          <h2 className="text-2xl font-bold text-teal-600 mt-1">{formatCurrency(yarnsPurchaseDetatils?.totalPaid || 0)}</h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
          <h2 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(yarnsPurchaseDetatils?.balance || 0)}</h2>
        </div>
      </div>
      {/* <Suspense key={query + currentPage} fallback={<yarnsTableSkeleton />}> */}
      <Table yarns={yarns || []} />
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}