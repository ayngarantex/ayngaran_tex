'use client'

import { useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createLoom } from '@/app/api/node/looms';

export default function Form() {
  const [loomName, setLoomName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [count, setCount] = useState("");

  const handleSubmit = async () => {
    const loomData = {
      LoomName: loomName,
      ContactNumber: contactNumber,
      Address: address,
      Count: count
    };

    const res = await createLoom(loomData);
    if (res) {
      window.location.href = '/admin/jobworks';
    }
  };

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Customer Select */}
        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Loom Name
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="name"
                name="name"
                type="text"
                value={loomName}
                onChange={(e) => {
                  setLoomName(e.target.value)
                }}
                placeholder="Product name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>
        <div className='flex flex-wrap pt-8'>
          {/* Invoice Number */}
          <div className="mb-4 w-1/4">
            <label htmlFor="address" className="mb-2 block text-sm font-medium">
              Address
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <textarea
                  id="address"
                  name="address"
                  rows={5}
                  placeholder="Enter address"
                  value={address}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
                  onChange={(e) => {
                    setAddress(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap pt-8'>
          <div className="mb-4 w-1/4">
            <label htmlFor="contact" className="mb-2 block text-sm font-medium">
              Contact Number
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="contact"
                name="contact"
                type="text"
                value={contactNumber}
                onChange={(e) => {
                  setContactNumber(e.target.value)
                }}
                placeholder="Enter contact number"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className='flex flex-wrap pt-8'>
          <div className="mb-4 w-1/4">
            <label htmlFor="count" className="mb-2 block text-sm font-medium">
              Total Looms
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="count"
                name="count"
                type="number"
                value={count}
                onChange={(e) => {
                  setCount(e.target.value)
                }}
                placeholder="Enter count"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/jobworks"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit}>
          Create
        </Button>
      </div>
    </form>
  );
}
