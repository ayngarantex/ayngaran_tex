import Form from '@/app/ui/investments/edit-form';
import { fetchInvestmentById } from '@/app/lib/investments';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const investment = await fetchInvestmentById(Number(id));

  if (!investment) {
    notFound();
  }

  return (
    <main className="w-full">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Investment</h1>
      </div>
      <Form investment={investment} />
    </main>
  );
}
