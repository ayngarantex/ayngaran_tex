import { fetchNodeProductById, fetchNodeProductTotals } from '@/app/api/node/product';
import { fetchStockEntries } from '@/app/api/node/stock';
import StockEntriesList from '@/app/ui/products/StockEntriesList';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const Id = params.id;

    const product = await fetchNodeProductById(Id);
    const stockEntries = await fetchStockEntries(Id);

    const stockDetails = await fetchNodeProductTotals("", Id);

    return (
        <main className="w-full">
            <StockEntriesList
                product={product || { Id: String(Id), Name: 'Product', HSNCode: '', AvailableStock: 0 }}
                initialEntries={stockEntries || []}
                stockDetails={stockDetails}
            />
        </main>
    );
}
