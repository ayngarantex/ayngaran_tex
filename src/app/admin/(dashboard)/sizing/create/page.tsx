import Form from '@/app/ui/sizing/create-form';
import { fetchYarns, fetchAllSuppliers, fetchAllLooms } from '@/app/lib/data';

export default async function Page() {
  const suppliers = await fetchAllSuppliers('Sizing');
  const yarns = await fetchYarns("", 0, "", "", "", "");
  const looms = await fetchAllLooms();

  return (
    <main>
      <Form suppliers={suppliers} yarns={yarns} looms={looms} />
    </main>
  );
}