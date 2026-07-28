'use client';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { fetchSalesChartDetails } from '@/app/api/node/dashboard';

// Dynamically import ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
}) as any;

export default function SalesChart({ startDate, endDate, billType }: { startDate: string, endDate: string, billType: string }) {
  const [labels, setLabels] = useState<string[]>([]);
  const [sales, setSales] = useState<number[]>([]);
  const [received, setReceived] = useState<number[]>([]);
  const [totalInvoice, setTotalInvoice] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchSalesChartDetails(startDate, endDate, billType);
      setLabels(result?.map((item: any) => item.month) || []);
      setSales(result?.map((item: any) => item.totalCount) || []);
      setReceived(result?.map((item: any) => item.totalReceived) || []);
      setTotalInvoice(result?.map((item: any) => item.totalSales) || []);
    };
    fetchData();
  }, [startDate, endDate, billType]);



  const options = {
    chart: { id: 'sales-amount', toolbar: { show: false } },
    xaxis: { categories: labels },
    yaxis: [
      {
        title: { text: 'Sales' },
      },
      {
        opposite: true,
        title: { text: 'Amount (₹)' },
      },
    ],
    stroke: { width: [3, 3, 5] },
    title: {
      text: 'Monthly Sales',
      align: 'center',
    },
  };

  const series = [
    {
      name: 'Count',
      type: 'column',
      data: sales,
    },
    {
      name: 'Amt Sales',
      type: 'column',
      data: totalInvoice,
    },
    {
      name: 'Amt Received',
      type: 'line',
      data: received,
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Chart options={options} series={series} height={350} />
    </div>
  );
}
