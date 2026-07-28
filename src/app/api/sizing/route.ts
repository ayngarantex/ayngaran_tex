import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Create invoice
export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { invoiceData, products, sizingYarn, payments } = body;
    const invoice = await prisma.sizing.create({
      data: {
        SupplierId: invoiceData.SupplierId,
        InvoiceNumber: invoiceData.InvoiceNumber,
        InvoiceDate: new Date(invoiceData.InvoiceDate),
        WarpType: invoiceData.WarpType,
        TaxPercentage: invoiceData.TaxPercentage,
        BeforeTax: invoiceData.BeforeTax,
        Cgst: invoiceData.Cgst,
        Sgst: invoiceData.Sgst,
        Igst: invoiceData.Igst,
        AfterTax: invoiceData.AfterTax,
        BillType: invoiceData.BillType,
        RoundOff: invoiceData.RoundOff,
        InvoiceAmount: invoiceData.InvoiceAmount,
        ReceivedAmount: invoiceData.ReceivedAmount,
        YarnId: invoiceData.YarnId,
        Color: invoiceData.Color,
        Meters: invoiceData.Meters,
        YarnSent: invoiceData.YarnSent,
        YarnUsed: invoiceData.YarnUsed,
        YarnBalance: invoiceData.YarnBalance,
        Price: invoiceData.Price,

        sizing_warp_details: {
          create: products.map((p: { meters: number; color: string; price: string, weight: string, loomId: string, date: string }) => ({
            Meters: p.meters,
            Color: p.color,
            DeliveredDate: p.date ? new Date(p.date) : null,
            Price: p.price ? parseFloat(String(p.price)) : null,
            Weight: p.weight ? parseFloat(String(p.weight)) : null,
            LoomId: p.loomId ? parseInt(p.loomId) : null,
          })),
        },
        sizing_yarn_details: {
          create: sizingYarn.map((p: { color: string; yarnSent: number; yarnUsed: number, yarnBalance: number }) => ({
            Color: p.color,
            YarnSent: p.yarnSent,
            YarnUsed: p.yarnUsed,
            YarnBalance: p.yarnBalance,
          })),
        },
        ...(payments.length > 0 && {
          sizing_payment_details: {
            create: payments.map((p: any) => ({
              Date: new Date(p.date),
              Amount: p.amount,
              Type: p.type,
              ReceivedBy: p.to
            })),
          },
        }),
      },
      include: { sizing_warp_details: true, sizing_yarn_details: true, sizing_payment_details: true },
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
    const { invoiceData, products, sizingYarn, payments } = body;
    await prisma.$transaction(async (tx) => {
      // Step 1: wipe old details
      await tx.sizing.update({
        where: { SizingId: invoiceData.SizingId },
        data: {
          sizing_yarn_details: { deleteMany: {} },
          sizing_payment_details: { deleteMany: {} },
        },
      });
      // await tx.sizing_warp_details.deleteMany({
      //   where: { SizingId: invoiceData.SizingId },
      // });
      const existingWarps = await tx.sizing_warp_details.findMany({
        where: { SizingId: invoiceData.SizingId },
        select: { WarpId: true },
      });

      const incomingWarpIds = products.filter((p: any) => p.warpId).map((p: any) => p.warpId);


      // Step 2: Find warps that should be removed
      const toRemove = existingWarps
        .map(w => w.WarpId)
        .filter(id => !incomingWarpIds.includes(id));

      // Step 3: Try safe delete for each
      for (const warpId of toRemove) {
        const used = await tx.warp_dc_details.findFirst({
          where: { WarpId: warpId },
        });

        if (used) {
          // Option A: Skip silently
          console.log(`Warp ${warpId} is used in warp_dc_details, skipping delete`);
          // Option B: throw new Error(`Warp ${warpId} cannot be deleted`)
        } else {
          await tx.sizing_warp_details.delete({
            where: { WarpId: warpId },
          });
        }
      }

      for (const p of products) {
        if (p.warpId) {
          // Existing Warp → update
          await tx.sizing_warp_details.update({
            where: { WarpId: p.warpId },
            data: {
              Meters: p.meters,
              Color: p.color,
              DeliveredDate: p.date ? new Date(p.date) : null,
              Price: p.price ? parseFloat(String(p.price)) : null,
              Weight: p.weight ? parseFloat(String(p.weight)) : null,
              LoomId: p.loomId ? parseInt(p.loomId) : null,
            },
          });
        } else {
          // New Warp → create
          await tx.sizing_warp_details.create({
            data: {
              SizingId: invoiceData.SizingId,
              Meters: p.meters,
              Color: p.color,
              DeliveredDate: p.date ? new Date(p.date) : null,
              Price: p.price ? parseFloat(String(p.price)) : null,
              Weight: p.weight ? parseFloat(String(p.weight)) : null,
              LoomId: p.loomId ? parseInt(p.loomId) : null,
            },
          });
        }
      }
    });

    const invoice = await prisma.sizing.update({
      where: { SizingId: invoiceData.SizingId },
      data: {
        SupplierId: invoiceData.SupplierId,
        InvoiceNumber: invoiceData.InvoiceNumber,
        InvoiceDate: new Date(invoiceData.InvoiceDate),
        WarpType: invoiceData.WarpType,
        TaxPercentage: invoiceData.TaxPercentage,
        BeforeTax: invoiceData.BeforeTax,
        Cgst: invoiceData.Cgst,
        Sgst: invoiceData.Sgst,
        Igst: invoiceData.Igst,
        AfterTax: invoiceData.AfterTax,
        BillType: invoiceData.BillType,
        RoundOff: invoiceData.RoundOff,
        InvoiceAmount: invoiceData.InvoiceAmount,
        ReceivedAmount: invoiceData.ReceivedAmount,
        YarnId: invoiceData.YarnId,
        Color: invoiceData.Color,
        Meters: invoiceData.Meters,
        YarnSent: invoiceData.YarnSent,
        YarnUsed: invoiceData.YarnUsed,
        YarnBalance: invoiceData.YarnBalance,
        Price: invoiceData.Price,
        // ...(exisintProducts.length && {
        //   sizing_warp_details: {
        //     create: products.map((p: { warpId: number, meters: number; color: string; price: string, weight: string }) => ({            
        //       WarpId: p.warpId,
        //       Meters: p.meters,
        //       Color: p.color,
        //       Price: parseFloat(String(p.price)),
        //       Weight: parseFloat(String(p.weight))
        //     })),        
        //   },
        // }),
        // ...(newProducts.length && {
        //   sizing_warp_details: {
        //     create: products.map((p: { warpId: number, meters: number; color: string; price: string, weight: string }) => ({            
        //       Meters: p.meters,
        //       Color: p.color,
        //       Price: parseFloat(String(p.price)),
        //       Weight: parseFloat(String(p.weight))
        //     })),        
        //   },
        // }),
        sizing_yarn_details: {
          create: sizingYarn.map((p: { color: string; yarnSent: number; yarnUsed: number, yarnBalance: number }) => ({
            Color: p.color,
            YarnSent: p.yarnSent,
            YarnUsed: p.yarnUsed,
            YarnBalance: p.yarnBalance,
          })),
        },
        ...(payments.length > 0 && {
          sizing_payment_details: {
            create: payments.map((p: any) => ({
              Date: new Date(p.date),
              Amount: p.amount,
              Type: p.type,
              ReceivedBy: p.to
            })),
          },
        }),
      },
      include: { sizing_warp_details: true, sizing_yarn_details: true, sizing_payment_details: true },
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
