// app/ui/expenses/expenses-container.tsx
'use client';

import { useState, useEffect } from 'react';
import { CreateExpenses } from '@/app/ui/expenses/buttons';
import Table from '@/app/ui/expenses/table';
import FinancialyearNew from '@/app/lib/financialyearNew';
import SearchNew from '../search-new';
import { formatCurrency } from '@/app/lib/utils';
import PaginationNew from '@/app/lib/paginationNew';

export default function ExpensesContainer() {
  const fetchExpensesQuery = async (query: string, startDate: string, endDate: string, page: number) => {
    const res = await fetch(`/api/expenses?query=${query}&startDate=${startDate}&endDate=${endDate}&page=${page}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();  // <-- parse the body
    setData(data);
    return data;
  };

  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<any>({ expenses: [], count: 0, totalPages: 0 });

  // refetch whenever filters/page change
  useEffect(() => {
    let res: any = fetchExpensesQuery(query, startDate, endDate, page);
  }, [query, startDate, endDate, page]);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Expenses ({data?.count || 0})</h1>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="flex w-1/2">
          <div className="w-1/4">
            <SearchNew
              placeholder="Search expenses..."
              onSearch={(val) => setQuery(val)}
            />
          </div>
          <div className="w-3/4 pl-2">
            <FinancialyearNew
              hideBillType={true}
              setFilter={(startDate: string, endDate: string, billType: string, orderByColumn: string) => {
                  setStartDate(startDate)
                  setEndDate(endDate)
              }}
            />
          </div>
        </div>
        <CreateExpenses />
      </div>
      <div className="flex px-4 py-5 mt-5 bg-blue-300 rounded-lg self-center">
        <div className="w-full flex justify-end">
            <label htmlFor="mobile" className="block text-sm self-center font-bold">
                Total Expenses
            </label>
            <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
              {formatCurrency(data?.totalAmount || 0)}
            </div>
        </div>
      </div>
      {data.expenses?.length ?
        <Table expenses={data.expenses || []} />
      : null}

      <div className="mt-5 flex w-full justify-center">
        <PaginationNew totalPages={data.totalPages} currentPage={page} onPageChange={setPage} />
      </div>
    </div>
  );
}
