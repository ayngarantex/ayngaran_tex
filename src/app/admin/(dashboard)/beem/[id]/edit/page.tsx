import Form from '@/app/ui/beem/edit-form';
import { fetchBeemDetailsById, fetchBeemDetailsByLoomId } from '@/app/lib/beem';
import { fetchLooms } from '@/app/api/node/looms';
import Table from '@/app/ui/beem/table';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const BeemId = parseInt(params.id);
    const beemDetails = await fetchBeemDetailsById(BeemId);
    const looms = await fetchLooms("", 0);
    const beemDetailsByLoomId = await fetchBeemDetailsByLoomId(beemDetails?.[0]?.LoomId || 0);

    return (
        <main>
            <h1 className={`text-2xl`}>Beem Details</h1>
            <Form looms={looms} beemDetails={beemDetails?.[0] || {}} beemDetailsByLoomId={beemDetailsByLoomId || []} />
            <Table beems={beemDetailsByLoomId || []} hideAction={true} />
        </main>
    );
}