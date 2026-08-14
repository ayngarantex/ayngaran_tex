import { NextResponse } from 'next/server';
import { fetchInvestments, createInvestment, updateInvestment, deleteInvestment } from '@/app/lib/investments';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = Number(searchParams.get('page') || '1');

    const result = await fetchInvestments(query, page, startDate, endDate);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch investments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const investmentData = body.investmentData || {};

    const result = await createInvestment(investmentData);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create investment" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const InvestmentId = Number(body.InvestmentId);
    const investmentData = body.investmentData;

    if (!InvestmentId || !investmentData) {
      return NextResponse.json({ error: "Missing InvestmentId or investmentData" }, { status: 400 });
    }

    const result = await updateInvestment(InvestmentId, investmentData);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update investment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const InvestmentId = Number(body.investmentData?.InvestmentId);

    if (!InvestmentId) {
      return NextResponse.json({ error: "Missing InvestmentId" }, { status: 400 });
    }

    const result = await deleteInvestment(InvestmentId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete investment" }, { status: 500 });
  }
}
