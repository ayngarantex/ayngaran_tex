import Form from '@/app/ui/yarns/edit-form';
import { fetchAllSuppliers, fetchYarnById } from '@/app/lib/data';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const YarnId = parseInt(params.id);
    const yarns = await fetchYarnById(YarnId);
    const suppliers = await fetchAllSuppliers('Yarn');

    return (
        <main>
            <Form yarns={yarns || {}} suppliers={suppliers} />
        </main>
    );
}