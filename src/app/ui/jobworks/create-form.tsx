'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createLoom } from '@/app/api/node/looms';

export default function Form() {
  const [loomName, setLoomName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [count, setCount] = useState("");
  const [wageRate, setWageRate] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");

  const handleSubmit = async () => {
    const loomData = {
      LoomName: loomName,
      ContactNumber: contactNumber,
      Address: address,
      Count: count,
      WageRate: wageRate,
      OpeningBalance: openingBalance
    };

    const res = await createLoom(loomData);
    if (res) {
      window.location.href = '/admin/jobworks';
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div>
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
                placeholder="Loom name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>

          <div>
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

          <div>
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

          <div>
            <label htmlFor="wageRate" className="mb-2 block text-sm font-medium text-slate-800 font-bold">
              Wage Rate per Dhoti (₹)
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="wageRate"
                name="wageRate"
                type="number"
                step="0.01"
                value={wageRate}
                onChange={(e) => setWageRate(e.target.value)}
                placeholder="e.g. 25.00"
                className="peer block w-full rounded-md border border-indigo-200 py-2 pl-4 text-sm font-bold text-indigo-900 outline-2 placeholder:text-gray-400 bg-blue-100 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="openingBalance" className="mb-2 block text-sm font-medium text-amber-800 font-bold">
              Opening Balance before 2026-09-27 (₹)
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="openingBalance"
                name="openingBalance"
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="e.g. 1500.00"
                className="peer block w-full rounded-md border border-amber-200 py-2 pl-4 text-sm font-bold text-amber-900 outline-2 placeholder:text-gray-400 bg-blue-100 focus:bg-white"
              />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <label htmlFor="address" className="mb-2 block text-sm font-medium">
              Address
            </label>
            <div className="relative mt-2 rounded-md">
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Enter address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                }}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/admin/jobworks"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button onClick={handleSubmit} type="button">Save Job Work</Button>
        </div>
      </div>
    </form>
  );
}
