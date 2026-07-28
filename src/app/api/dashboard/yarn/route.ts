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

    const yarnsData = await prisma.yarns.groupBy({
      by: ['InvoiceDate'],
      _count: { YarnId: true },
      _sum: { InvoiceAmount: true, PaidAmount: true },
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
    const invoiceGrouped = yarnsData.reduce((acc: any, inv) => {
      const date = inv.InvoiceDate ? new Date(inv.InvoiceDate) : null;
      if (!date) return acc;

      let key = '';
      if (period === 'daily') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        key = `${month}`; // e.g. "Jan-2025"
      }

      if (!acc[key]) acc[key] = { count: 0, paid: 0, totalInvoice: 0 };

      acc[key].count += inv._count.YarnId;
      acc[key].paid += inv._sum.PaidAmount || 0;
      acc[key].totalInvoice += inv._sum.InvoiceAmount || 0;

      return acc;
    }, {});

    const payment = await prisma.yarn_payment_details.findMany({
      where: {
        ...(startDate || endDate ? {
          Date: {
            gte: startDate,
            lte: endDate,
          },
        } : {}),
      },
      select: { Date: true, YarnId: true, Amount: true },
    });

    // Aggregate by month
    const grouped = payment.reduce((acc: any, inv) => {
      const date = inv.Date ? new Date(inv.Date) : null;
      if (!date) return acc;

      const dateKey = date.toLocaleString('default', { month: 'short' });

      if (!acc[dateKey]) acc[dateKey] = { count: 0, sum: 0 };

      acc[dateKey].count += 1;
      acc[dateKey].sum += parseFloat(inv.Amount || '0'); // ✅ use inv.Amount

      return acc;
    }, {});


    const result = Object.entries(grouped).map(([Date, { sum, count }]: any) => ({
      Date,
      _sum: { Amount: sum },
    }));

    const groupedData = result.reduce((acc: any, inv) => {
      const dateKey = inv.Date

      if (!acc[dateKey]) acc[dateKey] = { paid: 0 };
      acc[dateKey].paid += inv._sum.Amount || 0;

      return acc;
    }, {});

    const labels = Object.keys(invoiceGrouped);
    const purchase = labels.map((k) => invoiceGrouped[k].count);
    const paid = labels.map((k) => groupedData[k]?.paid || 0);
    const totalInvoice = labels.map((k) => invoiceGrouped[k].totalInvoice);

    return NextResponse.json({ labels, purchase, paid, totalInvoice, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
