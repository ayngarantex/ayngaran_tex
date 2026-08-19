'use client'
import { SupplierField } from '@/app/lib/definitions';
import { YarnRow, PaymentRow } from '@/app/lib/types';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useState, useEffect, useMemo } from 'react';
import YarnProductForm from './products-form';
import PaymentForm from './payment-form';
import { useRouter } from 'next/navigation';
import { currentDate, formatDateToLocal } from '@/app/lib/utils';
import { updateYarn } from '@/app/api/node/yarns';

export default function EditForm({
  yarns,
  suppliers
}: {
  yarns: any;
  suppliers: SupplierField[];
}) {
  const router = useRouter();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierField | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    currentDate()
  );
  const [yrnProducts, setYrnProducts] = useState<YarnRow[]>([]);
  const [yrnPayments, setYrnPayments] = useState<PaymentRow[]>([]);
  const [supplierId, setSupplierId] = useState(0)

  const [beforeTax, setBeforeTax] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(5);
  const [cgstPercentage, setCgstPercentage] = useState(0);
  const [sgstPercentage, setSgstPercentage] = useState(0);
  const [igstPercentage, setIgstPercentage] = useState(0);
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [afterTax, setAfterTax] = useState(0);
  const [billType, setBillType] = useState("normal");
  const [roundOff, setRoundOff] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Pre-fill state from invoice data
  useEffect(() => {
    const supplier = suppliers.find(c => Number(c.SupplierId) === Number(yarns?.SupplierId)) || null;
    setSelectedSupplier(supplier);

    setSupplierId(yarns?.SupplierId);
    setInvoiceNumber(yarns?.InvoiceNumber);
    setInvoiceDate(formatDateToLocal(yarns?.InvoiceDate))
    setBeforeTax(yarns?.BeforeTax);
    setTaxPercentage(yarns?.TaxPercentage);
    setCgstAmount(yarns?.Cgst);
    setSgstAmount(yarns?.Sgst);
    setIgstAmount(yarns?.Igst);
    setAfterTax(yarns?.AfterTax);
    setBillType(yarns?.BillType);
    setRoundOff(yarns?.RoundOff);
    setInvoiceAmount(yarns?.InvoiceAmount);
    setPaidAmount(yarns?.PaidAmount);

    setYrnProducts(yarns.yarn_details || []);
    setYrnPayments(yarns.yarn_payment_details || []);
  }, [yarns, suppliers]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const Id = Number(e.target.value);
    const supplier = suppliers.find(c => Number(c.SupplierId) === Id) || null;
    setSelectedSupplier(supplier);
    let SupplierId = Number(supplier?.SupplierId)
    setSupplierId(SupplierId)
  };

  const invoiceProductData = useMemo(() => {
    return yarns?.yarn_details ?? [];
  }, [yarns?.yarn_details]);

  const invoicePaymentData = useMemo(() => {
    return yarns?.yarn_payment_details ?? [];
  }, [yarns?.yarn_payment_details]);

  const handleSubmit = async () => {
    if (submitLoading) return;
    setSubmitLoading(true);
    let payments = yrnPayments;

    const invoiceData = {
      YarnId: yarns.YarnId,
      SupplierId: selectedSupplier?.SupplierId,
      InvoiceNumber: invoiceNumber,
      InvoiceDate: invoiceDate,
      BeforeTax: beforeTax,
      TaxPercentage: taxPercentage,
      Cgst: cgstAmount,
      Sgst: sgstAmount,
      Igst: igstAmount,
      AfterTax: afterTax,
      BillType: billType,
      RoundOff: roundOff,
      InvoiceAmount: invoiceAmount,
      PaidAmount: paidAmount
    };

    if (payments.length === 1 && payments[0].date === 'date') {
      payments = []
    }

    let filteredPayments: any = []
    if (payments?.length) {
      payments.forEach((row: any) => {
        if (row.date !== 'date') {
          filteredPayments.push(row)
        }
      })
    }

    let filteredProduct: any = []
    if (yrnProducts?.length) {
      yrnProducts.forEach((row: any) => {
        filteredProduct.push(row)
      })
    }

    try {
      const data = await updateYarn({
        invoiceData,
        products: filteredProduct,
        payments: filteredPayments
      });

      if (data?.YarnId) {
        router.push('/admin/yarns');
      } else {
        setSubmitLoading(false);
      }
    } catch (err) {
      setSubmitLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    let beforeTax = 0
    yrnProducts.forEach(row => {
      beforeTax += row.quantity * row.price
    })
    setBeforeTax(beforeTax)
  }, [yrnProducts, billType])

  useEffect(() => {
    if (billType === 'gst') {
      let stateTax = taxPercentage / 2
      setCgstPercentage(stateTax)
      setSgstPercentage(stateTax)
      setIgstPercentage(taxPercentage)
    }
  }, [taxPercentage, billType])

  useEffect(() => {
    if (billType === 'gst') {
      let taxAmount = (beforeTax / 100) * taxPercentage
      let stateTax = taxPercentage / 2
      setCgstAmount((beforeTax / 100) * stateTax)
      setSgstAmount((beforeTax / 100) * stateTax)
      setIgstAmount(taxAmount)
    }
  }, [billType, taxPercentage, beforeTax])

  useEffect(() => {
    let taxAmount = (beforeTax / 100) * taxPercentage
    let afterTax = beforeTax + (billType === 'gst' ? taxAmount : 0)
    setAfterTax(afterTax)

    let roundInt = parseFloat(String(roundOff))
    let invoiceAmount = afterTax
    if (roundInt) {
      invoiceAmount += roundInt
    }
    setInvoiceAmount(invoiceAmount)

  }, [taxPercentage, beforeTax, roundOff, billType])


  useEffect(() => {
    let receivedAmount = 0
    yrnPayments.forEach(row => {
      receivedAmount += Number(row.amount)
    })
    setPaidAmount(receivedAmount)
  }, [yrnPayments])

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Customer Select */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <div className="mb-4 w-full">
            <label htmlFor="customer" className="mb-2 block text-base font-medium">
              Choose customer
            </label>
            <div className="relative">
              <select
                id="customer"
                name="customerId"
                onChange={handleCustomerChange}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-base outline-2 placeholder:text-gray-500"
                value={supplierId}
              >
                <option value="" disabled>
                  Select a customer
                </option>
                {suppliers.map((supplier) => (
                  <option
                    key={supplier.SupplierId}
                    value={supplier.SupplierId}
                  >
                    {supplier.Name}
                  </option>
                ))}
              </select>
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="gstNumber" className="mb-2 block text-base font-medium">
              GST Number
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="gstNumber"
                name="gstNumber"
                type="text"
                value={selectedSupplier?.GstNumber || ''}
                readOnly
                placeholder="GST Number will appear here"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-blue-100 uppercase"
              />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {/* Invoice Number */}
          <div className="mb-4 w-full">
            <label htmlFor="invoice" className="mb-2 block text-base font-medium">
              Invoice Number
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="invoice"
                  name="invoice"
                  type="text"
                  value={invoiceNumber || ''}
                  placeholder="Enter Invoice"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 uppercase"
                  onChange={(e) => {
                    setInvoiceNumber(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mb-8 w-full">
            <label htmlFor="invoice date" className="mb-2 block text-base font-medium">
              Invoice Date
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="date"
                  name="date"
                  type="date"
                  placeholder="Date"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                  value={invoiceDate}
                  onChange={(e) => {
                    setInvoiceDate(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <YarnProductForm
          yrnProducts={invoiceProductData}
          setYrnProducts={setYrnProducts}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label htmlFor="beforeTax" className="mb-2 block text-base font-medium">
              Before Tax
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="beforeTax"
                  name="beforeTax"
                  type="text"
                  disabled
                  placeholder="Before Tax Amount"
                  value={(beforeTax || 0).toFixed(2)}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          <div>
            <fieldset>
              <legend className="mb-2 block text-base font-medium">
                Bill Type
              </legend>
              <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      id="gst"
                      name="billType"
                      type="radio"
                      value="gst"
                      checked={billType === "gst"}
                      className="h-4 w-4 cursor-pointer border-gray-300 bg-green-300 text-gray-600 focus:ring-2"
                      onChange={(e) => {
                        setBillType('gst')
                      }}
                    />
                    <label
                      htmlFor="gst"
                      className="flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-base font-medium text-gray-600"
                    >
                      Gst
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="normal"
                      name="billType"
                      type="radio"
                      value="normal"
                      checked={billType === "normal"}
                      className="h-4 w-4 cursor-pointer border-gray-300 bg-blue-300 text-black focus:ring-2"
                      onChange={(e) => {
                        setBillType('normal')
                      }}
                    />
                    <label
                      htmlFor="normal"
                      className="flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-base font-medium text-gray-600"
                    >
                      Normal
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        {billType === 'gst' ?
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6'>
            <div className="w-full">
              <label htmlFor="tax percentage" className="mb-2 block text-base font-medium">
                Tax Percentage
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="tax percentage"
                    name="tax percentage"
                    type="text"
                    placeholder="Enter tax percentage"
                    value={taxPercentage}
                    onChange={(e) => {
                      setTaxPercentage(Number(e.target.value))
                    }}
                    className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
            {selectedSupplier?.State === 'TamilNadu' ?
              <>
                <div className="mb-4 w-full">
                  <label htmlFor="cgst" className="mb-2 block text-base font-medium">
                    CGST ({cgstPercentage})%
                  </label>
                  <div className="relative mt-2 rounded-md">
                    <div className="relative">
                      <input
                        id="cgst"
                        name="cgst"
                        type="text"
                        disabled
                        value={(cgstAmount || 0).toFixed(2)}
                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4 w-full">
                  <label htmlFor="cgst" className="mb-2 block text-base font-medium">
                    SGST ({sgstPercentage})%
                  </label>
                  <div className="relative mt-2 rounded-md">
                    <div className="relative">
                      <input
                        id="sgst"
                        name="sgst"
                        type="text"
                        disabled
                        value={(sgstAmount || 0).toFixed(2)}
                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </>
              :
              <div className="mb-4 w-full">
                <label htmlFor="igst" className="mb-2 block text-base font-medium">
                  IGST ({igstPercentage})%
                </label>
                <div className="relative mt-2 rounded-md">
                  <div className="relative">
                    <input
                      id="igst"
                      name="igst"
                      type="text"
                      disabled
                      value={(igstAmount || 0).toFixed(2)}
                      className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            }
          </div>
          : null}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div>
            <label htmlFor="afterTax" className="mb-2 block text-base font-medium">
              After Tax Amount
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="afterTax"
                  name="afterTax"
                  type="text"
                  disabled
                  value={(afterTax || 0).toFixed(2)}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="roundOff" className="mb-2 block text-base font-medium">
              Round Off
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="roundOff"
                  name="roundOff"
                  type="text"
                  placeholder="Enter round off"
                  value={roundOff || 0}
                  onChange={(e) =>
                    setRoundOff(e.target.value)
                  }
                  className="peer block w-full rounded-md fborder border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="invoiceAmount" className="mb-2 block text-base font-medium">
              Invoice Amount
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="invoiceAmount"
                  name="invoiceAmount"
                  type="text"
                  disabled
                  value={invoiceAmount || 0}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <PaymentForm
          yrnPayment={invoicePaymentData}
          invoiceAmount={invoiceAmount}
          setYrnPayments={setYrnPayments}
        />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/yarns"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-base font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={handleSubmit}>Update Yarn</Button>
      </div>
    </form>
  );
}
