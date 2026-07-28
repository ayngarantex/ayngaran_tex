import Pagination from '@/app/lib/pagination';
import Search from '@/app/ui/search';
import { CreateCustomer, PrintCustomers, PrintSelector } from '@/app/ui/customers/buttons';
import Table from '@/app/ui/customers/table';
import Financialyear from '@/app/lib/financialyear';
import { fetchCustomerCount, fetchTotalPending } from '@/app/api/node/customers';
import { formatCurrency, pageLimit } from '@/app/lib/utils';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    billType?: string;
    orderBy?: string;
    print?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';
  const billType = searchParams?.billType || '';
  const orderBy = searchParams?.orderBy || '';
  const currentPage = Number(searchParams?.page) || 1;
  const printMode = searchParams?.print === 'true';

  const totalCustomers = await fetchCustomerCount(query);
  const totalPages = Math.ceil(Number(totalCustomers) / pageLimit); //node query
  const totalPending = await fetchTotalPending(query, startDate, endDate);

  return (
    <div className="w-full">
      {printMode && (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
            .hidden-print-col { display: none !important; }
            body, html { overflow: auto !important; height: auto !important; background: white !important; }
            .flex-grow { padding: 2rem !important; }
            table { display: table !important; width: 100% !important; }
            .md\\:hidden { display: none !important; }
            tr { page-break-inside: avoid !important; }
            @media print {
              .no-print { display: none !important; }
              body, html, .flex, .flex-grow, main, div {
                display: block !important;
                overflow: visible !important;
                height: auto !important;
                position: static !important;
              }
            }
          ` }} />
          <PrintSelector />
        </>
      )}
      <div className="flex w-full items-center justify-between no-print">
        {/* ${lusitana.className} */}
        <h1 className={`text-2xl`}>Customers ({totalCustomers})</h1>
        <h1 className={`text-2xl`}>Pending <span className='text-red-600'>{totalPending ? formatCurrency(totalPending) : '0.00'}</span></h1>
      </div>
      {printMode && (
        <div className="hidden print:block mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold">Ayngaran Tex - Customers List</h1>
          <p className="text-gray-600 mt-2">Total Customers: {totalCustomers} | Overall Pending: {totalPending ? formatCurrency(totalPending) : '0.00'}</p>
        </div>
      )}
      <div className={`mt-4 flex items-center justify-between gap-2 ${printMode ? 'mt-0' : 'md:mt-8'} no-print`}>
        <div className='flex w-1/2'>
          <div className='w-1/3 no-print'>
            <Search placeholder="Search customers..." />
          </div>
          <div className='w-3/4 pl-2 no-print'>
            <Financialyear
              orderBy={true}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className='no-print'>
            <PrintCustomers query={query} startDate={startDate} endDate={endDate} billType={billType} orderBy={orderBy} />
          </div>
          <CreateCustomer />
        </div>
      </div>
      {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
      <Table query={query} currentPage={currentPage} startDate={startDate} endDate={endDate} billType={billType} orderBy={orderBy} limit={printMode ? null : undefined} />
      {/* </Suspense> */}
      {!printMode && (
        <div className="mt-5 flex w-full justify-center no-print">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}