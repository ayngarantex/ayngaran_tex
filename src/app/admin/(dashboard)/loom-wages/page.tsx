import { fetchLoomWagesConsolidated } from '@/app/api/node/loom-wages';
import { fetchLooms } from '@/app/api/node/looms';
import LoomWagesTable from '@/app/ui/loom-wages/table';

export default async function Page(props: {
    searchParams?: Promise<{
        query?: string;
        loomId?: string;
        startDate?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const loomId = searchParams?.loomId || '';
    const startDate = searchParams?.startDate || '2026-09-27';

    const looms = await fetchLooms('', 0);
    const records = await fetchLoomWagesConsolidated(query, loomId, startDate);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Loom Wages & DC Reconciliation</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Consolidated wages based on received dhoties from warp summary (after {startDate})
                    </p>
                </div>
            </div>

            <LoomWagesTable initialRecords={records || []} looms={looms || []} />
        </div>
    );
}
