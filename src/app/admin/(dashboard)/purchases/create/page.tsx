import Form from '@/app/ui/purchases/create-form';
import { fetchAllSuppliers } from '@/app/lib/data';

export default async function Page() {
  const suppliers = await fetchAllSuppliers('All');

  return (
    <main className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create Purchase</h1>
      <Form suppliers={suppliers} />
    </main>
  );
}
