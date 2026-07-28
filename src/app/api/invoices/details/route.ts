// /app/api/warp-details/route.ts

import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const invoiceId = Number(searchParams.get('invoiceId'));

  const data = await prisma.invoice_details.findMany({
    where: {
      InvoiceId: invoiceId,
    }
  });

  return NextResponse.json(data);
}