'use client';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { fetchYarnPurchaseDetails } from '@/app/api/node/dashboard';

// Dynamically import ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
}) as any;

export default function YarnChart({ startDate, endDate, billType }: { startDate: string, endDate: string, billType: string }) {
  const [labels, setLabels] = useState<string[]>([]);
  const [purchase, setPurchase] = useState<number[]>([]);
  const [paid, setPaid] = useState<number[]>([]);
  const [totalInvoice, setTotalInvoice] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchYarnPurchaseDetails(startDate, endDate, billType);
      setLabels(result?.map((item: any) => item.month) || []);
      setPurchase(result?.map((item: any) => item.totalCount) || []);
      setPaid(result?.map((item: any) => item.totalPaid) || []);
      setTotalInvoice(result?.map((item: any) => item.totalPurchase) || []);
    };
    fetchData();
  }, [startDate, endDate, billType]);



  const options = {
    chart: { id: 'purchase-amount', toolbar: { show: false } },
    xaxis: { categories: labels },
    yaxis: [
      {
        title: { text: 'Purchase' },
      },
      {
        opposite: true,
        title: { text: 'Amount (₹)' },
      },
    ],
    stroke: { width: [3, 3, 5] },
    title: {
      text: 'Yarn Purchase',
      align: 'center',
    },
  };

  const series = [
    {
      name: 'Count',
      type: 'column',
      data: purchase,
    },
    {
      name: 'Amt Purchase',
      type: 'column',
      data: totalInvoice,
    },
    {
      name: 'Amt Paid',
      type: 'line',
      data: paid,
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Chart options={options} series={series} height={350} />
    </div>
  );
}
