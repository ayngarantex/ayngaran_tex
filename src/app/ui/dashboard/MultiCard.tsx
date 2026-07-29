'use client';

import { salseData, yarnSalesData } from '@/app/api/node/dashboard';
import { formatCurrency } from '@/app/lib/utils';
import { BanknotesIcon, ClockIcon, UserGroupIcon, InboxIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default function MultiCardWrapper({ startDate, endDate, billType }: { startDate: string, endDate: string, billType: string }) {
  const [data, setData] = useState<any>({});
  const [yarnData, setYarnData] = useState<any>({});
  const [wagesData, setWagesData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await salseData(startDate, endDate, billType)
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    const fetchYarnData = async () => {
      try {
        const result = await yarnSalesData(startDate, endDate, billType)
        setYarnData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    const fetWagesData = async () => {
      try {
        const res = await fetch(`/api/dashboard/wagescards?startDate=${startDate}&endDate=${endDate}`);
        if (!res.ok) return;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await res.json();
          setWagesData(result);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    fetchYarnData();
    fetWagesData();
  }, [startDate, endDate, billType]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <CardNew title="Sales" total={data?.totalInvoiceAmount ?? 0} paid={data?.totalPaidAmount} pending={data?.totalPendingAmount ?? 0} />
      <CardNew title="Yarn" total={yarnData?.totalInvoiceAmount ?? 0} paid={yarnData?.totalPaidAmount} pending={yarnData?.totalPendingAmount ?? 0} />
      {/* <Wages title="Wages" total={wagesData?.totalPaid ?? 0} /> */}
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
    <div className="rounded-xl bg-blue-50 p-2 shadow-sm">
      <div className="flex p-4">
        <BanknotesIcon className="h-5 w-5 text-gray-700" />
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <div className='bg-white'>
        <div className='flex justify-between'>
          <p className={`truncate p-4 text-right text-2xl mb-1`}>Total</p>
          <p className={`truncate p-4 text-right text-2xl mb-1`}>{formatCurrency(Number(total))}</p>
        </div>
        <div className='flex justify-between'>
          <p className={`truncate p-4 text-right text-2xl mb-1`}>{title === 'Sales' ? 'Rec' : 'Paid'}</p>
          <p className={`truncate p-4 text-right text-2xl mb-1`}>{formatCurrency(Number(paid))}</p>
        </div>
        <div className='flex justify-between'>
          <p className={`truncate p-4 text-right text-2xl mb-1`}>Pend</p>
          <p className={`truncate p-4 text-right text-2xl text-red-600`}>{formatCurrency(Number(pending))}</p>
        </div>
      </div>
    </div>
  );
}

export function Wages({
  title,
  total
}: {
  title: string;
  total: number | string;
}) {
  return (
    <div className="rounded-xl bg-blue-50 p-2 shadow-sm">
      <div className="flex p-4">
        <BanknotesIcon className="h-5 w-5 text-gray-700" />
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <div className='bg-white'>
        <div className='flex justify-between'>
          <p className={`truncate p-4 text-right text-2xl mb-1`}>Paid</p>
          <p className={`truncate p-4 text-right text-2xl mb-1`}>{total}</p>
        </div>
      </div>
    </div>
  );
}
