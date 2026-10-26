import { notFound } from 'next/navigation';
import { fetchDesignSheetById } from '@/app/api/node/design-sheets';
import DesignSheetView from '@/app/ui/design-sheets/design-sheet-view';

export default async function ViewDesignSheetPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const sheet = await fetchDesignSheetById(Number(id));

  if (!sheet) {
    notFound();
  }

  return (
    <main className="w-full">
      <DesignSheetView sheet={sheet} />
    </main>
  );
}
