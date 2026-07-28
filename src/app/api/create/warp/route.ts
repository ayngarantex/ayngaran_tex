import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entries = Array.isArray(body?.entries) ? body.entries : [];

    const created = [];

    for (const entry of entries) {
      const { date, type, details, weight, loomId, babbin } = entry;
      if (!date && !type && !details && !loomId && (weight === undefined || weight === null)) continue;

      const createdEntry = await prisma.loom_entries.create({
        data: {
          Date: date ? new Date(date) : undefined,
          Type: type ?? null,
          Details: details ?? null,
          Weight: typeof weight === 'number' ? weight : Number(weight) || 0,
          LoomId: loomId ? Number(loomId) : null,
          BabbinCount: typeof babbin === 'number' ? babbin : Number(babbin) || 0,
        },
      });

      created.push(createdEntry);
    }

    return NextResponse.json({ success: true, created: created.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { entries } = body;
    const response = await prisma.loom_entries.update({
      where: { LoomEntryId: entries?.LoomEntryId },
      data: {
        Date: entries?.date ? new Date(entries?.date) : undefined,
        Type: entries?.type,
        Details: entries?.details,
        Weight: entries?.weight,
        LoomId: entries?.loomId,
        BabbinCount: typeof entries?.babbin === 'number' ? entries?.babbin : Number(entries?.babbin) || 0,
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 });
  }
}
