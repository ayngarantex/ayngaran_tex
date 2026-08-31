import Search from '@/app/ui/search';
import Table from '@/app/ui/payments/table';
import Pagination from '@/app/lib/pagination';
import { fetchPaymentCount } from '@/app/api/node/payment';
import Financialyear from '@/app/lib/financialyear';
import Link from 'next/link';

const pageLimit = 50;

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    startDate: string;
    endDate: string;
    type?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';
  const type = searchParams?.type || 'invoice';
  const totalCount = await fetchPaymentCount(query, startDate, endDate, type);
  const totalPages = Math.ceil(Number(totalCount) / 50);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Payments ({totalCount})</h1>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 mt-6 mb-6">
        <Link
          href={`/admin/payments?type=invoice&startDate=${startDate}&endDate=${endDate}`}
          className={`mr-8 py-3 px-1 border-b-2 font-medium transition-all duration-150 ${type === 'invoice'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          Customer Payments
        </Link>
        <Link
          href={`/admin/payments?type=sizing&startDate=${startDate}&endDate=${endDate}`}
          className={`mr-8 py-3 px-1 border-b-2 font-medium transition-all duration-150 ${type === 'sizing'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          Sizing Payments
        </Link>
        <Link
          href={`/admin/payments?type=yarn&startDate=${startDate}&endDate=${endDate}`}
          className={`mr-8 py-3 px-1 border-b-2 font-medium transition-all duration-150 ${type === 'yarn'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          Yarn Payments
        </Link>
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
      <Table query={query} currentPage={currentPage} pageLimit={pageLimit} startDate={startDate} endDate={endDate} type={type} />

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}