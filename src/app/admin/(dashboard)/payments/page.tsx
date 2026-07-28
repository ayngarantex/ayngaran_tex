import Search from '@/app/ui/search';
import Table from '@/app/ui/payments/table';
import Pagination from '@/app/lib/pagination';
import { fetchPaymentCount } from '@/app/api/node/payment';
import Financialyear from '@/app/lib/financialyear';

const pageLimit = 50;

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    startDate: string;
    endDate: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';
  const totalCount = await fetchPaymentCount(query, startDate, endDate);
  const totalPages = Math.ceil(Number(totalCount) / 50);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Payments ({totalCount})</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className='flex w-1/2'>
          <div className='w-1/4'>
            <Search placeholder="Search payments..." />
          </div>
          <div className='w-1/2 pl-2'>
            <Financialyear
              hideBillType={true}
            />
          </div>
        </div>
      </div>
      <Table query={query} currentPage={currentPage} pageLimit={pageLimit} startDate={startDate} endDate={endDate} />

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}