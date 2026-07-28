import Form from '@/app/ui/products/edit-form';
import { fetchNodeProductById } from '@/app/api/node/product';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const Id = params.id;
    const product = await fetchNodeProductById(Id);

    return (
        <main>
            <Form product={product || {}} />
        </main>
    );
}