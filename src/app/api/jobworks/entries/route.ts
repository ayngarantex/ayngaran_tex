import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Delete product
export async function DELETE(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { EntryId } = body;

    const products = await prisma.loom_entries.delete({
      where: { LoomEntryId: Number(EntryId) }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete entries" }, { status: 500 });
  }
};