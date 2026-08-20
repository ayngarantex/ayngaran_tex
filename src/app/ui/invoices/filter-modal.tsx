'use client';

import { useEffect, useState, useTransition } from 'react';
import { getFinancialYears, getFinancialYear } from '@/app/lib/utils';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useLoading } from '@/app/ui/loading-context';

export default function InvoiceFilterModal() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { startTransition } = useLoading();
  const [isOpen, setIsOpen] = useState(false);

  // Derive initial values from URL searchParams
  const paramStartDate = searchParams.get('startDate');
  const paramEndDate = searchParams.get('endDate');
  const paramBillType = searchParams.get('billType') || '';
  const paramOrderBy = searchParams.get('orderBy') || '';

  // Calculate current month start and end dates
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const formatYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];
  const defaultStartDate = formatYYYYMMDD(new Date(year, month, 1));
  const defaultEndDate = formatYYYYMMDD(new Date(year, month + 1, 0));

  // Get current financial year as default for select dropdowns
  const currentMonth = today.getMonth() + 1;
  const defaultStartYear = currentMonth < 4 ? year - 1 : year;
  const defaultEndYear = defaultStartYear + 1;
  const defaultFY = `${defaultStartYear}-${defaultEndYear}`;

  const initialFY = paramStartDate && paramEndDate
    ? getFinancialYear(paramStartDate)
    : defaultFY;

  // Local state variables for the modal inputs
  const [localFY, setLocalFY] = useState(initialFY);
  const [localStartDate, setLocalStartDate] = useState(paramStartDate || defaultStartDate);
  const [localEndDate, setLocalEndDate] = useState(paramEndDate || defaultEndDate);
  const [localBillType, setLocalBillType] = useState(paramBillType);
  const [localOrderBy, setLocalOrderBy] = useState(paramOrderBy);

  // Sync state if URL changes (e.g. from outer reset or other pagination actions)
  useEffect(() => {
    setLocalBillType(paramBillType);
    setLocalOrderBy(paramOrderBy);
    
    if (paramStartDate && paramEndDate) {
      setLocalStartDate(paramStartDate);
      setLocalEndDate(paramEndDate);
      setLocalFY(getFinancialYear(paramStartDate));
    } else if (paramStartDate === '' || paramEndDate === '') {
      setLocalStartDate('');
      setLocalEndDate('');
      setLocalFY('All');
    }
  }, [paramStartDate, paramEndDate, paramBillType, paramOrderBy]);

  // Adjust dates when FY selection changes
  const handleFYChange = (value: string) => {
    setLocalFY(value);
    if (value === 'All') {
      setLocalStartDate('');
      setLocalEndDate('');
    } else {
      const [start, end] = value.split('-').map(String);
      setLocalStartDate(`${start}-04-01`);
      setLocalEndDate(`${end}-03-31`);
    }
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (localStartDate && localEndDate) {
      params.set('startDate', localStartDate);
      params.set('endDate', localEndDate);
    } else {
      params.delete('startDate');
      params.delete('endDate');
    }

    if (localBillType) {
      params.set('billType', localBillType);
    } else {
      params.delete('billType');
    }

    if (localOrderBy) {
      params.set('orderBy', localOrderBy);
    } else {
      params.delete('orderBy');
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setLocalFY(defaultFY);
    setLocalStartDate(defaultStartDate);
    setLocalEndDate(defaultEndDate);
    setLocalBillType('');
    setLocalOrderBy('');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-4 text-sm font-semibold text-gray-700 transition-all cursor-pointer shadow-xs active:scale-97"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        Filters
        {(paramStartDate || paramEndDate || paramBillType || paramOrderBy) ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xxs font-bold text-white">
            {[paramStartDate || paramEndDate, paramBillType, paramOrderBy].filter(Boolean).length}
          </span>
        ) : null}
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs no-print p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-150 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-slate-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                Invoice Filters
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Financial Year */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="financialYear" className="text-sm font-semibold text-gray-700">
                  Financial Year
                </label>
                <select
                  id="financialYear"
                  name="financialYear"
                  value={localFY}
                  onChange={(e) => handleFYChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All Financial Years</option>
                  {getFinancialYears(2022).map((year: string) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={localStartDate}
                    onChange={(e) => {
                      setLocalStartDate(e.target.value);
                      setLocalFY(''); // custom user override
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={localEndDate}
                    onChange={(e) => {
                      setLocalEndDate(e.target.value);
                      setLocalFY(''); // custom user override
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bill Type */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="billType" className="text-sm font-semibold text-gray-700">
                  Bill Type
                </label>
                <select
                  id="billType"
                  value={localBillType}
                  onChange={(e) => setLocalBillType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Bill Types</option>
                  <option value="gst">GST Only</option>
                  <option value="normal">Normal Only</option>
                </select>
              </div>

              {/* Order By */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="orderBy" className="text-sm font-semibold text-gray-700">
                  Sort Order
                </label>
                <select
                  id="orderBy"
                  value={localOrderBy}
                  onChange={(e) => setLocalOrderBy(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Default (Date DESC)</option>
                  <option value="pending">Pending Invoices First</option>
                  <option value="InvoiceNumberASC">Invoice Number ASC</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 rounded-b-2xl flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-150 border border-gray-300 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer active:scale-97"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
