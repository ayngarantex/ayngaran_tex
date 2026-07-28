// /app/api/warp-details/route.ts

import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sizingId = Number(searchParams.get('sizingId'));
  const loomId = Number(searchParams.get('loomId'));

  const data = await prisma.sizing_warp_details.findMany({
    where: {
      SizingId: sizingId,
      LoomId: loomId
    }
  });

  return NextResponse.json(data);
}