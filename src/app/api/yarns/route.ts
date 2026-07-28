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
    const { invoiceData, products, payments } = body;
    const invoice = await prisma.yarns.create({
      data: {
        SupplierId: invoiceData.SupplierId,
        InvoiceNumber: invoiceData.InvoiceNumber,
        InvoiceDate: new Date(invoiceData.InvoiceDate),
        TaxPercentage: invoiceData.TaxPercentage,
        BeforeTax: invoiceData.BeforeTax,
        Cgst: invoiceData.Cgst,
        Sgst: invoiceData.Sgst,
        Igst: invoiceData.Igst,
        AfterTax: invoiceData.AfterTax,
        BillType: invoiceData.BillType,
        RoundOff: invoiceData.RoundOff,
        InvoiceAmount: invoiceData.InvoiceAmount,
        PaidAmount: invoiceData.PaidAmount,
        yarn_details: {
          create: products.map((p: { count: string; color: string; varient: string; bag: string; quantity: number; price: number }) => ({            
            Count: p.count,
            Color: p.color,
            Varient: p.varient,
            Bag: p.bag,
            Quantity: p.quantity,
            Price: parseFloat(String(p.price)),
            Total: p.quantity * parseFloat(String(p.price))
          })),        
        },
        ...(payments.length > 0 && {
          yarn_payment_details: {
            create: payments.map((p: any) => ({
              Date: new Date(p.date),
              Amount: p.amount,
              Type: p.type,
              ReceivedBy: p.to
            })),
          },
        }),
      },
      include: { yarn_details: true, yarn_payment_details: true },
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
    const { invoiceData, products, payments } = body;

    await prisma.$transaction(async (tx) => {
      // Step 1: wipe old details
      await tx.yarns.update({
        where: { YarnId: invoiceData.YarnId },
        data: {
          yarn_details: { deleteMany: {} },
          yarn_payment_details: { deleteMany: {} },
        },
      });
    });
    
    const invoice = await prisma.yarns.update({
      where: { YarnId: invoiceData.YarnId },
      data: {
        YarnId: invoiceData.YarnId,
        SupplierId: invoiceData.SupplierId,
        InvoiceNumber: invoiceData.InvoiceNumber,
        InvoiceDate: new Date(invoiceData.InvoiceDate),
        TaxPercentage: invoiceData.TaxPercentage,
        BeforeTax: invoiceData.BeforeTax,
        Cgst: invoiceData.Cgst,
        Sgst: invoiceData.Sgst,
        Igst: invoiceData.Igst,
        AfterTax: invoiceData.AfterTax,
        BillType: invoiceData.BillType,
        RoundOff: invoiceData.RoundOff,
        InvoiceAmount: invoiceData.InvoiceAmount,
        PaidAmount: invoiceData.PaidAmount,
        yarn_details: {
          create: products.map((p: { count: string; color: string; varient: string; bag: string; quantity: number; price: number }) => ({            
            Count: p.count,
            Color: p.color,
            Varient: p.varient,
            Bag: p.bag,
            Quantity: p.quantity,
            Price: parseFloat(String(p.price)),
            Total: p.quantity * parseFloat(String(p.price))
          })),        
        },
        ...(payments.length > 0 && {
          yarn_payment_details: {
            create: payments.map((p: any) => ({
              Date: new Date(p.date),
              Amount: p.amount,
              Type: p.type,
              ReceivedBy: p.to
            })),
          },
        }),
      },
      include: { yarn_details: true, yarn_payment_details: true },
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

    await prisma.yarn_details.deleteMany({
      where: { YarnId: invoiceData.YarnId },
    });

    await prisma.yarn_payment_details.deleteMany({
      where: { YarnId: invoiceData.YarnId },
    });

    const products = await prisma.yarns.delete({
      where: { YarnId: invoiceData.YarnId }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};
