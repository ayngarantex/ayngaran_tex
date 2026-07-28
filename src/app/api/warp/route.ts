import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Update invoice
export async function PUT(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { invoiceData, products } = body;

    await prisma.$transaction(async (tx) => {
      await tx.warp_dc_details.deleteMany({
        where: { WarpId: invoiceData.WarpId },
      });
    });

    let inputs: any = {
      LoomName: invoiceData.LoomName,
      LoomNumber: invoiceData.LoomNumber,
      warp_dc_details: {
        create: products.map((p: { dc: number; count: number; color: string; date: string, piece: number, weight: string }) => ({
          Dc: p.dc,
          Piece: p.piece,
          Count: p.count,
          Color: p.color,
          Date: new Date(p.date),
          Weight: p.weight,
        })),
      },
    }
    if (invoiceData?.StartDate) {
      inputs.StartDate = new Date(invoiceData.StartDate) || "";
    }
    if (invoiceData?.EndDate) {
      inputs.CompletedDate = new Date(invoiceData.EndDate) || "";
    }
    const invoice = await prisma.sizing_warp_details.update({
      where: { WarpId: invoiceData.WarpId },
      data: inputs,
      include: { warp_dc_details: true },
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
    const { invoiceData } = body;

    await prisma.sizing_yarn_details.deleteMany({
      where: { SizingId: invoiceData.SizingId },
    });

    await prisma.sizing_warp_details.deleteMany({
      where: { SizingId: invoiceData.SizingId },
    });

    await prisma.sizing_payment_details.deleteMany({
      where: { SizingId: invoiceData.SizingId }
    });

    const sizing = await prisma.sizing.delete({
      where: { SizingId: invoiceData.SizingId }
    });

    return NextResponse.json(sizing, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};
