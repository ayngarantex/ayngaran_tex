'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AyngaranLogo from '@/app/ui/ayngaran-logo.jpeg';
import { getProductMetadata } from '@/app/lib/productMetadata';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebounce } from 'use-debounce';

interface Product {
  Id: number;
  Name: string | null;
  Type: string | null;
  HSNCode: string | null;
  Image?: string | null;
  Tags?: string | null;
  Description?: string | null;
  Details?: string | null;
  AvailableStock?: number | null;
  SoldCount?: number | null;
}

interface ProductCatalogProps {
  initialProducts: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 200);

  // Perform client-side filtering in real-time using the debounced query
  const filteredProducts = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return initialProducts;

    return initialProducts.filter((product) => {
      const name = (product.Name || '').toLowerCase();
      const type = (product.Type || '').toLowerCase();
      const hsn = (product.HSNCode || '').toLowerCase();
      return name.includes(query) || type.includes(query) || hsn.includes(query);
    });
  }, [debouncedSearchQuery, initialProducts]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Premium Header */}
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
            />
            <div className="flex flex-col">
              <span className="text-[40px] font-extrabold tracking-tight text-slate-900">Ayngaran Tex</span>
              <span className="text-[15px] text-slate-500 font-semibold tracking-widest uppercase">Premium Weaving</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              Catalog
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm shadow-slate-900/10"
            >
              Admin Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 py-16 text-white text-center relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Premium Dhoties & Towels
          </h1>
          <p className="text-slate-300 text-lg font-medium max-w-2xl mx-auto mb-8">
            Experience the craftsmanship of pure cotton weaves, traditional border patterns, and durable powerloom textiles.
          </p>

          {/* Real-time Search Input */}
          <div className="max-w-lg mx-auto bg-white p-2 rounded-xl shadow-lg border border-slate-200/20">
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search premium fabrics instantly (e.g. border, cream)..."
                  className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-slate-950 outline-none placeholder-slate-400"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Our Catalog</h2>
            <p className="text-sm text-slate-500 mt-1">Showing premium quality weaves available</p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
            {filteredProducts.length} Products Found
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium text-lg">No products found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-sm font-bold text-blue-600 hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          /* 4 * 3 style layout grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const meta = getProductMetadata(product);
              return (
                <div
                  key={product.Id}
                  className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group animate-fadeIn"
                >
                  {/* Image Aspect ratio 4:3 */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={meta.imageUrl}
                      alt={product.Name + ' ' + product.Details || 'Fabric Image'}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-900 shadow-xs tracking-wider uppercase border border-slate-200/30">
                      {product.HSNCode ? `HSN: ${product.HSNCode}` : 'Textile'}
                    </div>
                  </div>

                  {/* Product Details inside Card */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Name */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.Name + ' ' + product.Details || 'Premium Fabric'}
                      </h3>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {meta.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100/30"
                          >
                            # {tag}
                          </span>
                        ))}
                        {/* {product.AvailableStock !== undefined && (() => {
                          const netStock = (product.AvailableStock || 0);
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${netStock > 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100/30'
                                : 'bg-rose-50 text-rose-700 border-rose-100/30'
                              }`}>
                              {netStock > 0 ? `In Stock` : 'Out of Stock'}
                            </span>
                          );
                        })()} */}
                      </div>

                      {/* Description Preview */}
                      <p className="text-xs text-slate-500 mt-3.5 line-clamp-2 leading-relaxed">
                        {meta.description}
                      </p>
                    </div>

                    {/* View Details Link */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <Link
                        href={`/products/${product.Id}`}
                        className="w-full inline-flex items-center justify-center rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2 text-xs font-bold transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-white font-bold text-base mb-3">Ayngaran Tex</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Manufacturers and distributors of premium handloom and powerloom cotton textiles. Committed to quality weaving and traditional designs since 2022.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-3">Address & Contact</h4>
            <p className="text-sm text-slate-450 leading-relaxed">
              198 B Annan Nagar 5th Street,<br />
              Sabari Cables Severice, <br />
              Erode, Tamil Nadu, India.<br />
              Mobile: +91 9003613503
              +91 9994874400
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-3">Operating Hours</h4>
            <p className="text-sm text-slate-455 leading-relaxed">
              Monday - Saturday: 9:00 AM - 8:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Ayngaran Tex. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
