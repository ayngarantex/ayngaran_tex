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

  const [invoicePending, setInvoicePending] = useState(0);
  const [yarnPending, setYarnPending] = useState(0);
  const [yarnPurchased, setYarnPurchased] = useState(0);
  const [sizingPending, setSizingPending] = useState(0);
  const [sizingPurchased, setSizingPurchased] = useState(0);
  const [purchasePending, setPurchasePending] = useState(0);
  const [purchasePurchased, setPurchasePurchased] = useState(0);

  const fetchDashboardTotals = async () => {
    try {
      const res = await fetch('/api/dashboard/totals');
      if (res.ok) {
        const data = await res.json();
        setInvoicePending(data.invoicePending || 0);
        setYarnPending(data.yarnPending || 0);
        setYarnPurchased(data.yarnPurchased || 0);
        setSizingPending(data.sizingPending || 0);
        setSizingPurchased(data.sizingPurchased || 0);
        setPurchasePending(data.purchasePending || 0);
        setPurchasePurchased(data.purchasePurchased || 0);
      }
    } catch (e) {
      console.error("Error fetching dashboard totals:", e);
    }
  };

  useEffect(() => {
    fetchDashboardTotals();
  }, []);

  const [hasMounted, setHasMounted] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Form states for modal
  const [indusind, setIndusind] = useState(0);
  const [hdfc, setHdfc] = useState(0);
  const [canarabank, setCanarabank] = useState(0);
  const [check, setCheck] = useState(0);
  const [govinth, setGovinth] = useState(0);

  const [denom500, setDenom500] = useState(0);
  const [denom200, setDenom200] = useState(0);
  const [denom100, setDenom100] = useState(0);
  const [denom50, setDenom50] = useState(0);
  const [denom20, setDenom20] = useState(0);
  const [denom10, setDenom10] = useState(0);

  // load from localStorage on mount
  useEffect(() => {
    setHasMounted(true);
    try {
      const stored = localStorage.getItem('ayngaran_cash_in_hand');
      if (stored) {
        const parsed = JSON.parse(stored);
        setIndusind(Number(parsed.indusind) || 0);
        setHdfc(Number(parsed.hdfc) || 0);
        setCanarabank(Number(parsed.canarabank) || 0);
        setCheck(Number(parsed.check) || 0);
        setGovinth(Number(parsed.govinth) || 0);

        setDenom500(Number(parsed.denom500) || 0);
        setDenom200(Number(parsed.denom200) || 0);
        setDenom100(Number(parsed.denom100) || 0);
        setDenom50(Number(parsed.denom50) || 0);
        setDenom20(Number(parsed.denom20) || 0);
        setDenom10(Number(parsed.denom10) || 0);
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }, []);

  // refetch whenever filters/page change
  useEffect(() => {
    fetchExpensesQuery(query, startDate, endDate, page);
  }, [query, startDate, endDate, page]);

  const cashDenomTotal = (denom500 * 500) + (denom200 * 200) + (denom100 * 100) + (denom50 * 50) + (denom20 * 20) + (denom10 * 10);
  const bankTotal = indusind + hdfc + canarabank + check + govinth
  const totalCashInHand = cashDenomTotal + bankTotal;

  const handleSave = () => {
    const dataToStore = {
      indusind,
      hdfc,
      canarabank,
      check,
      govinth,
      denom500,
      denom200,
      denom100,
      denom50,
      denom20,
      denom10
    };
    localStorage.setItem('ayngaran_cash_in_hand', JSON.stringify(dataToStore));
    setIsCalculatorOpen(false);
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses ({data?.count || 0})</h1>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
        {/* Total Expenses Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-4 top-4 opacity-15">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Total Expenses</span>
            <h2 className="text-2xl font-extrabold mt-1">{formatCurrency(data?.totalAmount || 0)}</h2>
          </div>
          <span className="text-sm text-blue-200">Based on active filters</span>
        </div>

        {/* Company Cash in Hand Card */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-4 top-4 opacity-15">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 6H12.01M9 20H15M7 4H17C18.1 4 19 4.9 19 6V18C19 19.1 18.1 20 17 20H7C5.9 20 5 19.1 5 18V6C5 4.9 5.9 4 7 4ZM7 6V18H17V6H7Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div>
              <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Cash in Hand</span>
              <h2 className="text-2xl font-extrabold mt-1">
                {hasMounted ? formatCurrency(totalCashInHand) : '₹0.00'}
              </h2>
            </div>
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="bg-white/20 hover:bg-white/35 text-white rounded-lg px-2 py-1 text-xs font-bold transition-all flex items-center gap-1 border border-white/10 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculator
            </button>
          </div>
          <div className="flex justify-between text-xs text-teal-200 mt-2 font-medium">
            <span>Cash: {hasMounted ? formatCurrency(cashDenomTotal) : '₹0.00'}</span>
            <span>Bank: {hasMounted ? formatCurrency(bankTotal) : '₹0.00'}</span>
          </div>
        </div>

        {/* Total to Receive Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-4 top-4 opacity-15">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-100 uppercase tracking-wider">To Receive</span>
            <h2 className="text-2xl font-extrabold mt-1">{formatCurrency(invoicePending)}</h2>
          </div>
          <span className="text-sm text-amber-200">Outstanding invoice balances</span>
        </div>

        {/* Total to Pay (Yarn) Card */}
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-4 top-4 opacity-15">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-rose-100 uppercase tracking-wider">To Pay (Yarn)</span>
            <h2 className="text-2xl font-extrabold mt-1">{formatCurrency(yarnPending)}</h2>
          </div>
          <div className="flex justify-between text-xs text-rose-200 mt-2 font-medium">
            <span>Purchase: {formatCurrency(yarnPurchased)}</span>
            <span>Balance: {formatCurrency(yarnPending)}</span>
          </div>
        </div>

        {/* Total to Pay (Sizing) Card */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-4 top-4 opacity-15">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-violet-100 uppercase tracking-wider">To Pay (Sizing)</span>
            <h2 className="text-2xl font-extrabold mt-1">{formatCurrency(sizingPending)}</h2>
          </div>
          <div className="flex justify-between text-xs text-violet-200 mt-2 font-medium">
            <span>Purchase: {formatCurrency(sizingPurchased)}</span>
            <span>Balance: {formatCurrency(sizingPending)}</span>
          </div>
        </div>

        {/* Total to Pay (Purchases) Card */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-4 top-4 opacity-15">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-sky-100 uppercase tracking-wider">To Pay (Purchases)</span>
            <h2 className="text-2xl font-extrabold mt-1">{formatCurrency(purchasePending)}</h2>
          </div>
          <div className="flex justify-between text-xs text-sky-200 mt-2 font-medium">
            <span>Purchase: {formatCurrency(purchasePurchased)}</span>
            <span>Balance: {formatCurrency(purchasePending)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2 no-print">
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

      {data.expenses?.length ?
        <Table expenses={data.expenses || []} />
        : null}

      <div className="mt-5 flex w-full justify-center">
        <PaginationNew totalPages={data.totalPages} currentPage={page} onPageChange={setPage} />
      </div>

      {/* Cash Calculator Popup Modal */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs no-print p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-slate-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Company Cash in Hand Calculator
              </h2>
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-150 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Bank Accounts & Hand Holdings */}
              <div>
                <h3 className="text-md font-bold text-gray-700 mb-4 pb-1 border-b border-slate-100">Bank Accounts & Hand Holdings</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-semibold text-gray-600 w-1/3">Prakash Indusind</label>
                    <input
                      type="number"
                      min="0"
                      value={indusind || ''}
                      onChange={(e) => setIndusind(Math.max(0, Number(e.target.value)))}
                      className="w-2/3 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Enter balance"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-semibold text-gray-600 w-1/3">HDFC Bank</label>
                    <input
                      type="number"
                      min="0"
                      value={hdfc || ''}
                      onChange={(e) => setHdfc(Math.max(0, Number(e.target.value)))}
                      className="w-2/3 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Enter balance"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-semibold text-gray-600 w-1/3">Canara Bank</label>
                    <input
                      type="number"
                      min="0"
                      value={canarabank || ''}
                      onChange={(e) => setCanarabank(Math.max(0, Number(e.target.value)))}
                      className="w-2/3 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Enter balance"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-semibold text-gray-600 w-1/3">Prakash hand (Cash)</label>
                    <div className="w-2/3 bg-slate-100 text-slate-800 font-bold border border-slate-200 rounded-lg p-2 text-sm">
                      {formatCurrency(cashDenomTotal)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-semibold text-gray-600 w-1/3">Govinth</label>
                    <input
                      type="number"
                      min="0"
                      value={govinth || ''}
                      onChange={(e) => setGovinth(Math.max(0, Number(e.target.value)))}
                      className="w-2/3 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-semibold text-gray-600 w-1/3">Checks in Hand</label>
                    <input
                      type="number"
                      min="0"
                      value={check || ''}
                      onChange={(e) => setCheck(Math.max(0, Number(e.target.value)))}
                      className="w-2/3 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Enter checks value"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Cash Denominations */}
              <div>
                <h3 className="text-md font-bold text-gray-700 mb-4 pb-1 border-b border-slate-100">Cash Denomination Breakdown</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm font-bold text-gray-600 text-right">₹ 500</span>
                    <input
                      type="number"
                      min="0"
                      value={denom500 || ''}
                      onChange={(e) => setDenom500(Math.max(0, Math.floor(Number(e.target.value))))}
                      className="border border-gray-300 rounded-lg p-1.5 text-center text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Count"
                    />
                    <span className="text-sm font-bold text-slate-700 bg-slate-50 border p-1.5 rounded-lg text-right">
                      {formatCurrency(denom500 * 500)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm font-bold text-gray-600 text-right">₹ 200</span>
                    <input
                      type="number"
                      min="0"
                      value={denom200 || ''}
                      onChange={(e) => setDenom200(Math.max(0, Math.floor(Number(e.target.value))))}
                      className="border border-gray-300 rounded-lg p-1.5 text-center text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Count"
                    />
                    <span className="text-sm font-bold text-slate-700 bg-slate-50 border p-1.5 rounded-lg text-right">
                      {formatCurrency(denom200 * 200)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm font-bold text-gray-600 text-right">₹ 100</span>
                    <input
                      type="number"
                      min="0"
                      value={denom100 || ''}
                      onChange={(e) => setDenom100(Math.max(0, Math.floor(Number(e.target.value))))}
                      className="border border-gray-300 rounded-lg p-1.5 text-center text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Count"
                    />
                    <span className="text-sm font-bold text-slate-700 bg-slate-50 border p-1.5 rounded-lg text-right">
                      {formatCurrency(denom100 * 100)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm font-bold text-gray-600 text-right">₹ 50</span>
                    <input
                      type="number"
                      min="0"
                      value={denom50 || ''}
                      onChange={(e) => setDenom50(Math.max(0, Math.floor(Number(e.target.value))))}
                      className="border border-gray-300 rounded-lg p-1.5 text-center text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Count"
                    />
                    <span className="text-sm font-bold text-slate-700 bg-slate-50 border p-1.5 rounded-lg text-right">
                      {formatCurrency(denom50 * 50)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm font-bold text-gray-600 text-right">₹ 20</span>
                    <input
                      type="number"
                      min="0"
                      value={denom20 || ''}
                      onChange={(e) => setDenom20(Math.max(0, Math.floor(Number(e.target.value))))}
                      className="border border-gray-300 rounded-lg p-1.5 text-center text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Count"
                    />
                    <span className="text-sm font-bold text-slate-700 bg-slate-50 border p-1.5 rounded-lg text-right">
                      {formatCurrency(denom20 * 20)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm font-bold text-gray-600 text-right">₹ 10</span>
                    <input
                      type="number"
                      min="0"
                      value={denom10 || ''}
                      onChange={(e) => setDenom10(Math.max(0, Math.floor(Number(e.target.value))))}
                      className="border border-gray-300 rounded-lg p-1.5 text-center text-sm outline-none focus:border-teal-500 bg-white"
                      placeholder="Count"
                    />
                    <span className="text-sm font-bold text-slate-700 bg-slate-50 border p-1.5 rounded-lg text-right">
                      {formatCurrency(denom10 * 10)}
                    </span>
                  </div>

                  <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-150 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm text-emerald-800 font-bold">
                      <span>Total Denominations Count:</span>
                      <span>{denom500 + denom200 + denom100 + denom50 + denom20 + denom10} notes</span>
                    </div>
                    <div className="flex justify-between items-center text-md text-emerald-900 font-black border-t border-emerald-200/40 pt-1.5">
                      <span>Total Denomination Cash:</span>
                      <span>{formatCurrency(cashDenomTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer / Summary */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-6 text-sm">
                <span className="text-slate-600">Cash: <strong className="text-slate-800 font-bold">{formatCurrency(cashDenomTotal)}</strong></span>
                <span className="text-slate-600">Bank & staff: <strong className="text-slate-800 font-bold">{formatCurrency(bankTotal)}</strong></span>
                <span className="text-slate-700 font-bold">Grand Total: <strong className="text-teal-700 text-base font-black">{formatCurrency(totalCashInHand)}</strong></span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-750 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Save Cash Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
