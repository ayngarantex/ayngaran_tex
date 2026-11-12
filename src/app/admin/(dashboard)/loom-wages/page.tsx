import { fetchLoomWagesConsolidated } from '@/app/api/node/loom-wages';
import { fetchLooms } from '@/app/api/node/looms';
import LoomWagesTable from '@/app/ui/loom-wages/table';
import LoomLumpSumPaymentModal from '@/app/ui/loom-wages/loom-lump-sum-payment-modal';
import Link from 'next/link';

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
                <div className="flex items-center gap-2.5">
                    <LoomLumpSumPaymentModal looms={looms || []} />
                    <Link
                        href="/admin/payments?type=loom"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                        View Loom Payments List →
                    </Link>
                </div>
            </div>

            <LoomWagesTable initialRecords={records || []} looms={looms || []} />
        </div>
    );
}
