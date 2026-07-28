import Table from '@/app/ui/beem/table';
import { fetchBeemDetails } from '@/app/lib/beem';
import { BeemDetails } from '@/app/ui/beem/buttons';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    loomName: string
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const loomName = searchParams?.loomName || '';
  const currentPage = Number(searchParams?.page) || 1;
  const { data: beems, sum } = await fetchBeemDetails(query, loomName, currentPage);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        {/* ${lusitana.className} */}
        <h1 className={`text-2xl`}>Beem Details</h1>
      </div>
      <div className='flex gap-8'>
        <div className='w-1/4 border-green-400 rounded-lg border-2 p-4 bg-green-100'>
          <p className={`text-2xl text-green-500`}>New : {sum.Loaded}</p>
        </div>
        <div className='w-1/4 border-blue-400 rounded-lg border-2 p-4 bg-blue-100'>
          <p className={`text-2xl text-blue-500`}>Running : {sum.Running}</p>
        </div>
        <div className='w-1/4 border-red-400 rounded-lg border-2 p-4 bg-red-100'>
          <p className={`text-2xl text-red-500`}>Empty : {sum.Empty}</p>
        </div>
        <div className='w-1/4 border-orange-400 rounded-lg border-2 p-4 bg-orange-100'>
          <p className={`text-2xl text-orange-500`}>Total : {sum.Loaded + sum.Running + sum.Empty}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 md:mt-8">
        <BeemDetails />
      </div>
      <Table beems={beems || []} />
      {/* </Suspense> */}
      {/* <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div> */}
    </div >
  );
}