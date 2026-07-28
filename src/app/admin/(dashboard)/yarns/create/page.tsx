import Form from '@/app/ui/yarns/create-form';
import { fetchAllCustomers, fetchAllProducts, fetchAllSuppliers } from '@/app/lib/data';
 
export default async function Page() {
  const suppliers = await fetchAllSuppliers('Yarn');

  return (
    <main>
      <Form suppliers={suppliers} />
    </main>
  );
}