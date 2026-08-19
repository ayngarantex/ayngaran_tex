import { fetchProductById } from '@/app/api/node/product';
import { fetchStockEntryById } from '@/app/api/node/stock';
import StockEditForm from '@/app/ui/products/StockEditForm';

export default async function Page(props: {
    params: Promise<{ id: string; entryId: string }>;
}) {
    const params = await props.params;
    const productId = params.id;
    const entryId = Number(params.entryId);

    const product = await fetchProductById(productId);
    const entry = await fetchStockEntryById(entryId);

    return (
        <main className="w-full">
            <StockEditForm
                product={product || { Id: String(productId), Name: 'Product', HSNCode: '' }}
                entry={entry}
            />
        </main>
    );
}
