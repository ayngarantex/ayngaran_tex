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
    const { invoiceData, products, retrunProducts, payments } = body;
    const invoice = await prisma.invoice.create({
      data: {
        CustomerId: Number(invoiceData.CustomerId),
        InvoiceNumber: invoiceData.InvoiceNumber,
        InvoiceType: invoiceData.InvoiceType,
        InvoiceDate: new Date(invoiceData.InvoiceDate),
        EwayBillNumber: invoiceData.EwayBillNumber,
        TaxPercentage: invoiceData.TaxPercentage,
        BeforeTax: invoiceData.BeforeTax,
        Cgst: invoiceData.Cgst,
        Sgst: invoiceData.Sgst,
        Igst: invoiceData.Igst,
        AfterTax: invoiceData.AfterTax,
        BillType: invoiceData.BillType,
        RoundOff: invoiceData.RoundOff,
        Discount: invoiceData.Discount,
        InvoiceAmount: invoiceData.InvoiceAmount,
        ReceivedAmount: invoiceData.ReceivedAmount,
        invoice_details: {
          create: products.map((p: { product: string; productName: string; quantity: number; price: number, type: string }) => ({
            ItemId: Number(p.product),
            Quantity: p.quantity,
            ProductName: p.productName,
            Price: parseFloat(String(p.price)),
            Total: p.quantity * parseFloat(String(p.price)),
            Type: p.type
          })),
        },
        ...(retrunProducts.length > 0 && {
          invoice_return_details: {
            create: retrunProducts.map((p: { product: string; quantity: number; price: number, type: string }) => ({
              ItemId: p.product,
              Quantity: p.quantity,
              Price: parseFloat(String(p.price)),
              Total: p.quantity * parseFloat(String(p.price)),
              Type: p.type
            })),
          },
        }),
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
      include: { invoice_details: true, payment_details: true, invoice_return_details: true },
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
    const { invoiceData, products, retrunProducts, payments } = body;

    await prisma.$transaction(async (tx) => {
      // Step 1: wipe old details
      await tx.invoice.update({
        where: { InvoiceId: invoiceData.InvoiceId },
        data: {
          invoice_details: { deleteMany: {} },
          payment_details: { deleteMany: {} },
          invoice_return_details: { deleteMany: {} },
        },
      });
    });

    const invoice = await prisma.invoice.update({
      where: { InvoiceId: invoiceData.InvoiceId },
      data: {
        InvoiceId: invoiceData.InvoiceId,
        CustomerId: invoiceData.CustomerId,
        InvoiceNumber: invoiceData.InvoiceNumber,
        InvoiceType: invoiceData.InvoiceType,
        InvoiceDate: new Date(invoiceData.InvoiceDate),
        EwayBillNumber: invoiceData.EwayBillNumber,
        TaxPercentage: invoiceData.TaxPercentage,
        BeforeTax: invoiceData.BeforeTax,
        Cgst: invoiceData.Cgst,
        Sgst: invoiceData.Sgst,
        Igst: invoiceData.Igst,
        AfterTax: invoiceData.AfterTax,
        BillType: invoiceData.BillType,
        RoundOff: invoiceData.RoundOff,
        Discount: invoiceData.Discount,
        InvoiceAmount: invoiceData.InvoiceAmount,
        ReceivedAmount: invoiceData.ReceivedAmount,
        invoice_details: {
          create: products.map((p: { product: string; productName: string; quantity: number; price: number, type: string }) => ({
            ItemId: p.product,
            ProductName: p.productName,
            Quantity: p.quantity,
            Price: parseFloat(String(p.price)),
            Total: p.quantity * parseFloat(String(p.price)),
            Type: p.type
          })),
        },
        ...(retrunProducts.length > 0 && {
          invoice_return_details: {
            create: retrunProducts.map((p: { product: string; productName: string; quantity: number; price: number, type: string }) => ({
              ItemId: p.product,
              ProductName: p.productName,
              Quantity: p.quantity,
              Price: parseFloat(String(p.price)),
              Total: p.quantity * parseFloat(String(p.price)),
              Type: p.type
            })),
          },
        }),
        payment_details: {
          create: payments.map((p: any) => ({
            Date: new Date(p.date),
            Amount: p.amount,
            Type: p.type,
            ReceivedBy: p.to
          })),
        },
      },
      include: { invoice_details: true, payment_details: true, invoice_return_details: true },
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

    // Delete child tables first
    await prisma.invoice_details.deleteMany({
      where: { InvoiceId: invoiceData.InvoiceId },
    });

    await prisma.payment_details.deleteMany({
      where: { InvoiceId: invoiceData.InvoiceId },
    });

    await prisma.invoice_return_details.deleteMany({
      where: { InvoiceId: invoiceData.InvoiceId },
    });

    // Delete the invoice itself using deleteMany to avoid FK constraint errors
    await prisma.invoice.deleteMany({
      where: { InvoiceId: invoiceData.InvoiceId },
    });

    return NextResponse.json(
      { message: "Invoice deleted successfully" },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete invoice" },
      { status: 500 }
    );
  }
}