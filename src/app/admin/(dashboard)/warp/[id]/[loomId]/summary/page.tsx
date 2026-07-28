import Form from '@/app/ui/warp/summary-form';
import { fetchWarpSummaryById } from '@/app/api/node/warp';

export default async function Page(props: { params: Promise<{ id: string, loomId: string }> }) {
    const params = await props.params;
    const SizingId = params.id;
    const LoomId = params.loomId;
    const summaryDetails = await fetchWarpSummaryById(SizingId, LoomId);

    return (
        <main>
            <h1 className={`text-2xl`}>Warp Summary</h1>

            <Form summaryDetails={summaryDetails || {}} />
        </main>
    );
}
