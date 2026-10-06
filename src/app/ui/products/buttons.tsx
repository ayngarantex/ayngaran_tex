"use client";
import { deleteProduct } from '@/app/api/node/product';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import CreateProductModal from '@/app/ui/products/CreateProductModal';

export function CreateProduct() {
  return <CreateProductModal />;
}

export function UpdateProduct({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/products/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteProduct({ id }: { id: string }) {

  const handleDelete = async () => {
    const res = await deleteProduct(id); //node query

    //prisma query

    // const productData = {
    //   Id: id,
    // };

    // const jsonBody = JSON.stringify({
    //   productData,
    // });

    // const res = await fetch(`/api/products`, {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: jsonBody,
    // });

    // const data = await res.json();
    // return

    redirect('/admin/products');
  }

  return (
    <>
      <button type="button" onClick={handleDelete} className="rounded-md border p-2 hover:bg-blue-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}
