import Form from '@/app/ui/suppliers/edit-form';
import { fetchSupplierById } from '@/app/api/node/supplier';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const SupplieId = parseInt(params.id);
    const supplier = await fetchSupplierById(SupplieId);

    return (
        <main>
            <Form supplier={supplier?.[0] || {}} />
        </main>
    );
}