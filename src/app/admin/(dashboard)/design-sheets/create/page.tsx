import DesignSheetForm from '@/app/ui/design-sheets/design-sheet-form';

export default function CreateDesignSheetPage() {
  return (
    <main className="w-full">
      <DesignSheetForm isEdit={false} />
    </main>
  );
}
