import React, { Suspense } from 'react';
import Search from '@/app/ui/search';
import Pagination from '@/app/lib/pagination';
import { CreateDesignSheet } from '@/app/ui/design-sheets/buttons';
import DesignSheetsTable from '@/app/ui/design-sheets/table';
import { fetchDesignSheets, fetchDesignSheetsCount } from '@/app/api/node/design-sheets';

export default async function DesignSheetsPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const [{ count, totalPages }, designSheets] = await Promise.all([
    fetchDesignSheetsCount(query),
    fetchDesignSheets(query, currentPage)
  ]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sizing Design Sheets ({count})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Creel pattern setups, bracket repeats, and warp end specifications for sizing masters.
          </p>
        </div>
        <CreateDesignSheet />
      </div>

      {/* Top Controls */}
      <div className="mt-4 flex items-center justify-between gap-3 md:mt-6">
        <div className="w-full md:w-80">
          <Suspense fallback={<div className="h-10 bg-slate-100 rounded-lg animate-pulse" />}>
            <Search placeholder="Search by design #, name, or width..." />
          </Suspense>
        </div>
      </div>

      {/* Table */}
      <DesignSheetsTable designSheets={designSheets} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
