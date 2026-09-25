import Form from '@/app/ui/warp/summary-form';
import { fetchWarpSummaryById } from '@/app/api/node/warp';
import Link from 'next/link';

export default async function Page(props: { params: Promise<{ id: string, loomId: string }> }) {
    const params = await props.params;
    const SizingId = params.id;
    const LoomId = params.loomId;
    const summaryDetails = await fetchWarpSummaryById(SizingId, LoomId);

    return (
        <main>
            <div className='flex justify-between'>
                <h1 className={`text-2xl`}>Warp Summary1</h1>
                <Link
                    href="/admin/warp"
                    className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
                >
                    Back
                </Link>
            </div>

            <Form summaryDetails={summaryDetails || {}} />
        </main>
    );
}
