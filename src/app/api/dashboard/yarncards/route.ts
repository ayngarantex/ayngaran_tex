import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // your Prisma client
import { formatCurrency } from '@/app/lib/utils';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        // Count total invoices
        const numberOfInvoices = await prisma.yarns.count();
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;

        // Get all invoices (only needed fields)
        const invoices = await prisma.yarns.findMany({
            where: {
                ...(startDate || endDate ? {
                    InvoiceDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                } : {}),
            },
            select: {
                InvoiceAmount: true,
                PaidAmount: true,
            },
        });

        // Calculate totals manually
        let totalPaid = 0;
        let totalPending = 0;
        let totalInvoice = 0

        invoices.forEach(inv => {
            const invoiceAmt = inv.InvoiceAmount ?? 0;
            const receivedAmt = inv.PaidAmount ?? 0;
            totalInvoice += invoiceAmt

            totalPaid += receivedAmt;
            totalPending += invoiceAmt - receivedAmt;
        });

        return NextResponse.json({
            numberOfInvoices,
            totalInvoice: formatCurrency(totalInvoice),
            totalPaidInvoices: formatCurrency(totalPaid),
            totalPendingInvoices: formatCurrency(totalPending),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};