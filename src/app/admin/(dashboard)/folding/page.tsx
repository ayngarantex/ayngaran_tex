import { CreateFolding } from "@/app/ui/folding/buttons";
import Table from "@/app/ui/folding/table";
import WeeklyFoldingTable from "@/app/ui/folding/weekly-table";
import Search from "@/app/ui/search";
import Pagination from "@/app/lib/pagination";
import { fetchFoldingCount, fetchFoldingWagesConsolidated } from "@/app/api/node/folding";
import { fetchLooms } from "@/app/api/node/looms";
import { pageLimit } from "@/app/lib/utils";
import { Suspense } from "react";
import Link from "next/link";
import { CalendarDaysIcon, TableCellsIcon } from "@heroicons/react/24/outline";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    loomId?: string;
    startDate?: string;
    view?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const loomId = searchParams?.loomId || '';
  const startDate = searchParams?.startDate || '2026-09-27';
  const currentView = searchParams?.view || 'weekly';

  const looms = await fetchLooms('', 0);
  const weeklyRecords = await fetchFoldingWagesConsolidated(query, loomId, startDate);
  const totalCount = await fetchFoldingCount(query);
  const totalPages = Math.ceil(Number(totalCount) / pageLimit) || 1;

  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Folding & DC Reconciliation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly consolidation by folder/loom with piece tracking (Given/Return), folding wages &amp; payments
          </p>
        </div>
        <div className="flex">
          <div className="flex items-center gap-2.5 mr-2">
            <CreateFolding type="Given" looms={looms || []} />
          </div>
          <div className="flex items-center gap-2.5">
            <CreateFolding type="Return" looms={looms || []} />
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-slate-200 pb-1">
        <Link
          href={`/admin/folding?view=weekly${query ? `&query=${query}` : ''}${loomId ? `&loomId=${loomId}` : ''}${startDate ? `&startDate=${startDate}` : ''}`}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${currentView !== 'entries'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <CalendarDaysIcon className="h-4 w-4" />
          Weekly Reconciliation ({weeklyRecords.length})
        </Link>

        <Link
          href={`/admin/folding?view=entries${query ? `&query=${query}` : ''}`}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${currentView === 'entries'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <TableCellsIcon className="h-4 w-4" />
          All DC Entries ({totalCount})
        </Link>
      </div>

      {/* Tab Content */}
      {currentView === 'entries' ? (
        <div className="mt-2">
          <div className="flex w-full items-center justify-between gap-3 border-b border-slate-200 pb-2 pt-2">
            <div className="w-full sm:w-80">
              <Search placeholder="Search DC #, date, notes..." />
            </div>
          </div>

          <div className="mt-2 flow-root">
            <Suspense key={query + currentPage}>
              <Table query={query} currentPage={currentPage} />
            </Suspense>
          </div>

          <div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      ) : (
        <WeeklyFoldingTable
          initialRecords={weeklyRecords || []}
          looms={looms || []}
        />
      )}
    </div>
  );
}
