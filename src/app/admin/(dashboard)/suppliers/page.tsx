import Pagination from '@/app/lib/pagination';
import Search from '@/app/ui/search';
import { CreateSupplier, SupplierLumpSumPaymentModal } from '@/app/ui/suppliers/buttons';
import Table from '@/app/ui/suppliers/table';
import { fetchAllSuppliers, fetchSupplierPages } from '@/app/api/node/supplier';
import Financialyear from '@/app/lib/financialyear';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    billType?: string;
    orderBy?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';
  const billType = searchParams?.billType || '';
  const orderBy = searchParams?.orderBy || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchSupplierPages(query);
  const totalSuppliers = await fetchAllSuppliers('All');

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl font-bold`}>Suppliers ({totalSuppliers?.length || 0})</h1>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 md:mt-8">
        <div className='flex w-full md:w-1/2'>
          <div className='w-1/3'>
            <Search placeholder="Search suppliers..." />
          </div>
          <div className='w-3/4 pl-2'>
            <Financialyear
              orderBy={true}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SupplierLumpSumPaymentModal suppliers={totalSuppliers} buttonLabel="Lump-Sum Payment" />
          <CreateSupplier />
        </div>
      </div>
       {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
        <Table query={query} currentPage={currentPage} startDate={startDate} endDate={endDate} billType={billType} orderBy={orderBy}/>
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}