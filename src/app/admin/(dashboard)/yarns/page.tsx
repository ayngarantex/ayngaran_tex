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
      <div className="flex justify-between px-4 py-5 mt-5 bg-blue-300 rounded-lg self-center">
        <div className="w-full flex">
          <label htmlFor="mobile" className="block text-sm self-center font-bold">
            Purchased
          </label>
          <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
            {formatCurrency(yarnsPurchaseDetatils?.totalInvoiceAmount || 0)}
          </div>
        </div>
        <div className="w-full flex justify-center">
          <label htmlFor="mobile" className="block text-sm self-center font-bold">
            Paid
          </label>
          <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
            {formatCurrency(yarnsPurchaseDetatils?.totalPaid || 0)}
          </div>
        </div>
        <div className="w-full flex justify-end">
          <label htmlFor="mobile" className="block text-sm self-center font-bold">
            Balance
          </label>
          <div className="relative pl-4 tex-2xl w-40 text-right text-red-600 text-lg text-center">
            {formatCurrency(yarnsPurchaseDetatils?.balance || 0)}
          </div>
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