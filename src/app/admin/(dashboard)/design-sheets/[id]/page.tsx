import { notFound } from 'next/navigation';
import { fetchDesignSheetById } from '@/app/api/node/design-sheets';
import DesignSheetView from '@/app/ui/design-sheets/design-sheet-view';

export default async function ViewDesignSheetPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ includeWidth?: string; includeNotes?: string }>;
}) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const sheet = await fetchDesignSheetById(Number(id));

  if (!sheet) {
    notFound();
  }

  const initialIncludeWidth = searchParams?.includeWidth !== 'false';
  const initialIncludeNotes = searchParams?.includeNotes !== 'false';

  return (
    <main className="w-full">
      <DesignSheetView
        sheet={sheet}
        initialIncludeWidth={initialIncludeWidth}
        initialIncludeNotes={initialIncludeNotes}
      />
    </main>
  );
}
