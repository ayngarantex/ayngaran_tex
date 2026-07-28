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
    const invoice = await prisma.invoice.create({
      data: {
        CustomerId: invoiceData.CustomerId,
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
        ReceivedAmount: invoiceData.ReceivedAmount,
        invoice_details: {
          create: products.map((p: { product: string; quantity: number; price: number }) => ({            
            ItemId: p.product,
            Quantity: p.quantity,
            Price: parseFloat(String(p.price)),
            Total: p.quantity * parseFloat(String(p.price))
          })),        
        },
        ...(payments.length > 0 && {
          payment_details: {
            create: payments.map((p: any) => ({
              Date: new Date(p.date),
              Amount: p.amount,
              Type: p.type,
              ReceivedBy: p.to
            })),
          },
        }),
      },
      include: { invoice_details: true, payment_details: true},
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
      await tx.invoice.update({
        where: { InvoiceId: invoiceData.InvoiceId },
        data: {
          invoice_details: { deleteMany: {} },
          payment_details: { deleteMany: {} },
        },
      });
    });
    
    const invoice = await prisma.invoice.update({
      where: { InvoiceId: invoiceData.InvoiceId },
      data: {
        InvoiceId: invoiceData.InvoiceId,
        CustomerId: invoiceData.CustomerId,
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
        ReceivedAmount: invoiceData.ReceivedAmount,
        invoice_details: {
          create: products.map((p: { product: string; quantity: number; price: number }) => ({            
            ItemId: p.product,
            Quantity: p.quantity,
            Price: parseFloat(String(p.price)),
            Total: p.quantity * parseFloat(String(p.price))
          })),        
        },
        payment_details: {
          create: payments.map((p: any) => ({
            Date: new Date(p.date),
            Amount: p.amount,
            Type: p.type,
            ReceivedBy: p.to
          })),
        },
      },
      include: { invoice_details: true, payment_details: true},
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

    await prisma.invoice_details.deleteMany({
      where: { InvoiceId: invoiceData.InvoiceId },
    });

    await prisma.payment_details.deleteMany({
      where: { InvoiceId: invoiceData.InvoiceId },
    });

    const products = await prisma.invoice.delete({
      where: { InvoiceId: invoiceData.InvoiceId }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};
