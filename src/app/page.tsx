import ProductCatalog from '@/app/ui/products/ProductCatalog';
import { getProducts } from '@/server/repositories/productRepositories';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ayngaran Tex - Premium Traditional & Modern Textiles',
  description: 'Explore the premium collection of pure traditional borders, dhotis, and towel from Ayngaran Tex.',
};

export default async function Page() {
  let allProducts: any[] = [];
  try {
    allProducts = await getProducts(null, 1, 1000);
  } catch (err) {
    console.error('Error fetching products for homepage:', err);
  }
  return <ProductCatalog initialProducts={allProducts} />;
}
