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
    const { supplierData } = body;
    const response = await prisma.suppliers.create({
      data: {
        Name: supplierData?.Name,
        Type: supplierData?.Type,
        AccountNumber: supplierData.AccountNumber,
        Bank: supplierData.Bank,
        IfscCode: supplierData.IfscCode,
        State: supplierData?.State,
        Phone: supplierData?.Phone,
        Mobile: supplierData?.Mobile,
        Address: supplierData?.Address,
        GstNumber: supplierData?.GstNumber,
        Agent: supplierData?.Agent,
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
    const { supplierData } = body;
    const response = await prisma.suppliers.update({
      where: { SupplierId: supplierData?.SupplierId },
      data: {
        Name: supplierData?.Name,
        Type: supplierData?.Type,
        AccountNumber: supplierData?.AccountNumber,
        Bank: supplierData?.Bank,
        IfscCode: supplierData?.IfscCode,
        State: supplierData?.State,
        Phone: supplierData?.Phone,
        Mobile: supplierData?.Mobile,
        Address: supplierData?.Address,
        GstNumber: supplierData?.GstNumber,
        Agent: supplierData?.Agent,
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
    const { supplierData } = body;

    // let invoiceData = await prisma.invoice.deleteMany({
    //   where: { CustomerId: supplierData.CustomerId },
    // });

    // await prisma.invoice_details.deleteMany({
    //   where: { InvoiceId: invoiceData?.InvoiceId },
    // });

    // await prisma.payment_details.deleteMany({
    //   where: { InvoiceId: invoiceData?.InvoiceId },
    // });

    const products = await prisma.suppliers.delete({
      where: { SupplierId: supplierData.SupplierId }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};
