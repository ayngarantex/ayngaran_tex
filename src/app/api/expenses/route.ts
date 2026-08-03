import { NextResponse } from 'next/server';
import { fetchExpenses, createExpenses, updateExpense, deleteExpense } from '@/app/lib/expenses';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = Number(searchParams.get('page') || '1');

    const result = await fetchExpenses(query, page, startDate, endDate);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expensesData = body.expensesData || [];

    const result = await createExpenses(expensesData);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create expenses" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const ExpenseId = Number(body.ExpenseId);
    const expanseData = body.expanseData;

    if (!ExpenseId || !expanseData) {
      return NextResponse.json({ error: "Missing ExpenseId or expanseData" }, { status: 400 });
    }

    const result = await updateExpense(ExpenseId, expanseData);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const ExpenseId = Number(body.expensesData?.ExpenseId);

    if (!ExpenseId) {
      return NextResponse.json({ error: "Missing ExpenseId" }, { status: 400 });
    }

    const result = await deleteExpense(ExpenseId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete expense" }, { status: 500 });
  }
}
