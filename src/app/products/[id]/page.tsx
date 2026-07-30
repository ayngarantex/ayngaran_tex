import Link from 'next/link';
import Image from 'next/image';
import AyngaranLogo from '@/app/ui/ayngaran-logo-black.jpeg';
import { getProductById } from '@/server/repositories/productRepositories';
import { getProductMetadata } from '@/app/lib/productMetadata';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ProductImageViewer from '@/app/ui/products/ProductImageViewer';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Product Details - Ayngaran Tex',
};


export default async function Page(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // Retrieve the product by its database ID
  const product = await getProductById(Number(id));

  // If the product does not exist, display a friendly 404 page
  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <header className="bg-white shadow-sm border-b border-slate-100 h-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={AyngaranLogo}
                alt="Ayngaran Logo"
                width={140}
                height={70}
                className="object-contain"
                priority
                unoptimized
              />
            </Link>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-6">
          <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-md w-full">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
            <p className="text-slate-500 text-sm mb-6">The product you are looking for does not exist or has been removed.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Back to Catalog
            </Link>
          </div>
        </main>

        <footer className="bg-slate-900 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Ayngaran Tex. All rights reserved.
        </footer>
      </div>
    );
  }

  // Map fabric images, description, size, and tags
  const meta = getProductMetadata(product);

  // Pre-fill a professional WhatsApp message for customer inquiries
  const contactNumber = "919876543210";
  const messageText = `Hi, I am interested in purchasing "${product.Name || 'Premium Fabric'}" (HSN: ${product.HSNCode || ''}). Please provide availability and pricing details.`;
  const whatsappUrl = `https://wa.me/${contactNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={AyngaranLogo}
              alt="Ayngaran Logo"
              width={140}
              height={70}
              className="object-contain"
              priority
              unoptimized
            />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Ayngaran Tex</span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Premium Weaving</span>
            </div>
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            Admin Portal
          </Link>
        </div>
      </header>

      {/* Main Details Screen */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 stroke-[2.5]" /> Back to Catalog
          </Link>
        </div>

        {/* Details Wrapper Card */}
        <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-md p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Image Viewer */}
            <ProductImageViewer
              images={
                product.Image
                  ? product.Image.split(',').map((img: string) => img.trim()).filter(Boolean)
                  : []
              }
              productName={product.Name || 'Premium Quality Fabric'}
            />

            {/* Right Column: Product Info & Actions */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Title */}
                <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  {product.Name + ' ' + product.Details || 'Premium Quality Fabric'}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {meta.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100/50"
                    >
                      # {tag}
                    </span>
                  ))}
                  {product.HSNCode && (
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100/50">
                      HSN: {product.HSNCode}
                    </span>
                  )}
                  {product.AvailableStock !== undefined && (() => {
                    const netStock = (product.AvailableStock || 0);
                    return (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${netStock > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                        : 'bg-rose-50 text-rose-700 border-rose-100/50'
                        }`}>
                        {netStock > 0 ? `Stock: ${netStock} Available` : 'Out of Stock'}
                      </span>
                    );
                  })()}
                </div>

                {/* Size Specs */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Standard Specifications</span>
                  <p className="text-base font-bold text-slate-900 mt-1">{meta.size}</p>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {meta.description}
                  </p>
                </div>

                {/* Technical Specifications Table */}
                <div className="border border-slate-150 rounded-xl overflow-hidden mb-8">
                  <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <th className="px-4 py-3 bg-slate-50 font-semibold text-slate-600 w-1/3">HSN Code</th>
                        <td className="px-4 py-3 font-medium text-slate-900">{product.HSNCode || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th className="px-4 py-3 bg-slate-50 font-semibold text-slate-600">Material Type</th>
                        <td className="px-4 py-3 font-medium text-slate-900">{product.Type || 'Pure Cotton Woven'}</td>
                      </tr>
                      <tr>
                        <th className="px-4 py-3 bg-slate-50 font-semibold text-slate-600">Material Composition</th>
                        <td className="px-4 py-3 font-medium text-slate-900">{product.Composition || '100% Combed Cotton'}</td>
                      </tr>
                      <tr>
                        <th className="px-4 py-3 bg-slate-50 font-semibold text-slate-600">Wash Care</th>
                        <td className="px-4 py-3 font-medium text-slate-900">{product.WashCare || 'Gentle Hand Wash / Machine Wash cold'}</td>
                      </tr>
                      {product.Details && (
                        <tr>
                          <th className="px-4 py-3 bg-slate-50 font-semibold text-slate-600">Specifications</th>
                          <td className="px-4 py-3 font-medium text-slate-900 whitespace-pre-line">{product.Details}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inquiry Action Buttons */}
              <div className="border-t border-slate-100 pt-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 shadow-md shadow-emerald-600/10 transition-all hover:scale-[1.01]"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.734-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.539 0 10.048-4.502 10.052-10.045.002-2.684-1.04-5.207-2.936-7.104C16.5 1.558 13.982.515 11.3.516c-5.545 0-10.054 4.502-10.058 10.047-.001 1.737.456 3.428 1.326 4.927L1.63 21.054l5.017-1.9zm10.463-5.263c-.27-.135-1.595-.788-1.843-.877-.248-.09-.429-.135-.61.135-.181.27-.701.877-.859 1.058-.158.18-.316.2-.586.066-.27-.135-1.139-.42-2.169-1.34-.801-.715-1.342-1.598-1.5-1.868-.158-.27-.017-.417.118-.551.121-.12.27-.315.405-.473.135-.158.18-.27.27-.45.09-.18.045-.338-.023-.473-.067-.135-.61-1.467-.835-2.007-.22-.53-.44-.457-.61-.466-.157-.008-.338-.01-.52-.01-.18 0-.473.067-.72.338-.248.27-.946.924-.946 2.251s.967 2.613 1.101 2.793c.135.18 1.902 2.905 4.609 4.072.644.277 1.147.443 1.54.568.648.206 1.237.177 1.703.107.519-.078 1.595-.653 1.82-.1.226.547.226 1.012.226 1.096.068.084 0 .17-.067.305z" />
                  </svg>
                  Inquire on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2">&copy; {new Date().getFullYear()} Ayngaran Tex. All rights reserved.</p>
          <p className="text-slate-600">Standard specifications apply. Subject to stock availability.</p>
        </div>
      </footer>
    </div>
  );
}
