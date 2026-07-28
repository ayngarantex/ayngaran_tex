import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // your Prisma client
import { formatCurrency } from '@/app/lib/utils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;
        // Count total invoices
        const numberOfInvoices = await prisma.invoice.count();

        // Count total customers
        const numberOfCustomers = await prisma.customers.count();

        // Get all invoices (only needed fields)
        const invoices = await prisma.invoice.findMany({
            where: {
                ...(startDate || endDate ? {
                    InvoiceDate: {
                        ...(startDate ? { gte: startDate } : {}),
                        ...(endDate ? { lte: endDate } : {}),
                    },
                } : {}),
            },
            select: {
                InvoiceAmount: true,
                ReceivedAmount: true,
            },
        });

        // Calculate totals manually
        let totalPaid = 0;
        let totalPending = 0;
        let totalInvoice = 0

        invoices.forEach((inv: any) => {
            const invoiceAmt = inv.InvoiceAmount ?? 0;
            const receivedAmt = inv.ReceivedAmount ?? 0;
            totalInvoice += invoiceAmt

            totalPaid += receivedAmt;
            totalPending += invoiceAmt - receivedAmt;
        });

        return NextResponse.json({
            numberOfInvoices,
            numberOfCustomers,
            totalInvoice: formatCurrency(totalInvoice),
            totalPaidInvoices: formatCurrency(totalPaid),
            totalPendingInvoices: formatCurrency(totalPending),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};