import Pagination from '@/app/lib/pagination';
import Table from '@/app/ui/warp/table';
import WarpSummaryTable from '@/app/ui/warp/summary-table';
import Financialyear from '@/app/lib/financialyear';
import { pageLimit } from '@/app/lib/utils';
import { fetchWarps, fetchWarpsCount, fetchWarpSummary } from '@/app/api/node/warp';
import { fetchLooms } from '@/app/api/node/looms';
import { fetchSizing } from '@/app/api/node/sizing';
import Link from 'next/link';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    billType?: string;
    orderBy?: string;
    loomName?: string;
    loomId?: string;
    loomStatus?: string;
    sizingId?: string;
    view?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const loomId = searchParams?.loomId || '';
  const loomStatus = searchParams?.loomStatus || '';
  const sizingId = searchParams?.sizingId || '';
  const currentPage = Number(searchParams?.page) || 1;
  const view = searchParams?.view || 'summary';

  const warpCount = await fetchWarpsCount(query, loomId, loomStatus, sizingId);
  const totalPages = Math.ceil(Number(warpCount) / pageLimit);
  const sizingList = await fetchSizing("", 0, "", "", "", "");
  const looms = await fetchLooms("", 0);

  // Conditional data fetching
  let warps: any[] = [];
  let summary: any[] = [];

  if (view === 'summary') {
    summary = await fetchWarpSummary(query, loomId, sizingId);
  } else {
    warps = await fetchWarps(query, currentPage, loomId, loomStatus, sizingId);
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Warps ({warpCount || 0})</h1>
        <div className="flex gap-2">
          <Link
            href={`/admin/warp?view=list&query=${query}&loomId=${loomId}&loomStatus=${loomStatus}&sizingId=${sizingId}`}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            Detailed List
          </Link>
          <Link
            href={`/admin/warp?view=summary&query=${query}&loomId=${loomId}&loomStatus=${loomStatus}&sizingId=${sizingId}`}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'summary'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            Loom Summary
          </Link>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="w-3/4 pl-2">
          <Financialyear
            hideYear={true}
            orderBy={false}
            LoomsFetch={true}
            LoomStatus={view === 'list'}
            looms={looms}
            sizing={true}
            sizingList={sizingList}
          />
        </div>
      </div>

      {/* <WarpSummaryTable summary={summary} /> */}

      {view === 'summary' ? (
        <WarpSummaryTable summary={summary} />
      ) : (
        <Table warps={warps || []} />
      )}

      {view === 'list' && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}