'use client';

import { salseData, yarnSalesData, sizingData, purchaseData, expensesTotalData, investmentsTotalData, getCashInHand, saveCashInHand } from '@/app/api/node/dashboard';
import { formatCurrency } from '@/app/lib/utils';
import { BanknotesIcon, ArrowTrendingUpIcon, ShieldCheckIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function MultiCardWrapper({ startDate, endDate, billType }: { startDate: string, endDate: string, billType: string }) {
  const [salesVal, setSalesVal] = useState<any>({});
  const [yarnVal, setYarnVal] = useState<any>({});
  const [sizingVal, setSizingVal] = useState<any>({});
  const [purchaseVal, setPurchaseVal] = useState<any>({});
  const [expensesVal, setExpensesVal] = useState<any>({});
  const [investmentsVal, setInvestmentsVal] = useState<any>({});

  const [hasMounted, setHasMounted] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Form states for calculator modal
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

  const fetchDBCash = async () => {
    try {
      const parsed = await getCashInHand();
      if (parsed) {
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
      console.error("Error reading cash in hand:", e);
    }
  };

  // load from database on mount
  useEffect(() => {
    setHasMounted(true);
    fetchDBCash();
  }, []);

  const cashDenomTotal = (denom500 * 500) + (denom200 * 200) + (denom100 * 100) + (denom50 * 50) + (denom20 * 20) + (denom10 * 10);
  const bankTotal = indusind + hdfc + canarabank + check + govinth;
  const totalCashInHand = cashDenomTotal + bankTotal;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [sales, yarn, sizing, purchase, expenses, investments] = await Promise.all([
          salseData(startDate, endDate, billType),
          yarnSalesData(startDate, endDate, billType),
          sizingData(startDate, endDate, billType),
          purchaseData(startDate, endDate, billType),
          expensesTotalData(startDate, endDate),
          investmentsTotalData("", "")
        ]);

        setSalesVal(sales);
        setYarnVal(yarn);
        setSizingVal(sizing);
        setPurchaseVal(purchase);
        setExpensesVal(expenses);
        setInvestmentsVal(investments);
      } catch (error) {
        console.error('Error fetching dashboard summary data:', error);
      }
    };

    fetchAllData();
  }, [startDate, endDate, billType]);

  // Compute calculated balance flow: Total Investment + Cash in Hand + Received Invoice + Yarn Paid + Sizing Paid + Purchase Paid - Expenses
  const totalInvest = investmentsVal?.totalAmount || 0;
  const totalCash = hasMounted ? totalCashInHand : 0;
  const receivedInvoice = salesVal?.totalPaidAmount || 0;
  const yarnPaid = yarnVal?.totalPaidAmount || 0;
  const sizingPaid = sizingVal?.totalPaidAmount || 0;
  const purchasePaid = purchaseVal?.totalPaidAmount || 0;
  const expensesAmt = expensesVal?.totalAmount || 0;

  const netBalanceFlow = Number(totalInvest) + Number(receivedInvoice) - (Number(yarnPaid) + Number(sizingPaid) + Number(purchasePaid) + Number(expensesAmt));

  const handleSave = async () => {
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
    await saveCashInHand(dataToStore);
    setIsCalculatorOpen(false);
  };

  return (
    <div className="space-y-8 mb-8">
      {/* ==================== BLOCK 1: Capital & Cash Ledger ==================== */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-1">
          Block 1: Capital & Cash Ledger
        </h3>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Investments */}
          <InvestmentCard total={totalInvest} />

          {/* 2. Cash In Hand Card with Calculator trigger */}
          <CashInHandCard
            total={totalCash}
            cash={hasMounted ? cashDenomTotal : 0}
            bank={hasMounted ? bankTotal : 0}
            onOpenCalculator={() => {
              // Ensure we load fresh values before opening modal
              fetchDBCash();
              setIsCalculatorOpen(true);
            }}
          />

          {/* 3. Expenses Card */}
          <ExpenseCard total={expensesAmt} />

          {!billType && !startDate && (
            /* 4. Net Calculated Flow Summary Card */
            <NetFlowCard netFlow={netBalanceFlow} />
          )}
        </div>
      </div>

      {/* ==================== BLOCK 2: Operations Ledger ==================== */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-1">
          Block 2: Operations Ledger
        </h3>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* 5. Sales Card */}
          <CardNew
            title="Sales"
            total={salesVal?.totalInvoiceAmount ?? 0}
            paid={salesVal?.totalPaidAmount ?? 0}
            pending={salesVal?.totalPendingAmount ?? 0}
          />

          {/* 6. Yarn Card */}
          <CardNew
            title="Yarn"
            total={yarnVal?.totalInvoiceAmount ?? 0}
            paid={yarnVal?.totalPaidAmount ?? 0}
            pending={yarnVal?.totalPendingAmount ?? 0}
          />

          {/* 7. Sizing Card */}
          <CardNew
            title="Sizing"
            total={sizingVal?.totalInvoiceAmount ?? 0}
            paid={sizingVal?.totalPaidAmount ?? 0}
            pending={sizingVal?.totalPendingAmount ?? 0}
          />

          {/* 8. Purchases Card */}
          <CardNew
            title="Purchases"
            total={purchaseVal?.totalInvoiceAmount ?? 0}
            paid={purchaseVal?.totalPaidAmount ?? 0}
            pending={purchaseVal?.totalPendingAmount ?? 0}
          />
        </div>
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
                    <label className="text-sm font-semibold text-gray-600 w-full">Prakash Indusind</label>
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
                    <label className="text-sm font-semibold text-gray-600 w-full">HDFC Bank</label>
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
                    <label className="text-sm font-semibold text-gray-600 w-full">Canara Bank</label>
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
                    <label className="text-sm font-semibold text-gray-600 w-full">Prakash hand (Cash)</label>
                    <div className="w-2/3 bg-slate-100 text-slate-800 font-bold border border-slate-200 rounded-lg p-2 text-sm">
                      {formatCurrency(cashDenomTotal)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-semibold text-gray-600 w-full">Govinth</label>
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
                    <label className="text-sm font-semibold text-gray-600 w-full">Checks in Hand</label>
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

export function InvestmentCard({ total }: { total: number }) {
  return (
    <div className="rounded-xl bg-blue-50 p-2 shadow-sm flex flex-col justify-between min-h-[180px]">
      <div className="flex p-4">
        <ArrowTrendingUpIcon className="h-5 w-5 text-gray-700" />
        <h3 className="text-sm font-medium">Investments</h3>
      </div>
      <div className="bg-white p-4 flex-1 flex flex-col justify-center items-center rounded-lg">
        <span className="text-xs text-gray-500 uppercase font-semibold">Total Invested</span>
        <h2 className="text-2xl font-extrabold mt-1 text-gray-800">{formatCurrency(total)}</h2>
      </div>
    </div>
  );
}

export function ExpenseCard({ total }: { total: number }) {
  return (
    <div className="rounded-xl bg-blue-50 p-2 shadow-sm flex flex-col justify-between min-h-[180px]">
      <div className="flex p-4">
        <BanknotesIcon className="h-5 w-5 text-gray-700" />
        <h3 className="text-sm font-medium">Expenses</h3>
      </div>
      <div className="bg-white p-4 flex-1 flex flex-col justify-center items-center rounded-lg">
        <span className="text-xs text-gray-500 uppercase font-semibold">Total Expenses</span>
        <h2 className="text-2xl font-extrabold mt-1 text-gray-800">{formatCurrency(total)}</h2>
      </div>
    </div>
  );
}

export function CashInHandCard({ total, cash, bank, onOpenCalculator }: { total: number; cash: number; bank: number; onOpenCalculator: () => void }) {
  return (
    <div className="rounded-xl bg-blue-50 p-2 shadow-sm flex flex-col justify-between min-h-[180px]">
      <div className="flex p-4 justify-between items-center w-full">
        <div className="flex items-center">
          <BanknotesIcon className="h-5 w-5 text-gray-700" />
          <h3 className="text-sm font-medium">Cash in Hand</h3>
        </div>
        <button
          onClick={onOpenCalculator}
          className="bg-white hover:bg-slate-100 text-teal-800 rounded-lg px-2.5 py-1 text-xs font-bold transition-all flex items-center gap-1 border border-slate-200 shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculator
        </button>
      </div>
      <div className="bg-white p-4 flex-1 flex flex-col justify-between rounded-lg">
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-xs text-gray-500 uppercase font-semibold">Total Cash</span>
          <h2 className="text-2xl font-extrabold mt-1 text-gray-800">{formatCurrency(total)}</h2>
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t font-semibold w-full">
          <span>Cash: {formatCurrency(cash)}</span>
          <span>Bank: {formatCurrency(bank)}</span>
        </div>
      </div>
    </div>
  );
}

export function NetFlowCard({ netFlow }: { netFlow: number }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2 shadow-lg flex flex-col justify-between min-h-[180px] text-white">
      <div className="flex p-4">
        <ShieldCheckIcon className="h-5 w-5 text-emerald-100" />
        <h3 className="text-sm font-medium text-emerald-50">Business Net Capital</h3>
      </div>
      <div className="bg-white/10 backdrop-blur-xs p-4 flex-1 flex flex-col justify-between rounded-lg">
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-xs text-emerald-100 uppercase font-medium">Calculated Balance Flow</span>
          <h2 className="text-2xl font-extrabold mt-1">{formatCurrency(netFlow)}</h2>
        </div>
        <div className="text-[9px] text-emerald-200 mt-2 pt-1 border-t border-white/10 text-center font-medium">
          Invest + Cash + Rec + YarnPaid + SizingPaid + PurchPaid - Exp
        </div>
      </div>
    </div>
  );
}

export function CardNew({
  title,
  total,
  paid,
  pending,
}: {
  title: string;
  total: number | string;
  paid: number | string;
  pending: number | string;
}) {
  return (
    <div className="rounded-xl bg-blue-50 p-2 shadow-sm flex flex-col justify-between min-h-[180px]">
      <div className="flex p-4">
        <CubeIcon className="h-5 w-5 text-gray-700" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="bg-white rounded-lg flex-1 flex flex-col justify-between p-3">
        <div className="flex justify-between text-sm py-1 border-b border-gray-100">
          <span className="text-gray-500 font-medium">Total</span>
          <span className="font-semibold text-gray-800">{formatCurrency(Number(total))}</span>
        </div>
        <div className="flex justify-between text-sm py-1 border-b border-gray-100">
          <span className="text-gray-500 font-medium">{title === 'Sales' ? 'Received' : 'Paid'}</span>
          <span className="font-semibold text-gray-800">{formatCurrency(Number(paid))}</span>
        </div>
        <div className="flex justify-between text-sm py-1 font-bold">
          <span className="text-gray-900">{title === 'Sales' ? 'To Receive' : 'To Pay'}</span>
          <span className="text-red-600">{formatCurrency(Number(pending))}</span>
        </div>
      </div>
    </div>
  );
}
