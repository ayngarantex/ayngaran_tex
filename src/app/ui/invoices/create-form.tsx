'use client'
import { CustomerField, ProductField } from '@/app/lib/definitions';
import { ProductRow, PaymentRow } from '@/app/lib/types';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useEffect, useState, useMemo } from 'react';
import ProductForm from './products-form';
import SearchDropdown from '@/app/ui/search-dropdown';
import PaymentForm from './payment-form';
import { currentDate, invoiceTypeOptions } from '@/app/lib/utils';
import ReturnProducts from './return-products';
import { createInvoice } from '@/app/api/node/invoice';
import { fetchProductsWithCode } from '@/app/api/node/customers';
export default function Form({
  customers,
  lastInvoiceGstNumber,
  lastInvoiceDcNumber
}: {
  customers: CustomerField[];
  lastInvoiceGstNumber: string;
  lastInvoiceDcNumber: string;
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerField | null>(null);

  const dropdownCustomers = useMemo(() => {
    return customers.map(c => ({
      id: c.CustomerId,
      label: c.CustomerName || '',
    }));
  }, [customers]);

  const handleCustomerSelect = async (item: any) => {
    setProducts([]);
    if (!item) {
      setSelectedCustomer(null);
      return;
    }
    const customerId = Number(item.id);
    setCustomerId(customerId)
    const customer = customers.find(c => Number(c.CustomerId) === customerId) || null;
    setSelectedCustomer(customer);
    let data = await fetchProductsWithCode(customerId, 0, "");
    setProducts(data);
  };
  const [invoiceNumber, setInvoiceNumber] = useState(String(Number(lastInvoiceDcNumber) + 1));
  const [invoiceDate, setInvoiceDate] = useState(
    currentDate()
  );
  const [invoiceType, setInvoiceType] = useState("B2B");
  const [ewayBillNumber, setEwayBillNumber] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  const [products, setProducts] = useState<ProductField[]>([]);
  const [invProducts, setInvProducts] = useState<ProductRow[]>([]);
  const [invPayments, setInvPayments] = useState<PaymentRow[]>([]);
  const [retProducts, setRetProducts] = useState<ProductRow[]>([]);

  const [returnProducts, SetReturnProducts] = useState(false);
  const [customerId, setCustomerId] = useState(0)
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
  const [discount, setDiscount] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [isCancel, setIsCancel] = useState(0);
  const [cancelReason, setCancelReason] = useState("");

  const handleSubmit = async () => {
    if (submitLoading) return;
    setSubmitLoading(true);

    try {
      let payments = invPayments;

      if (payments.length === 1 && payments[0].date === 'date') {
        payments = []
      } else {
        payments = payments.filter((row: PaymentRow) => row.date !== 'date')
      }

      const invoiceData = {
        CustomerId: selectedCustomer?.CustomerId ? Number(selectedCustomer?.CustomerId) : null,
        InvoiceNumber: invoiceNumber,
        InvoiceType: billType === 'gst' ? invoiceType : '',
        EwayBillNumber: ewayBillNumber,
        InvoiceDate: invoiceDate,
        DeliveryNote: deliveryNote,
        BeforeTax: Number(beforeTax.toFixed(2)),
        TaxPercentage: taxPercentage,
        Cgst: selectedCustomer?.State === 'TamilNadu' ? Number(cgstAmount.toFixed(2)) : 0,
        Sgst: selectedCustomer?.State === 'TamilNadu' ? Number(sgstAmount.toFixed(2)) : 0,
        Igst: selectedCustomer?.State !== 'TamilNadu' ? Number(igstAmount.toFixed(2)) : 0,
        AfterTax: Number(afterTax.toFixed(2)),
        BillType: billType,
        RoundOff: roundOff ? Number(roundOff).toFixed(2) : '0.00',
        Discount: discount ? Number(discount).toFixed(2) : '0.00',
        InvoiceAmount: Number(invoiceAmount.toFixed(2)),
        ReceivedAmount: receivedAmount,
        IsCancel: isCancel,
        CancelReason: isCancel ? cancelReason : null,
        products: invProducts ? invProducts.map(({ pId, ...rest }) => rest) : null,
        returnProducts: retProducts.length ? retProducts.filter((row: ProductRow) => row.product !== 0) : null,
        payments: payments ? payments.map(({ pId, ...rest }) => rest) : null,
      }

      const res = await createInvoice(invoiceData);

      if (res) {
        window.location.href = '/admin/invoices';
      } else {
        setSubmitLoading(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    let beforeTax = 0
    invProducts.forEach(row => {
      beforeTax += Number((row.quantity * row.price).toFixed(2))
    })
    retProducts.forEach(row => {
      beforeTax -= Number((row.quantity * row.price).toFixed(2))
    })

    setBeforeTax(Number(beforeTax.toFixed(2)))
  }, [invProducts, retProducts, billType])

  useEffect(() => {
    if (billType === 'gst') {
      let stateTax = taxPercentage / 2
      setCgstPercentage(stateTax)
      setSgstPercentage(stateTax)
      setIgstPercentage(taxPercentage)
    }
  }, [taxPercentage, billType])

  useEffect(() => {
    let taxAmount = 0;
    if (billType === 'gst') {
      taxAmount = (beforeTax / 100) * taxPercentage
      let stateTax = taxPercentage / 2
      setCgstAmount(Number(((beforeTax / 100) * stateTax).toFixed(2)))
      setSgstAmount(Number(((beforeTax / 100) * stateTax).toFixed(2)))
      setIgstAmount(Number(taxAmount.toFixed(2)))

      setInvoiceNumber(String(Number(lastInvoiceGstNumber) + 1))
    } else {
      setInvoiceNumber(String(Number(lastInvoiceDcNumber) + 1))
    }
  }, [billType, taxPercentage, beforeTax])

  useEffect(() => {
    let taxAmount = 0;
    if (billType === 'gst') {
      if (selectedCustomer?.State === 'TamilNadu') {
        taxAmount = cgstAmount + sgstAmount;
      } else {
        taxAmount = igstAmount;
      }
    }
    let afterTaxVal = beforeTax + taxAmount;
    setAfterTax(Number(afterTaxVal.toFixed(2)))

    let roundOffVal = (Math.round(afterTaxVal) - afterTaxVal).toFixed(2)
    setRoundOff(roundOffVal)
  }, [billType, beforeTax, cgstAmount, sgstAmount, igstAmount, selectedCustomer])

  useEffect(() => {
    let invoiceAmountVal = afterTax
    if (roundOff) {
      invoiceAmountVal += parseFloat(String(roundOff))
    }

    if (discount) {
      invoiceAmountVal -= parseFloat(String(discount))
    }
    setInvoiceAmount(Number(invoiceAmountVal.toFixed(2)))

  }, [afterTax, roundOff, discount])

  useEffect(() => {
    let receivedAmount = 0
    invPayments.forEach(row => {
      receivedAmount += Number(row.amount)
    })
    setReceivedAmount(receivedAmount)
  }, [invPayments])

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Customer Select */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="w-full">
            <SearchDropdown
              items={dropdownCustomers}
              onSelect={handleCustomerSelect}
              label="Choose customer"
              placeholder="Select a customer..."
              createLink="/admin/customers/create"
              value={selectedCustomer?.CustomerName || ''}
            />
          </div>
          <div className="w-full">
            <label htmlFor="gstNumber" className="mb-2 block text-sm font-medium">
              GST Number
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="gstNumber"
                name="gstNumber"
                type="text"
                value={selectedCustomer?.GstNumber || ''}
                readOnly
                placeholder="GST Number will appear here"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="flex items-center self-end mb-1">
            <input
              id="pending"
              name="status"
              type="checkbox"
              value="pending"
              className="h-4 w-4 cursor-pointer border-gray-300 bg-blue-100 text-gray-600 focus:ring-2"
              onChange={(e) => setIsCancel(e.target.checked ? 1 : 0)}
              checked={isCancel === 1 ? true : false}
            />
            <label
              htmlFor="pending"
              className="flex cursor-pointer items-center gap-1.5 text-lg font-medium text-red-600 pt-1 font-bold pl-3"
            >
              Cancel
            </label>
          </div>
        </div>
        {isCancel === 1 && (
          <div className="mt-4 mb-4 w-full md: w-full">
            <label htmlFor="cancelReason" className="mb-2 block text-sm font-medium">
              Cancel Reason
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="cancelReason"
                name="cancelReason"
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter Cancel Reason"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
          {/* Invoice Number */}
          <div>
            <label htmlFor="invoice" className="mb-2 block text-sm font-medium">
              Invoice Number
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="invoice"
                  name="invoice"
                  type="text"
                  placeholder="Enter Invoice"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  onChange={(e) => {
                    setInvoiceNumber(String(e.target.value))
                  }}
                  value={invoiceNumber || ''}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="invoice date" className="mb-2 block text-sm font-medium">
              Invoice Date
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="date"
                  name="date"
                  type="date"
                  placeholder="Date"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  value={invoiceDate}
                  onChange={(e) => {
                    setInvoiceDate(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="invoice date" className="mb-2 block text-sm font-medium">
              Invoice Type
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <select
                  id="invoiceType"
                  name="invoiceType"
                  onChange={(e) => {
                    setInvoiceType(e.target.value)
                  }}
                  className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
                  value={invoiceType}
                >
                  <option value="" disabled>Select a Type</option>
                  {invoiceTypeOptions().map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="Eway Bill" className="mb-2 block text-sm font-medium">
              Eway Bill Number
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="Eway Bill"
                  name="Eway Bill"
                  type="text"
                  placeholder="Enter Eway Bill"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 tamil-input"
                  onChange={(e) => {
                    setEwayBillNumber(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="Delivery Note" className="mb-2 block text-sm font-medium">
              Delivery Note
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="deliveryNote"
                  name="deliveryNote"
                  type="text"
                  placeholder="Enter Delivery Note"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                  onChange={(e) => {
                    setDeliveryNote(e.target.value)
                  }}
                  value={deliveryNote}
                />
              </div>
            </div>
          </div>
        </div>

        {(customerId && products?.length > 0) ? (
          <>
            <ProductForm
              customerId={customerId}
              invProducts={[]}
              products={products}
              setInvProducts={setInvProducts}
            />
            <div className='mt-6 w-fit'>
              <div className="relative cursor-pointer rounded-md bg-blue-600 hover:bg-blue-700 py-2 px-4 text-sm font-semibold text-white" onClick={() => {
                SetReturnProducts(!returnProducts)
              }}>
                {returnProducts ? 'Hide' : 'Show'} Return Products
              </div>
            </div>
            {returnProducts ?
              <ReturnProducts
                retProducts={[]}
                products={products}
                setRetProducts={setRetProducts}
              />
              : null}
          </>
        ) : null}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label htmlFor="beforeTax" className="mb-2 block text-sm font-medium">
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
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">
              Bill Type
            </legend>
            <div className="rounded-lg border border-gray-500 px-[14px] py-3">
              <div className="flex gap-3">
                <div className={`flex items-center ${billType === 'gst' ? "" : "my-6"}`}>
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
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-base font-medium text-gray-600 ml-3"
                  >
                    Gst
                  </label>
                </div>
                <div className={`flex items-center ${billType === 'gst' ? "" : "my-6"}`}>
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
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-base font-medium text-gray-600 ml-3"
                  >
                    Normal
                  </label>
                </div>
                {billType === 'gst' ?
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ml-6">
                    <div>
                      <label htmlFor="tax percentage" className="mb-2 block text-sm font-medium">
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
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                    {selectedCustomer?.State === 'TamilNadu' ?
                      <>
                        <div>
                          <label htmlFor="cgst" className="mb-2 block text-sm font-medium">
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
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="sgst" className="mb-2 block text-sm font-medium">
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
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                      :
                      <div>
                        <label htmlFor="igst" className="mb-2 block text-sm font-medium">
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
                              className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                  : null}
              </div>
            </div>
          </fieldset>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div>
            <label htmlFor="afterTax" className="mb-2 block text-sm font-medium">
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
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div>
            <label htmlFor="roundOff" className="mb-2 block text-sm font-medium">
              Round Off
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="roundOff"
                  name="roundOff"
                  type="text"
                  placeholder="Enter round off"
                  value={roundOff}
                  onChange={(e) =>
                    setRoundOff(e.target.value)
                  }
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="discount" className="mb-2 block text-sm font-medium">
              Discount
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="discount"
                  name="discount"
                  type="text"
                  placeholder="Enter discount"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(e.target.value)
                  }
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div>
            <label htmlFor="invoiceAmount" className="mb-2 block text-sm font-medium">
              Invoice Amount
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="invoiceAmount"
                  name="invoiceAmount"
                  type="text"
                  disabled
                  value={(invoiceAmount || 0).toFixed(2)}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <PaymentForm
          invoiceAmount={invoiceAmount}
          invPayment={[]}
          setInvPayments={setInvPayments}
        />

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/invoices"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button
          type="button"
          loading={submitLoading}
          disabled={submitLoading}
          onClick={handleSubmit}
        >
          {submitLoading ? 'Creating Invoice...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
