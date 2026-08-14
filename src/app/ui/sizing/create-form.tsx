'use client'
import { SupplierField } from '@/app/lib/definitions';
import { SizingRow, PaymentRow } from '@/app/lib/types';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useEffect, useState } from 'react';
import WarpForm from './warp-form';
import PaymentForm from './payment-form';
import { useRouter } from 'next/navigation';
import { currentDate, formatDate } from '@/app/lib/utils';
import SizingItems from './sizing-items';
import { createSizing } from '@/app/api/node/sizing';
// import { createInvoice } from '@/app/lib/actions';
export default function Form({
  suppliers,
  yarns,
  looms,
}: {
  suppliers: SupplierField[];
  yarns: any,
  looms: any
}) {
  const router = useRouter();
  const [selectedSupplier, setSelectedSuppliers] = useState<SupplierField | null>(null);
  const [selectedYarns, setSelectedYarns] = useState<any | null>(null);
  const [invioceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    currentDate()
  );
  const [warpType, setWarpType] = useState("Section");
  const [yarnGiven, setYarnGiven] = useState<any>([]);
  const [warpDetails, setWarpDetails] = useState<SizingRow[]>([]);
  const [invPayments, setInvPayments] = useState<PaymentRow[]>([]);

  const [yarnId, setYarnId] = useState(0);
  const [transport, setTransport] = useState(0);
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
  const [color, setColor] = useState("")
  const [meters, setMeters] = useState(0)
  const [yarnSent, setYarnSent] = useState(0)
  const [yarnUsed, setYarnUsed] = useState(0)
  const [yarnBalance, setYarnBalance] = useState(0)
  const [price, setPrice] = useState("")
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = Number(e.target.value);
    const customer = suppliers.find(c => Number(c.SupplierId) === supplierId) || null;
    setSelectedSuppliers(customer);
  };

  const handleSubmit = async () => {
    if (submitLoading) return;
    setSubmitLoading(true);
    let payments = invPayments;
    const invoiceData = {
      SupplierId: selectedSupplier?.SupplierId,
      InvoiceNumber: invioceNumber,
      InvoiceDate: invoiceDate,
      WarpType: warpType,
      Color: color,
      Meters: meters,
      YarnId: yarnId,
      YarnSent: yarnSent,
      YarnUsed: yarnUsed,
      YarnBalance: yarnBalance,
      Price: price,
      BeforeTax: beforeTax,
      TaxPercentage: taxPercentage,
      Cgst: cgstAmount,
      Sgst: sgstAmount,
      Igst: igstAmount,
      AfterTax: afterTax,
      BillType: billType,
      RoundOff: roundOff,
      InvoiceAmount: invoiceAmount,
      PaidAmount: paidAmount,
      ReceivedAmount: paidAmount
    };

    if (payments.length === 1 && payments[0].date === 'date') {
      payments = []
    }

    try {
      const data = await createSizing({
        invoiceData,
        products: warpDetails,
        payments: payments,
        sizingYarn: yarnGiven
      });

      if (data?.SizingId) {
        router.push('/admin/sizing');
      } else {
        setSubmitLoading(false);
      }
    } catch (err) {
      setSubmitLoading(false);
      console.error(err);
    }
  };

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
      let taxAmount = Math.round((beforeTax / 100) * taxPercentage * 100) / 100;
      let stateTax = taxPercentage / 2;
      let cgstAmount = Math.round((beforeTax / 100) * stateTax * 100) / 100;
      setCgstAmount(cgstAmount);
      setSgstAmount(cgstAmount);
      setIgstAmount(taxAmount);
    }
  }, [billType, taxPercentage, beforeTax])

  useEffect(() => {
    let taxAmount = Math.round((beforeTax / 100) * taxPercentage * 100) / 100;

    let afterTax = parseFloat(String(beforeTax)) + (billType === 'gst' ? taxAmount : 0);

    // Round to 2 decimal places
    afterTax = Math.round(afterTax * 100) / 100;

    setAfterTax(afterTax);

    let roundInt = parseFloat(String(roundOff));
    let invoiceAmount = afterTax;

    if (roundInt) {
      invoiceAmount = afterTax + roundInt;
    }

    // Round to 2 decimals safely
    invoiceAmount = Math.round((invoiceAmount + Number.EPSILON) * 100) / 100;

    setInvoiceAmount(invoiceAmount);
  }, [taxPercentage, beforeTax, roundOff, billType])

  useEffect(() => {
    let paidAmount = 0
    invPayments.forEach(row => {
      paidAmount += Number(row.amount)
    })
    setPaidAmount(paidAmount)
  }, [invPayments])

  useEffect(() => {
    if (warpType === 'Direct') {
      let calAmount = parseFloat(String(meters)) * parseFloat(String(price))
      let fixes = parseFloat(calAmount?.toFixed(2)) + parseFloat(String(transport?.toFixed(2)))
      setBeforeTax(fixes)
    } else {
      let calAmount = parseFloat(String(yarnUsed)) * parseFloat(String(price))
      let fixes = parseFloat(calAmount?.toFixed(2)) + parseFloat(String(transport?.toFixed(2)))
      setBeforeTax(fixes)
    }
  }, [warpType, price, yarnUsed, transport])

  const handelYarnDetails = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const YarnId = Number(e.target.value);
    const yarn = yarns.find((y: any) => y.YarnId === YarnId) || null;
    let yarn_details = yarn?.yarn_details.filter((e: any) => e.Count !== 'Freight')
    const yarnDetails: any = {}
    yarnDetails.yarn = yarn_details
    yarnDetails.supplier = yarn?.suppliers?.Name
    yarnDetails.InvoiceNumber = yarn?.InvoiceNumber
    yarnDetails.InvoiceDate = yarn?.InvoiceDate
    setSelectedYarns(yarnDetails);
    setYarnId(YarnId)
  };

  useEffect(() => {
    let totalYarnUsed = 0
    let totalYarnSent = 0
    let totalYarnBalance = 0
    yarnGiven.forEach((row: any) => {
      totalYarnUsed += parseFloat(row.yarnUsed)
      totalYarnSent += parseFloat(row.yarnSent)
      totalYarnBalance += parseFloat(row.yarnBalance)
    })

    setYarnSent(totalYarnSent)
    setYarnUsed(totalYarnUsed)
    setYarnBalance(totalYarnBalance)
  }, [yarnGiven])

  useEffect(() => {
    const totalMeters = warpDetails?.length && warpDetails.reduce(
      (sum, row) => sum + row?.meters,
      0
    );

    setMeters(totalMeters)
  }, [warpDetails])

  return (
    <form>
      <div className="rounded-md bg-blue-50 p-4 md:p-6">
        {/* Customer Select */}
        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/3">
            <label htmlFor="customer" className="mb-2 block text-sm font-medium">
              Choose Supplier
            </label>
            <div className="flex items-center">
              <div className="relative w-2/3">
                <select
                  id="customer"
                  name="supplierId"
                  onChange={handleCustomerChange}
                  className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a Supplier
                  </option>
                  {suppliers.map((sup) => (
                    <option
                      key={sup.SupplierId}
                      value={sup.SupplierId}
                    >
                      {sup.Name}
                    </option>
                  ))}
                </select>
                <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>

              <Link
                href="/admin/suppliers/create"
                className="flex h-10 items-center rounded-lg bg-blue-400 px-4 text-2xl font-medium text-white ml-4">
                +
              </Link>
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
                value={selectedSupplier?.GstNumber || ''}
                readOnly
                placeholder="GST Number will appear here"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className='flex flex-wrap'>
          {/* Invoice Number */}
          <div className="mb-4 w-1/4">
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
                    setInvoiceNumber(e.target.value)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mb-8 w-1/4 ml-8">
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
        </div>

        <div className='flex flex-wrap'>
          <div className="mb-4 w-1/4">
            <label htmlFor="customer" className="mb-2 block text-sm font-medium">
              Yarn Details
            </label>
            <div className="relative">
              <select
                id="customer"
                name="supplierId"
                onChange={handelYarnDetails}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                defaultValue=""
              >
                <option value="" disabled>
                  Select
                </option>
                {yarns.map((sup: any) => (
                  <option
                    key={sup.YarnId}
                    value={sup.YarnId}
                  >
                    {`${sup?.suppliers?.Name} - ${sup.InvoiceNumber}`}
                  </option>
                ))}
              </select>
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div className="mb-8 w-1/4 ml-8">
            <label htmlFor="warpType" className="mb-2 block text-sm font-medium">
              Warp Type
            </label>
            <div className="relative">
              <select
                id="warpType"
                name="warpType"
                onChange={(e) => setWarpType(e.target.value)}
                value={warpType || ''}
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-4 outline-2 placeholder:text-gray-500"
              >
                <option value="" disabled>Select</option>
                <option value="Section">Section</option>
                <option value="Direct">Direct</option>
              </select>
            </div>
          </div>
        </div>
        {selectedYarns ?
          <div className='bg-blue-300 rounded-lg p-4 my-4'>
            <div className='flex flex-wrap'>
              <div className="mb-4 w-1/4">
                <label htmlFor="color" className="mb-2 block text-sm font-medium">
                  Supplier
                </label>
                <div className="relative mt-2">{selectedYarns?.InvoiceNumber}</div>
              </div>
              <div className="mb-4 w-1/4 ml-8">
                <label htmlFor="color" className="mb-2 block text-sm font-medium">
                  Invoice Number
                </label>
                <div className="relative mt-2">{selectedYarns?.InvoiceNumber}</div>
              </div>
              <div className="mb-4 w-1/4 ml-8">
                <label htmlFor="color" className="mb-2 block text-sm font-medium">
                  Invoice Date
                </label>
                <div className="relative mt-2">{selectedYarns?.InvoiceDate ? formatDate(selectedYarns?.InvoiceDate) : ""}</div>
              </div>
            </div>
            {selectedYarns?.yarn?.length ?
              selectedYarns.yarn.map((row: any, rowIndex: number) => (
                <div
                  key={`selP_${rowIndex}`}
                  className="flex gap-5 bg-blue-100 items-center mb-2 rounded-md p-3"
                >
                  <div className='w-1/6'>
                    <label htmlFor="color" className="mb-2 block text-lg font-medium">
                      Count
                    </label>
                    <div className="relative mt-4">{row?.Count}</div>
                  </div>
                  <div className='w-1/6'>
                    <label htmlFor="color" className="mb-2 block text-lg font-medium">
                      Color
                    </label>
                    <div className="relative mt-4">{row?.Color}</div>
                  </div>
                  <div className='w-1/6'>
                    <label htmlFor="color" className="mb-2 block text-lg font-medium">
                      Bag
                    </label>
                    <div className="relative mt-4">{row?.Bag}</div>
                  </div>
                  <div className='w-1/6'>
                    <label htmlFor="color" className="mb-2 block text-lg font-medium">
                      Quantity
                    </label>
                    <div className="relative mt-4">{row?.Quantity}</div>
                  </div>
                  <div className='w-1/6'>
                    <label htmlFor="color" className="mb-2 block text-lg font-medium">
                      Price
                    </label>
                    <div className="relative mt-4">{row?.Price}</div>
                  </div>
                  <div className='w-1/6'>
                    <label htmlFor="color" className="mb-2 block text-lg font-medium">
                      Total
                    </label>
                    <div className="relative mt-4">{row?.Total}</div>
                  </div>
                </div>
              ))
              : null}
          </div>
          : null}

        <SizingItems
          yarnGiven={[]}
          setYarnGiven={setYarnGiven}
        />

        <WarpForm
          warpDetails={[]}
          setWarpDetails={setWarpDetails}
          looms={looms}
        />

        <div className='flex flex-wrap mt-4'>
          <div className="mb-4 w-1/5">
            <label htmlFor="color" className="mb-2 block text-sm font-medium">
              Warp Color
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="color"
                name="color"
                type="text"
                placeholder="Enter color"
                value={color || ""}
                onChange={(e) => {
                  setColor(e.target.value)
                }}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="mb-4 w-1/5 pl-6">
            <label htmlFor="meters" className="mb-2 block text-sm font-medium">
              Meters
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="meters"
                name="meters"
                type="text"
                placeholder="Enter meters"
                value={meters || ""}
                readOnly
                disabled
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className='flex flex-wrap mt-4'>
          <div className="mb-4 w-1/5">
            <label htmlFor="color" className="mb-2 block text-sm font-medium">
              Yarn Sent
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="color"
                name="color"
                type="text"
                placeholder="Enter color"
                value={yarnSent || ""}
                readOnly
                disabled
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="mb-4 w-1/5 pl-6">
            <label htmlFor="balance" className="mb-2 block text-sm font-medium">
              Yarn Balance
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="balance"
                name="balance"
                type="text"
                placeholder="Enter balance"
                value={yarnBalance?.toFixed(2) || ""}
                readOnly
                disabled
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>
        <div className='flex flex-wrap mt-4'>
          <div className="mb-4 w-1/5">
            <label htmlFor="used" className="mb-2 block text-sm font-medium">
              Yarn Used
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="used"
                name="used"
                type="text"
                placeholder="Enter used"
                value={yarnUsed?.toFixed(2) || ""}
                readOnly
                disabled
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
          <div className="mb-4 w-1/5 pl-6">
            <label htmlFor="price" className="mb-2 block text-sm font-medium">
              Price
            </label>
            <div className="relative mt-2 rounded-md">
              <input
                id="price"
                name="price"
                type="nymber"
                step="any"
                placeholder="Price"
                value={price || ""}
                onChange={(e) => {
                  setPrice(e.target.value)
                }}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className='flex flex-wrap mt-6'>
          <div className="mb-4 w-1/4">
            <label htmlFor="transport" className="mb-2 block text-sm font-medium">
              Transport
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="transport"
                  name="transport"
                  type="number"
                  step="any"
                  placeholder="Enter transport"
                  value={transport}
                  onChange={(e) => {
                    setTransport(Number(e.target.value))
                  }}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap mt-6'>
          <div className="mb-4 w-1/4">
            <label htmlFor="beforeTax" className="mb-2 block text-sm font-medium">
              Before Tax
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="invoice"
                  name="invoice"
                  type="text"
                  disabled
                  placeholder="Enter Invoice"
                  value={(beforeTax || 0).toFixed(2)}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
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
            {selectedSupplier?.State === 'TamilNadu' ?
              <>
                <div className="mb-4 w-1/8 ml-8">
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

                <div className="mb-4 w-1/8 ml-8">
                  <label htmlFor="cgst" className="mb-2 block text-sm font-medium">
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
              <div className="mb-4 w-1/8 ml-8">
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

        <div className="mt-4 w-1/4">
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

        <div className="mt-4 w-1/4">
          <label htmlFor="roundOff" className="mb-2 block text-sm font-medium">
            Round Off
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="roundOff"
                name="roundOff"
                type="number"
                step="any"
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

        <div className="mt-4 w-1/4">
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
                value={invoiceAmount || 0}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        <PaymentForm
          invPayment={[]}
          setInvPayments={setInvPayments}
          invoiceAmount={invoiceAmount}
        />

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/sizing"
          className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
        >
          Cancel
        </Link>
        <Button type="button" disabled={submitLoading} onClick={handleSubmit}>
          {submitLoading ? 'Saving...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
