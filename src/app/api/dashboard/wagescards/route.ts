import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // your Prisma client
import { formatCurrency } from '@/app/lib/utils';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;
        // Count total invoices
        const numberOfInvoices = await prisma.expenses.count();

        // Get all invoices (only needed fields)
        const invoices = await prisma.expenses.findMany({
            where: {
                ...(startDate || endDate ? {
                    Date: {
                        gte: startDate,
                        lte: endDate,
                    },
                } : {}),
                Type: {
                    not: 'yarn',
                },
            },
            select: {
                Amount: true,
            },
        });

        // Calculate totals manually
        let totalPaid = 0;

        invoices.forEach(inv => {
            const amount = inv.Amount ?? 0;
            totalPaid += amount
        });

        return NextResponse.json({
            numberOfInvoices,
            totalPaid: formatCurrency(totalPaid),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};