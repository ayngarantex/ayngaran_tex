'use client'

import { useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createProduct } from '@/app/api/node/product';

export default function Form() {
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [size, setSize] = useState("");
  const [composition, setComposition] = useState("");
  const [washCare, setWashCare] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      alert("Product Name is required");
      return;
    }

    const productData = {
      Name: productName,
      Type: productType,
      HSNCode: hsnCode,
      Image: images.join(','),
      Tags: tags,
      Description: description,
      Details: details,
      Size: size,
      Composition: composition,
      WashCare: washCare
    };

    const res = await createProduct(productData);

    if (res) {
      window.location.href = '/admin/products';
    }
  };

  return (
    <form className="max-w-4xl">
      <div className="rounded-lg bg-blue-50 p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column - Product Specifications */}
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-700">
                Product Type / Material Type
              </label>
              <input
                id="type"
                name="type"
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="e.g. Pure Cotton Woven"
                className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="hsn" className="block text-sm font-semibold text-gray-700">
                HSN Code
              </label>
              <input
                id="hsn"
                name="hsn"
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="Enter HSN code"
                className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-semibold text-gray-700">
                Size / Width Specification
              </label>
              <input
                id="size"
                name="size"
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 44\ Width (Sold by Meter)"
                className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="composition" className="block text-sm font-semibold text-gray-700">
                Material Composition
              </label>
              <input
                id="composition"
                name="composition"
                type="text"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                placeholder="e.g. 100% Combed Cotton"
                className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="washcare" className="block text-sm font-semibold text-gray-700">
                Wash Care instructions
              </label>
              <input
                id="washcare"
                name="washcare"
                type="text"
                value={washCare}
                onChange={(e) => setWashCare(e.target.value)}
                placeholder="e.g. Gentle Hand Wash / Machine Wash cold"
                className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
                Tags (Comma separated)
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. new, cotton, premium"
                className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Right Column - Image Upload & Preview */}
          <div className="flex flex-col gap-5">
            <label className="block text-sm font-semibold text-gray-700">
              Product Images
            </label>
            <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center justify-center text-center text-sm text-gray-500"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {uploading ? (
                  <span className="text-blue-600 font-semibold">Uploading...</span>
                ) : (
                  <>
                    <span className="text-blue-600 font-semibold hover:underline">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</span>
                  </>
                )}
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[4/3] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center group">
                    <img
                      src={img}
                      alt={`Product Preview ${idx + 1}`}
                      className="object-contain w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 shadow hover:bg-red-700 transition-colors focus:outline-none"
                      title="Remove Image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Image {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full Width Textarea Elements */}
        <div className="mt-8 flex flex-col gap-6">
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="details" className="block text-sm font-semibold text-gray-700">
              Details / Specifications
            </label>
            <textarea
              id="details"
              name="details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter detailed specifications (e.g. dimensions, packaging, weave count)"
              className="mt-2 block w-full rounded-md border border-gray-300 py-2.5 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Link
          href="/admin/products"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-5 text-sm font-semibold text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit}>Create Product</Button>
      </div>
    </form>
  );
}
