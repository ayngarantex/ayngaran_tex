'use client';

import { useState, useEffect } from 'react';

interface ProductImageViewerProps {
  images: string[];
  productName: string;
}

export default function ProductImageViewer({ images, productName }: ProductImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productImages = images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'];

  const activeImage = productImages[activeIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % productImages.length);
  };

  // Keyboard navigation for open modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, productImages.length]);

  return (
    <div className="flex flex-col gap-4">
      {/* Large Main Active Image Container */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer group"
      >
        <img
          src={activeImage}
          alt={`${productName} - Image ${activeIndex + 1}`}
          className="object-cover w-full h-full transition-all duration-300 ease-in-out group-hover:scale-[1.02]"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
            Click to expand
          </span>
        </div>

        {/* Navigation Arrows (Overlay) */}
        {productImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 z-10"
              title="Previous Image"
            >
              <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 z-10"
              title="Next Image"
            >
              <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails List (only if more than 1 image) */}
      {productImages.length > 1 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative w-20 h-16 rounded-md overflow-hidden border-2 bg-slate-50 transition-all duration-200 ${
                index === activeIndex
                  ? 'border-blue-600 ring-2 ring-blue-500/20 opacity-100 scale-95 shadow-sm'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-400 font-semibold text-center uppercase tracking-widest mt-2">
        * Product colors and weave may slightly vary due to screen settings
      </p>

      {/* Fullscreen Lightbox Modal */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 cursor-pointer z-50"
            title="Close Lightbox"
          >
            <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Main Image Container */}
          <div 
            onClick={(e) => e.stopPropagation()} // prevent close when clicking image container
            className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center p-4 cursor-default"
          >
            <img
              src={activeImage}
              alt={`${productName} fullscreen preview`}
              className="object-contain max-w-full max-h-[75vh] rounded-lg shadow-2xl transition-all duration-300"
            />

            {/* Modal Navigation Arrows */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 border border-white/10 text-white rounded-full p-3.5 shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-110 cursor-pointer"
                  title="Previous Image"
                >
                  <svg className="w-7 h-7 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 border border-white/10 text-white rounded-full p-3.5 shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-110 cursor-pointer"
                  title="Next Image"
                >
                  <svg className="w-7 h-7 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Modal Caption and Indicators */}
          <div className="text-center mt-6 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-bold tracking-tight">{productName}</p>
            <p className="text-sm text-slate-400 mt-1">Image {activeIndex + 1} of {productImages.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
