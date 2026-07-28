import { fetchLooms } from '@/app/api/node/looms';
import Form from '@/app/ui/beem/create-form';
export default async function Page() {
  const looms = await fetchLooms("", 0);
  return (
    <main>
      <Form looms={looms} />
    </main>
  );
}