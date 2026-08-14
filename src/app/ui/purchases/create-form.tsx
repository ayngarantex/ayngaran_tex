'use client'
import { SupplierField } from '@/app/lib/definitions';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useEffect, useState } from 'react';
import ProductForm, { PurchaseProductRow } from './products-form';
import PaymentForm, { PurchasePaymentRow } from './payment-form';
import { useRouter } from 'next/navigation';
import { currentDate } from '@/app/lib/utils';
import { createPurchase } from '@/app/api/node/purchases';

export default function Form({
  suppliers
}: {
  suppliers: SupplierField[];
}) {
  const router = useRouter();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierField | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(currentDate());
  const [productsList, setProductsList] = useState<PurchaseProductRow[]>([
    { pId: 0, itemName: "", quantity: 0, price: 0, quantityType: "pcs" }
  ]);
  const [paymentsList, setPaymentsList] = useState<PurchasePaymentRow[]>([
    { pId: 0, date: "date", amount: "", type: "Bank", to: "" }
  ]);

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
  const [paidAmount, setPaidAmount] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = Number(e.target.value);
    const supplier = suppliers.find(c => Number(c.SupplierId) === supplierId) || null;
    setSelectedSupplier(supplier);
  };

  const handleSubmit = async () => {
    if (submitLoading) return;
    setSubmitLoading(true);
    let payments = paymentsList;
    const invoiceData = {
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
      payments = [];
    }

    try {
      const data = await createPurchase({
        invoiceData,
        products: productsList,
        payments: payments
      });

      if (data?.PurchaseId) {
        router.push('/admin/purchases');
      } else {
        setSubmitLoading(false);
      }
    } catch (err) {
      setSubmitLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    let beforeTax = 0;
    productsList.forEach(row => {
      beforeTax += row.quantity * row.price;
    });
    setBeforeTax(beforeTax);
  }, [productsList, billType]);

  useEffect(() => {
    if (billType === 'gst') {
      let stateTax = taxPercentage / 2;
      setCgstPercentage(stateTax);
      setSgstPercentage(stateTax);
      setIgstPercentage(taxPercentage);
    }
  }, [taxPercentage, billType]);

  useEffect(() => {
    if (billType === 'gst') {
      let taxAmount = (beforeTax / 100) * taxPercentage;
      let stateTax = taxPercentage / 2;
      setCgstAmount((beforeTax / 100) * stateTax);
      setSgstAmount((beforeTax / 100) * stateTax);
      setIgstAmount(taxAmount);
    }
  }, [billType, taxPercentage, beforeTax]);

  useEffect(() => {
    let taxAmount = (beforeTax / 100) * taxPercentage;
    let afterTax = beforeTax + (billType === 'gst' ? taxAmount : 0);
    setAfterTax(afterTax);

    let roundInt = parseFloat(String(roundOff));
    let invoiceAmount = afterTax;
    if (roundInt) {
      invoiceAmount += roundInt;
    }
    setInvoiceAmount(invoiceAmount);
  }, [taxPercentage, beforeTax, roundOff, billType]);

  useEffect(() => {
    let paidAmount = 0;
    paymentsList.forEach(row => {
      paidAmount += Number(row.amount);
    });
    setPaidAmount(paidAmount);
  }, [paymentsList]);

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Supplier Select */}
        <div className='flex flex-wrap mb-6'>
          <div className="w-1/4">
            <label htmlFor="supplier" className="mb-2 block text-base font-medium">
              Choose Supplier
            </label>
            <div className="relative">
              <select
                id="supplier"
                name="supplierId"
                onChange={handleSupplierChange}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-base outline-2 placeholder:text-gray-500 bg-white"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a supplier
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
          <Link
            href={"/admin/suppliers/create"}
            className="flex h-10 items-center rounded-lg bg-blue-400 px-4 text-2xl font-medium text-white ml-4 self-end"
          >
            +
          </Link>
          <div className="w-1/4 ml-8">
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
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className='flex flex-wrap'>
          {/* Invoice Number */}
          <div className="mb-4 w-1/4">
            <label htmlFor="invoice" className="mb-2 block text-base font-medium">
              Invoice Number
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="invoice"
                  name="invoice"
                  type="text"
                  placeholder="Enter Invoice"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 uppercase bg-white"
                  onChange={(e) => {
                    setInvoiceNumber(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mb-8 w-1/4 ml-8">
            <label htmlFor="invoiceDate" className="mb-2 block text-base font-medium">
              Invoice Date
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="invoiceDate"
                  name="invoiceDate"
                  type="date"
                  placeholder="Date"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-white"
                  value={invoiceDate}
                  onChange={(e) => {
                    setInvoiceDate(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <ProductForm
          products={productsList}
          setProductsList={setProductsList}
        />

        <div className='flex flex-wrap mt-6'>
          <div className="mb-4 w-1/4">
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
                  value={beforeTax || 0}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-blue-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-base font-medium">
            Bill Type
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3 w-max">
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
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-base font-medium text-gray-600"
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
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-base font-medium text-gray-600"
                >
                  Normal
                </label>
              </div>
            </div>
          </div>
        </fieldset>
        {billType === 'gst' ?
          <div className='flex flex-wrap pt-6'>
            <div className="w-1/4">
              <label htmlFor="taxPercentage" className="mb-2 block text-base font-medium">
                Tax Percentage
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="taxPercentage"
                    name="taxPercentage"
                    type="text"
                    placeholder="Enter tax percentage"
                    value={taxPercentage}
                    onChange={(e) => {
                      setTaxPercentage(Number(e.target.value))
                    }}
                    className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-white"
                  />
                </div>
              </div>
            </div>
            {selectedSupplier?.State === 'TamilNadu' ?
              <>
                <div className="mb-4 w-1/8 ml-8">
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
                        value={cgstAmount}
                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-blue-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4 w-1/8 ml-8">
                  <label htmlFor="sgst" className="mb-2 block text-base font-medium">
                    SGST ({sgstPercentage})%
                  </label>
                  <div className="relative mt-2 rounded-md">
                    <div className="relative">
                      <input
                        id="sgst"
                        name="sgst"
                        type="text"
                        disabled
                        value={sgstAmount}
                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </>
              :
              <div className="mb-4 w-1/8 ml-8">
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
                      value={igstAmount}
                      className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-blue-100"
                    />
                  </div>
                </div>
              </div>
            }
          </div>
          : null}

        <div className="mt-4 w-1/4">
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
                value={afterTax || 0}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 w-1/4">
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
                value={roundOff}
                onChange={(e) =>
                  setRoundOff(e.target.value)
                }
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-base outline-2 placeholder:text-gray-500 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 w-1/4">
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
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-lg outline-2 placeholder:text-gray-500 bg-blue-100 font-bold"
              />
            </div>
          </div>
        </div>

        <PaymentForm
          paymentsList={[]}
          invoiceAmount={invoiceAmount}
          setPaymentsList={setPaymentsList}
        />

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/purchases"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-base font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" onClick={() => {
          setSubmitLoading(true)
          if (!submitLoading) {
            handleSubmit()
          }
        }}>Add Purchase</Button>
      </div>
    </form>
  );
}
