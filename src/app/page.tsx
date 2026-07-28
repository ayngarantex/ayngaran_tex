import ProductCatalog from '@/app/ui/products/ProductCatalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ayngaran Tex - Premium Traditional & Modern Textiles',
  description: 'Explore the premium collection of pure traditional borders, dhotis, and towel from Ayngaran Tex.',
};

async function getAllProducts() {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProducts {
            products(limit: 1000) {
              Id
              Name
              HSNCode
              Type
              Image
              Tags
              Description
              Details
              Size
              Composition
              WashCare
              AvailableStock
              SoldCount
            }
          }
        `
      }),
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('Failed to fetch products: HTTP error', response.status);
      return [];
    }

    const result = await response.json();

    return result?.data?.products || [];
  } catch (err) {
    console.error('Error in getAllProducts fetch:', err);
    return [];
  }
}

export default async function Page() {
  const allProducts = await getAllProducts();
  return <ProductCatalog initialProducts={allProducts} />;
}
