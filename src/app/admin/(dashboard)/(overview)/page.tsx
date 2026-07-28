'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import Financialyear from '@/app/lib/financialyear';
import { formatCurrency } from '@/app/lib/utils';

// Lazy load the MultiCardWrapper
const MultiCardWrapper = dynamic(() => import('@/app/ui/dashboard/MultiCard'), {
  ssr: false,
  loading: () => <MultiCardSkeleton />,
});

const SalesChartWrapper = dynamic(() => import('@/app/ui/dashboard/salse-chart'), {
  ssr: false,
  loading: () => <div className="p-4 bg-white rounded-lg shadow-md text-center">loading Monthly Salse Chart...</div>
});

const YarnChartWrapper = dynamic(() => import('@/app/ui/dashboard/yarn-chart'), {
  ssr: false,
  loading: () => <div className="p-4 bg-white rounded-lg shadow-md text-center">loading Monthly Purchase Chart...</div>
});

// Skeleton component for the cards
function MultiCardSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-blue-50 p-2 shadow-sm"
        >
          <div className="flex p-4">
            <h3 className="ml-2 text-sm font-medium">Title</h3>
          </div>
          <div className='bg-white'>
            <div className='flex justify-between'>
              <p className={`truncate p-4 text-right text-2xl mb-1`}>Total</p>
              <p className={`truncate p-4 text-right text-2xl mb-1`}>{formatCurrency(0)}</p>
            </div>
            <div className='flex justify-between'>
              <p className={`truncate p-4 text-right text-2xl mb-1`}>Sales</p>
              <p className={`truncate p-4 text-right text-2xl mb-1`}>{formatCurrency(0)}</p>
            </div>
            <div className='flex justify-between'>
              <p className={`truncate p-4 text-right text-2xl mb-1`}>Pend</p>
              <p className={`truncate p-4 text-right text-2xl text-red-600`}>{formatCurrency(0)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page({ searchParams }: any) {
  const [params, setParams] = useState({
    startDate: '',
    endDate: '',
    billType: '',
  });

  useEffect(() => {
    (async () => {
      const resolved = await searchParams;
      setParams({
        startDate: resolved?.startDate || '',
        endDate: resolved?.endDate || '',
        billType: resolved?.billType || '',
      });
    })();
  }, [searchParams]);

  return (
    <div className="w-full">
      <h2 className={`mb-4 text-xl md:text-2xl`}>
        Dashbaord
      </h2>
      <div className="my-4 flex items-center justify-between gap-2 md:mt-8">
        <div className='flex w-1/2'>
          <div className='w-3/4 pl-2'>
            <Financialyear
              hidePage={true}
            />
          </div>
        </div>
      </div>

      <MultiCardWrapper startDate={params.startDate} endDate={params.endDate} billType={params.billType} />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <SalesChartWrapper startDate={params.startDate} endDate={params.endDate} billType={params.billType} />

        <YarnChartWrapper startDate={params.startDate} endDate={params.endDate} billType={params.billType} />
      </div>
    </div>
  );
}

