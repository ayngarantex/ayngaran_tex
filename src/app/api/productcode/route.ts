import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PUT(req: Request) {
  let body;

  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  try {
    const { CustomerId, products } = body;

    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Delete all previous records for this customer
      await tx.customer_product_code.deleteMany({
        where: { CustomerId }
      });

      // Step 2: Insert new records (only if list is not empty)
      if (products.length > 0) {
        await tx.customer_product_code.createMany({
          data: products.map((p: any) => ({
            CustomerId,
            ProductId: p.id,
            ProductCode: p.code,
          })),
        });
      }

      return { success: true };
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product codes" },
      { status: 500 }
    );
  }
}
