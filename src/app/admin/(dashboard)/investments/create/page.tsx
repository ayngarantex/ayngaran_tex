import Form from '@/app/ui/investments/create-form';

export default function Page() {
  return (
    <main className="w-full">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Investment</h1>
      </div>
      <Form />
    </main>
  );
}
