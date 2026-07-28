import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // your Prisma client

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'monthly'; // 'daily' or 'monthly'
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const invoices = await prisma.invoice.groupBy({
      by: ['InvoiceDate'],
      _count: { InvoiceId: true },
      _sum: { InvoiceAmount: true, ReceivedAmount: true },
      where: {
        ...(startDate || endDate ? {
          InvoiceDate: {
            gte: startDate,
            lte: endDate,
          },
        } : {}),
      },
    });

    // Aggregate by month
    const groupedData = invoices.reduce((acc: any, inv: any) => {
      const date = inv.InvoiceDate ? new Date(inv.InvoiceDate) : null;
      if (!date) return acc;

      let key = '';
      if (period === 'daily') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        key = `${month + '' + year}`; // e.g. "Jan-2025"
      }

      if (!acc[key]) acc[key] = { count: 0, received: 0, totalInvoice: 0 };

      acc[key].count += inv._count.InvoiceId;
      acc[key].received += inv._sum.ReceivedAmount || 0;
      acc[key].totalInvoice += inv._sum.InvoiceAmount || 0;

      return acc;
    }, {});

    const labels = Object.keys(groupedData);
    const sales = labels.map((k) => groupedData[k].count);
    const received = labels.map((k) => groupedData[k].received);
    const totalInvoice = labels.map((k) => groupedData[k].totalInvoice);

    return NextResponse.json({ labels, sales, received, totalInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
