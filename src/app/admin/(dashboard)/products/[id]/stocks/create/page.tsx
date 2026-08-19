import { fetchProductById } from '@/app/api/node/product';
import StockCreateForm from '@/app/ui/products/StockCreateForm';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const Id = params.id;

    const product = await fetchProductById(Id);

    return (
        <main className="w-full">
            <StockCreateForm
                product={product || { Id: String(Id), Name: 'Product', HSNCode: '' }}
            />
        </main>
    );
}
