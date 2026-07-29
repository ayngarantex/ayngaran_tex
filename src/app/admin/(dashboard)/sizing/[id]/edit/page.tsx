import Form from '@/app/ui/sizing/edit-form';
import { fetchAllSuppliers, fetchYarns, fetchAllLooms, fetchSizingById } from '@/app/lib/data';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const sizingId = parseInt(params.id);
    const sizing = await fetchSizingById(sizingId);
    const suppliers = await fetchAllSuppliers('Sizing');
    const yarns = await fetchYarns("", 0, "", "", "", "");
    const looms = await fetchAllLooms();

    return (
        <main>
            <Form sizing={sizing || {}} suppliers={suppliers} yarns={yarns} looms={looms} />
        </main>
    );
}