import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

const ITEMS_PER_PAGE = 20;
// Create product
export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body?.fetch === 'get') {
      const { query, currentPage, startDate, endDate } = body;

      const where: any = {};

      if (query) {
        where.CustomerName = { contains: query, mode: "insensitive" };
      }

      if (startDate) {
        where.InvoiceDate = {
          gte: new Date(startDate),
          ...(endDate && { lte: new Date(endDate) }),
        };
      }

      const invoices = await prisma.invoice.findMany({
        where,
        orderBy: { InvoiceDate: "desc" },
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      });

      const total = await prisma.invoice.count({ where });

      return NextResponse.json({ invoices, total });

    } else {
      const { productData } = body;
      const products = await prisma.products.create({
        data: {
          Name: productData.Name,
          HSNCode: productData.HSNCode
        },
      });
      return NextResponse.json(products, { status: 201 });
    }

  } catch (error: any) {
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
    const { productData } = body;

    const products = await prisma.products.update({
      where: { Id: productData.Id },
      data: {
        Name: productData.Name,
        HSNCode: productData.HSNCode
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

    const products = await prisma.products.delete({
      where: { Id: productData.Id }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete products" }, { status: 500 });
  }
};