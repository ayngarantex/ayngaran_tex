import Form from '@/app/ui/customers/edit-product-form';
import { fetchProductsWithCode } from '@/app/api/node/customers';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const CustomerId = parseInt(params.id);
    const Products = await fetchProductsWithCode(CustomerId);

    return (
        <main>
            <Form CustomerId={CustomerId} Products={Products} />
        </main>
    );
}