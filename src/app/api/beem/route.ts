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
    const beem = await prisma.beem_details.create({
      data: {
        LoomId: loomData?.LoomId || '',
        Type: loomData?.Type || '',
        Loaded: parseInt(loomData?.Loaded || 0),
        Running: parseInt(loomData?.Running || 0),
        Empty: parseInt(loomData?.Empty || 0),
        Return: parseInt(loomData?.Return || 0),
        Count: parseInt(loomData?.Count || 0),
        Date: new Date(loomData.Date),
      },
    });
    return NextResponse.json(beem, { status: 201 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message || "Failed to create beem" }, { status: 500 });
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

    const products = await prisma.beem_details.update({
      where: { BeemId: loomData.BeemId },
      data: {
        LoomId: loomData?.LoomId || '',
        Type: loomData?.Type || '',
        Loaded: parseInt(loomData?.Loaded || 0),
        Running: parseInt(loomData?.Running || 0),
        Empty: parseInt(loomData?.Empty || 0),
        Return: parseInt(loomData?.Return || 0),
        Count: parseInt(loomData?.Count || 0),
        Date: new Date(loomData.Date),
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

    const products = await prisma.beem_details.delete({
      where: { BeemId: productData.BeemId }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};