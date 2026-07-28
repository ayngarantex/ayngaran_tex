import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Create product
export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { loomData } = body;
    const products = await prisma.loom_details.create({
      data: {
        LoomName: loomData.LoomName,
        ContactNumber: loomData.ContactNumber,
        Address: loomData.Address,
        Count: loomData.Count
      },
    });
    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message || "Failed to create products" }, { status: 500 });
  }
}

// Update product
export async function PUT(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { loomData } = body;

    const products = await prisma.loom_details.update({
      where: { LoomId: loomData.LoomId },
      data: {
        LoomName: loomData.LoomName,
        Address: loomData.Address,
        ContactNumber: loomData.ContactNumber,
        Count: loomData.Count
      },
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update products" }, { status: 500 });
  }
}

// Delete product
export async function DELETE(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { productData } = body;

    const products = await prisma.loom_details.delete({
      where: { LoomId: productData.LoomId }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};