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
    const { customerData } = body;
    const response = await prisma.customers.create({
      data: {
        CustomerName: customerData?.CustomerName,
        State: customerData?.State,
        Phone: customerData?.Phone,
        Mobile: customerData?.Mobile,
        Address: customerData?.Address,
        Address2: customerData?.Address2,
        GstNumber: customerData?.GstNumber,
        Agent: customerData?.Agent,
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create customer" }, { status: 500 });
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
    const { customerData } = body;
    const response = await prisma.customers.update({
      where: { CustomerId: customerData?.CustomerId },
      data: {
        CustomerName: customerData?.CustomerName,
        State: customerData?.State,
        Phone: customerData?.Phone,
        Mobile: customerData?.Mobile,
        Address: customerData?.Address,
        Address2: customerData?.Address2,
        GstNumber: customerData?.GstNumber,
        Agent: customerData?.Agent,
      },
    });

    return NextResponse.json(response, { status: 201 });
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
    const { customerData } = body;

    // let invoiceData = await prisma.invoice.deleteMany({
    //   where: { CustomerId: customerData.CustomerId },
    // });

    // await prisma.invoice_details.deleteMany({
    //   where: { InvoiceId: invoiceData?.InvoiceId },
    // });

    // await prisma.payment_details.deleteMany({
    //   where: { InvoiceId: invoiceData?.InvoiceId },
    // });

    const products = await prisma.customers.delete({
      where: { CustomerId: customerData.CustomerId }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};
