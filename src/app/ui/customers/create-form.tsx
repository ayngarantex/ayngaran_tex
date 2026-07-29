'use client'

import { useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { statesList } from '@/app/lib/utils';
import { createCustomer } from '@/app/api/node/customers';
export default function Form() {
  const [customerName, setCustomerName] = useState("");
  const [state, setState] = useState("TamilNadu");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [agent, setAgent] = useState("");

  const handleSubmit = async () => {
    const customerData = {
      CustomerName: customerName,
      State: state,
      Phone: phone,
      Mobile: mobile,
      Address: address,
      Address2: address2,
      GstNumber: gstNumber,
      Agent: agent,
    };

    const res = await createCustomer(customerData);

    if (res) {
      window.location.href = '/admin/customers';
    }

    // const jsonBody = JSON.stringify({
    //   customerData
    // })

    // const res = await fetch('/api/customers', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: jsonBody,
    // });

    // const data = await res.json();
    // if(data?.CustomerId) {
    //   redirect('/admin/customers');
    // }
  };

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Customer Select */}
        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Customer Name
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="name"
                name="name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value)
                }}
                placeholder="Customer name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="mb-4 w-1/4 ml-8">
            <label htmlFor="gstNumber" className="mb-2 block text-sm font-medium">
              GST Number
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="gstNumber"
                name="gstNumber"
                type="text"
                value={gstNumber}
                onChange={(e) => {
                  setGstNumber(e.target.value)
                }}
                placeholder="GST Number"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/4">
            <label htmlFor="customer" className="mb-2 block text-sm font-medium">
              State
            </label>
            <div className="relative">
              <select
                id="customer"
                name="customerId"
                onChange={(e) => {
                  setState(e.target.value)
                }}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                defaultValue={state}
              >
                <option value="" disabled>
                  Select a State
                </option>
                {statesList()?.map((row: any) => (
                  <option
                    key={row.label}
                    value={row.label}
                  >
                    {row.label}
                  </option>
                ))}
              </select>
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        <div className='flex flex-wrap'>
          {/* Invoice Number */}
          <div className="mb-4 w-1/4">
            <label htmlFor="address" className="mb-2 block text-sm font-medium">
              Address line 1
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <textarea
                  id="address"
                  name="address"
                  rows={5}
                  placeholder="Enter address"
                  value={address}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  onChange={(e) => {
                    setAddress(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/4">
            <label htmlFor="address2" className="mb-2 block text-sm font-medium">
              Address line 2
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <textarea
                  id="address2"
                  name="address2"
                  rows={5}
                  value={address2}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  onChange={(e) => {
                    setAddress2(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/4">
            <label htmlFor="mobile" className="mb-2 block text-sm font-medium">
              Mobile
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="mobile"
                name="mobile"
                type="text"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value)
                }}
                placeholder="Mobile number"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="mb-4 w-1/4 ml-8">
            <label htmlFor="phone" className="mb-2 block text-sm font-medium">
              Phone
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="phone"
                name="phone"
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                }}
                placeholder="Phone number"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>
        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/4">
            <label htmlFor="agent" className="mb-2 block text-sm font-medium">
              Agent
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="agent"
                name="agent"
                type="text"
                value={agent}
                onChange={(e) => {
                  setAgent(e.target.value)
                }}
                placeholder="Agent"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/customers"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit}>Create Customer</Button>
      </div>
    </form>
  );
}
