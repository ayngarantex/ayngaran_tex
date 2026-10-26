import { notFound } from 'next/navigation';
import { fetchDesignSheetById } from '@/app/api/node/design-sheets';
import DesignSheetForm from '@/app/ui/design-sheets/design-sheet-form';

export default async function EditDesignSheetPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const sheet = await fetchDesignSheetById(Number(id));

  if (!sheet) {
    notFound();
  }

  return (
    <main className="w-full">
      <DesignSheetForm initialData={sheet} isEdit={true} />
    </main>
  );
}
