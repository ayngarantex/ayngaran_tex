import Form from '@/app/ui/warp/edit-form';
import { fetchWarpById } from '@/app/api/node/warp';
import { fetchLooms } from '@/app/api/node/looms';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const Id = params.id
    const looms = await fetchLooms("", 0);
    const warpDetails = await fetchWarpById(Id);

    return (
        <main>
            <h1 className={`text-2xl`}>Delivery Challan Details</h1>

            <Form warpDetails={warpDetails || {}} looms={looms} />
        </main>
    );
}