import { fetchAllLooms } from '@/app/lib/data';
import WarpMultiForm from './WarpMultiForm';

export default async function Page(props: {
  searchParams?: Promise<{
    loomId?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const loomId = Number(searchParams?.loomId || 0);
  const looms = await fetchAllLooms();


  const createItems = [
    {
      key: 'warp',
      title: 'Warp Entries',
      description: 'Add multiple warp delivery entries for a loom.',
      component: <WarpMultiForm looms={looms} loomId={loomId} />,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Loom Entries</h1>
        <p className="text-sm text-slate-500">Select an entry type and add multiple records at once.</p>
      </div>

      {createItems.map((item) => (
        <div
          key={item.key}
        >
          <div className="mt-4">{item.component}</div>
        </div>
      ))}
    </div>
  );
}
