'use client';

import { salseData, yarnSalesData, sizingData, purchaseData, expensesTotalData, investmentsTotalData } from '@/app/api/node/dashboard';
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
      console.error("Error reading cash in hand:", e);
    }
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
          investmentsTotalData(startDate, endDate)
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

          {/* 2. Cash In Hand Card */}
          <CashInHandCard
            total={totalCash}
            cash={hasMounted ? cashDenomTotal : 0}
            bank={hasMounted ? bankTotal : 0}
          />

          {/* 3. Expenses Card */}
          <ExpenseCard total={expensesAmt} />

          {/* 4. Net Calculated Flow Summary Card */}
          <NetFlowCard netFlow={netBalanceFlow} />
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
    </div>
  );
}

export function InvestmentCard({ total }: { total: number }) {
  return (
    <div className="rounded-xl bg-blue-50 p-2 shadow-sm flex flex-col justify-between min-h-[180px]">
      <div className="flex p-4">
        <ArrowTrendingUpIcon className="h-5 w-5 text-gray-700" />
        <h3 className="ml-2 text-sm font-medium">Investments</h3>
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
        <h3 className="ml-2 text-sm font-medium">Expenses</h3>
      </div>
      <div className="bg-white p-4 flex-1 flex flex-col justify-center items-center rounded-lg">
        <span className="text-xs text-gray-500 uppercase font-semibold">Total Expenses</span>
        <h2 className="text-2xl font-extrabold mt-1 text-gray-800">{formatCurrency(total)}</h2>
      </div>
    </div>
  );
}

export function CashInHandCard({ total, cash, bank }: { total: number; cash: number; bank: number }) {
  return (
    <div className="rounded-xl bg-blue-50 p-2 shadow-sm flex flex-col justify-between min-h-[180px]">
      <div className="flex p-4">
        <BanknotesIcon className="h-5 w-5 text-gray-700" />
        <h3 className="ml-2 text-sm font-medium">Cash in Hand</h3>
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
        <h3 className="ml-2 text-sm font-medium text-emerald-50">Business Net Capital</h3>
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
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
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
