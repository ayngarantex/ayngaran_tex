import Pagination from '@/app/lib/pagination';
import Search from '@/app/ui/search';
import { CreateLoom, CreateLoomEntry } from '@/app/ui/jobworks/buttons';
import Table from '@/app/ui/jobworks/table';
import { fetchLooms, fetchLoomsCount } from '@/app/api/node/looms';
import { pageLimit } from '@/app/lib/utils';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const looms = await fetchLooms(query, currentPage);
  const loomCount = await fetchLoomsCount(query);
  const totalPages = Math.ceil(Number(loomCount) / pageLimit);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        {/* ${lusitana.className} */}
        <h1 className={`text-2xl`}>Job Work ({loomCount})</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className='w-1/3'>
          <Search placeholder="Search job works..." />
        </div>
        <span className='mx-3'>
          <CreateLoomEntry loomId={"0"} />
        </span>
        <CreateLoom />
      </div>
      {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
      <Table looms={looms} />
      {/* </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}