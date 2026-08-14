import EditForm from '@/app/ui/purchases/edit-form';
import { fetchAllSuppliers, fetchPurchaseById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const [purchase, suppliers] = await Promise.all([
    fetchPurchaseById(id),
    fetchAllSuppliers('All'),
  ]);

  if (!purchase) {
    notFound();
  }

  return (
    <main className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Purchase</h1>
      <EditForm purchase={purchase} suppliers={suppliers} />
    </main>
  );
}
