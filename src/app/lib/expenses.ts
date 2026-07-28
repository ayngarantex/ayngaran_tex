import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

const ITEMS_PER_PAGE = 20;
export const fetchExpensesPage = async (query: string, startDate: string, endDate: string) => {
  try {
    let lowercaseQuery = query?.toLocaleLowerCase()
    const data = await prisma.expenses.count({
      orderBy: [
        {
          Date: 'desc',
        },
        {
          ExpenseId: 'desc',
        }
      ],
      where: {
        ...(startDate && endDate ? {
          InvoiceDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
          : {}),
        OR: [
          {
            Reason: { contains: lowercaseQuery },
          },
          {
            Type: { contains: lowercaseQuery },
          },
        ]
      },
    });
    const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
    return {
      count: data,
      totalPages: totalPages
    };
  } catch (error) {
    return []
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export const fetchExpenses = async (query: string, currentPage: number, startDate: string, endDate: string) => {
  try {
    let lowercaseQuery = query?.toLocaleLowerCase()

    const total = await prisma.expenses.count({
      orderBy: [
        {
          Date: 'desc',
        },
        {
          ExpenseId: 'desc',
        }
      ],
      where: {
        ...(startDate && endDate ? {
          InvoiceDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
          : {}),
        OR: lowercaseQuery ? [
          {
            Reason: { contains: lowercaseQuery },
          },
          {
            Type: { contains: lowercaseQuery },
          },
        ] : undefined
      },
    });
    const totalPages = Math.ceil(Number(total) / ITEMS_PER_PAGE);

    const data = await prisma.expenses.findMany({
      skip: (currentPage - 1) * ITEMS_PER_PAGE, // skip first page
      take: ITEMS_PER_PAGE,
      where: {
        ...(startDate && endDate ? {
          Date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
          : {}),

        OR: lowercaseQuery ? [
          {
            Reason: { contains: lowercaseQuery },
          },
          {
            Type: { contains: lowercaseQuery },
          },
        ] : undefined,
      },
      orderBy: [
        {
          Date: 'desc',
        },
        {
          ExpenseId: 'desc',
        }
      ],
    });

    const totals = await prisma.expenses.aggregate({
      _sum: {
        Amount: true
      },
      where: {
        ...(startDate && endDate ? {
          Date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
          : {}),

        OR: lowercaseQuery ? [
          {
            Reason: { contains: lowercaseQuery },
          },
          {
            Type: { contains: lowercaseQuery },
          },
        ] : undefined,
      },
    });

    const totalAmount = totals._sum.Amount ?? 0;

    return {
      expenses: data,
      count: total,
      totalPages: totalPages,
      totalAmount
    };

    // return data || [];
  } catch (error) {
    return []
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export const fetchExpenseById = async (id: number) => {
  try {
    const data = await prisma.expenses.findMany({
      where: {
        ExpenseId: id
      },
    })
    return data || [];
  } catch (error) {
    // return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    return [];
  }
}