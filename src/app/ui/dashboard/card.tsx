'use client';

import { BanknotesIcon, ClockIcon, UserGroupIcon, InboxIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default function CardWrapper() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/cards');
        if (!res.ok) return;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Card title="Sales" value={data?.totalInvoice ?? '-'} type="collected" />
      <Card title="Received" value={data?.totalPaidInvoices ?? '-'} type="collected" />
      <Card title="Pending" value={data?.totalPendingInvoices ?? '-'} type="pending" />
      <Card title="Total Invoices" value={data?.numberOfInvoices ?? '-'} type="invoices" />
      <Card title="Total Customers" value={data?.numberOfCustomers ?? '-'} type="customers" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-white p-2 shadow-xs border border-slate-200">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-slate-700" /> : null}
        <h3 className="text-sm font-medium text-slate-800">{title}</h3>
      </div>
      <p
        className={`
          truncate rounded-xl bg-slate-50 px-4 py-8 text-center text-2xl font-bold text-slate-900`}
      >
        {value}
      </p>
    </div>
  );
}
