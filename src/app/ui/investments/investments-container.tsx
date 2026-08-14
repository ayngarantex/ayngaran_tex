// app/ui/investments/investments-container.tsx
'use client';

import { useState, useEffect } from 'react';
import { CreateInvestment } from '@/app/ui/investments/buttons';
import Table from '@/app/ui/investments/table';
import FinancialyearNew from '@/app/lib/financialyearNew';
import SearchNew from '../search-new';
import { formatCurrency } from '@/app/lib/utils';
import PaginationNew from '@/app/lib/paginationNew';

export default function InvestmentsContainer() {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<any>({ investments: [], count: 0, totalPages: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchInvestmentsQuery = async (q: string, start: string, end: string, pg: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/investments?query=${q}&startDate=${start}&endDate=${end}&page=${pg}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error("Error fetching investments:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchInvestmentsQuery(query, startDate, endDate, page);
  };

  // refetch whenever filters/page change
  useEffect(() => {
    fetchInvestmentsQuery(query, startDate, endDate, page);
  }, [query, startDate, endDate, page]);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Investments ({data?.count || 0})</h1>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Total Invested Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-4 top-4 opacity-15">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Total Investments</span>
            <h2 className="text-2xl font-extrabold mt-1">{formatCurrency(data?.totalAmount || 0)}</h2>
          </div>
          <span className="text-[10px] text-indigo-200">Based on active filters</span>
        </div>
      </div>

      {/* Controls: Search, Date Filter, and Add Button */}
      <div className="mt-6 flex items-center justify-between gap-2 no-print">
        <div className="flex w-1/2">
          <div className="w-1/3">
            <SearchNew
              placeholder="Search investments..."
              onSearch={(val) => setQuery(val)}
            />
          </div>
          <div className="w-2/3 pl-2">
            <FinancialyearNew
              hideBillType={true}
              setFilter={(start: string, end: string) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>
        </div>
        <CreateInvestment />
      </div>

      {/* List Table */}
      {loading ? (
        <div className="mt-8 text-center text-gray-500 font-medium">Loading investments...</div>
      ) : (
        <Table investments={data?.investments || []} onRefresh={handleRefresh} />
      )}

      {/* Pagination */}
      <div className="mt-5 flex w-full justify-center">
        <PaginationNew
          totalPages={data?.totalPages || 0}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
