import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { fetchExpenses } from '@/app/lib/expenses';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const page = Number(searchParams.get('page') || '1');

  const data = await fetchExpenses(query, page, startDate, endDate);
  return NextResponse.json(data, { status: 201 });
}

// Create invoice
export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { expensesData } = body;
    const invoice = await prisma.expenses.createMany({
      data: expensesData.map(
        (p: { date: string; reason: number; type: number, amount: string }) => ({            
          Date: new Date(p.date),
          Reason: p.reason,
          Type: p.type,
          Amount: parseFloat(p.amount),
        })
      ),
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 });
  }
}

// Update invoice
export async function PUT(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { ExpenseId, expanseData } = body;
    
    const invoice = await prisma.expenses.update({
      where: { ExpenseId: ExpenseId },
      data: {
        Date: new Date(expanseData.Date),
        Reason: expanseData.Reason,
        Type: expanseData.Type,
        Amount: parseFloat(expanseData.Amount),
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 });
  }
}

// Delete Invoice
export async function DELETE(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { expensesData } = body;

    const products = await prisma.expenses.delete({
      where: { ExpenseId: expensesData.ExpenseId }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};
