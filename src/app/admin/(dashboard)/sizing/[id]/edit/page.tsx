import Form from '@/app/ui/sizing/edit-form';
import { fetchAllSuppliers, fetchYarns, fetchAllLooms } from '@/app/lib/data';
import { fetchSizingById } from '@/app/api/node/sizing';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const sizingId = parseInt(params.id);
    const sizing = await fetchSizingById(sizingId);
    const suppliers = await fetchAllSuppliers('Sizing');
    const yarns = await fetchYarns("", 0, "", "", "", "");
    const looms = await fetchAllLooms();

    console.log("suppliers", suppliers)

    return (
        <main>
            <Form sizing={sizing?.[0] || {}} suppliers={suppliers} yarns={yarns} looms={looms} />
        </main>
    );
}