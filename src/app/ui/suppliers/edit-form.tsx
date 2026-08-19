'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { statesList } from '@/app/lib/utils';
import { updateSupplier } from '@/app/api/node/supplier';

export default function EditForm({
  supplier,
}: {
  supplier: any;
}) {
  console.log("supplier", supplier)
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierType, setSupplierType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [ifscCode, setIFSCode] = useState("");
  const [state, setState] = useState("TamilNadu");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [agent, setAgent] = useState("");

  // Pre-fill state from invoice data
  useEffect(() => {
    setSupplierName(supplier?.Name);
    setSupplierType(supplier?.Type);
    setAccountNumber(supplier?.AccountNumber)
    setBank(supplier?.Bank)
    setIFSCode(supplier?.IfscCode)
    setState(supplier?.State);
    setGstNumber(supplier?.GstNumber);
    setAddress(supplier?.Address);
    setMobile(supplier?.Mobile);
    setPhone(supplier?.Phone);
    setAgent(supplier?.Agent);
  }, [supplier]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const supplierData = {
        SupplierId: supplier.SupplierId,
        Type: supplierType,
        Name: supplierName,
        AccountNumber: accountNumber,
        Bank: bank,
        IfscCode: ifscCode,
        State: state,
        Phone: phone,
        Mobile: mobile,
        Address: address,
        GstNumber: gstNumber,
        Agent: agent,
      };

      const data = await updateSupplier(supplierData);
      if (data?.SupplierId) {
        window.location.href = '/admin/suppliers';
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };
  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Supplier Select */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-4 w-full">
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Supplier Name
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="name"
                name="name"
                type="text"
                value={supplierName || ""}
                onChange={(e) => {
                  setSupplierName(e.target.value)
                }}
                placeholder="Supplier name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="customer" className="mb-2 block text-sm font-medium">
              Supplier Type
            </label>
            <div className="relative">
              <select
                id="customer"
                name="customerId"
                onChange={(e) => {
                  setSupplierType(e.target.value)
                }}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                value={supplierType}
              >
                <option value="" disabled>
                  Select a Type
                </option>
                <option value="Yarn">Yarn</option>
                <option value="Sizing">Sizing</option>
              </select>
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div className="mb-4 w-full">
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
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-4 w-full">
            <label htmlFor="accNumber" className="mb-2 block text-sm font-medium">
              Account Number
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="accNumber"
                name="accNumber"
                type="text"
                value={accountNumber || ""}
                onChange={(e) => {
                  setAccountNumber(e.target.value)
                }}
                placeholder="account number"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="gstNumber" className="mb-2 block text-sm font-medium">
              Bank
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="bank"
                name="bank"
                type="text"
                value={bank || ""}
                onChange={(e) => {
                  setBank(e.target.value)
                }}
                placeholder="Bank"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="ifsc" className="mb-2 block text-sm font-medium">
              IFSC Code
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="ifsc"
                name="ifsc"
                type="text"
                value={ifscCode || ""}
                onChange={(e) => {
                  setIFSCode(e.target.value)
                }}
                placeholder="IFSC Code"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-4 w-full">
            <label htmlFor="state" className="mb-2 block text-sm font-medium">
              State
            </label>
            <div className="relative">
              <select
                id="state"
                name="State"
                onChange={(e) => {
                  setState(e.target.value)
                }}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                value={state}
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

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {/* Invoice Number */}
          <div className="mb-4 w-full">
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
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  onChange={(e) => {
                    setAddress(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-4 w-full">
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
          <div className="mb-4 w-full">
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
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-4 w-full">
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
          href="/admin/suppliers"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Supplier'}
        </Button>
      </div>
    </form>
  );
}
