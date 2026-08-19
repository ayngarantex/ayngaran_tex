'use client'
import { useRef, useState } from 'react';
import { formatCurrency, formatDate, formatDateNew, getFinancialYearShortNew } from '@/app/lib/utils';
import InvoiceStatus from '@/app/ui/invoices/status';
import { Button } from '@/app/ui/button';
import Link from 'next/link';

export default function LedgerInvoicePayment({ customer, invoices, payments, startDate, endDate }: { customer: any, invoices: any[], payments: any[], startDate: string, endDate: string }) {
    const [printOption, setPrintOption] = useState(false);
    const [hoverInvoiceId, setHoverInvoiceId] = useState<number | null>(null);
    const [invoiceDetails, setInvoiceDetails] = useState<any[]>([]);

    const printRef = useRef<HTMLDivElement>(null);
    const cusData = Array.isArray(customer) ? customer[0] : customer;
    const handlePrint = () => {
        if (!printRef.current) return; //✅ null check 
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        setPrintOption(false);
        window.location.reload();
    };

    const handleMouseEnter = (InvoiceId: number, invoiceDetails: any) => {
        setHoverInvoiceId(InvoiceId);
        setInvoiceDetails(invoiceDetails);
    };

    const handleMouseLeave = () => {
        setHoverInvoiceId(null);
        setInvoiceDetails([]);
    };

    return (
        <div>
            <div className='flex justify-end no-print mt-6'>
                <Button type="button" color={'blue'} onClick={
                    () => {
                        setPrintOption(true)
                        setTimeout(() => {
                            handlePrint()
                        }, 100);
                    }
                }>
                    Print
                </Button>
            </div>
            <div className='flex w-full mt-6 p-6 justify-between' id="" ref={printRef} >
                {printOption ?
                    <>
                        <div className='flex flex-wrap w-full border-b mb-3'>
                            <div className="w-1/3">
                                <label htmlFor="name" className="mb-2 text-sm font-bold">
                                    Customer Name
                                </label>
                                <div className="relative mt-2 tex-lg">
                                    {cusData?.CustomerName}
                                </div>
                            </div>
                            {cusData?.GstNumber ?
                                <div className="w-1/3 pl-8">
                                    <label htmlFor="name" className="mb-2 text-sm font-bold">
                                        GST Number
                                    </label>
                                    <div className="relative mt-2 tex-lg">
                                        {cusData?.GstNumber}
                                    </div>
                                </div>
                                : null}
                            <div className="w-1/3">
                                <label htmlFor="name" className="mb-2 text-sm font-bold">
                                    Ledger Date
                                </label>
                                <div className="relative mt-2 tex-lg">
                                    {formatDate(startDate)} - {formatDate(endDate)}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between bg-blue-50 mb-4 border-b">
                            <div className="relative tex-2xl w-40 text-blue-600 text-lg text-left">
                                Purchased: {formatCurrency(invoices.reduce((sum, item) => sum + (item?.InvoiceAmount || 0), 0))}
                            </div>
                            <div className="relative pl-4 tex-2xl w-40 text-blue-600 text-lg text-left">
                                Paid: {formatCurrency(payments.reduce((sum, item) => sum + item.TotalPaid, 0))}
                            </div>
                            <div className="relativeplt42 tex-2xl w-40 text-red-600 text-lg text-left">
                                Balance: {formatCurrency(invoices.reduce((sum, item) => sum + (item?.InvoiceAmount || 0), 0) - payments.reduce((sum, item) => sum + item.TotalPaid, 0))}
                            </div>
                        </div>
                    </>
                    : null}
                <div className={`${printOption ? 'w-full' : 'w-1/2 pr-5'}`}>
                    <div className="flex w-full items-center justify-between">
                        <h1 className={`text-2xl`}>Invoice&nbsp;Details</h1>
                        {/* {printOption && (
                            <div className="mb-4 w-full flex justify-end pt-2">
                                <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
                                    ({formatCurrency(invoices.reduce((sum, item) => sum + (item?.InvoiceAmount || 0), 0))})
                                </div>
                            </div>
                        )} */}
                    </div>
                    <div className="mt-6">
                        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
                            <table className="min-w-full text-gray-900">
                                <thead className="rounded-lg text-left text-sm font-normal">
                                    <tr className='font-bold'>
                                        <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                                            Bill Number
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-bold">
                                            Date
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-bold">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-bold">
                                            Received
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-bold">
                                            Balance
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-bold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {invoices?.map((invoice: any, index: number) => (
                                        <tr
                                            key={`inv'${invoice.InvoiceId}`}
                                            className={`w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg ${invoice.IsCancel === 1 ? 'bg-red-100' : ''}  ${invoice.InvoiceType === 'Credit Note' ? 'bg-red-300' : ''}`}
                                        >
                                            <td className={`whitespace-nowrap py-3 pl-6 pr-3`}>
                                                <div className="flex items-center"
                                                    onMouseEnter={() => handleMouseEnter(invoice.InvoiceId, invoice.invoice_details)}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    <Link className='text-blue-600' href={`/admin/invoices/${invoice.InvoiceId}/edit`}>
                                                        {new Date(invoice.InvoiceDate) > new Date('2026-03-31') || invoice.InvoiceType === 'Credit Note' ?
                                                            <>
                                                                {invoice.BillType === 'gst' && (
                                                                    <span className=''>
                                                                        {getFinancialYearShortNew(invoice.InvoiceDate)}/
                                                                        {invoice.InvoiceType === 'Credit Note' ? 'AT-C' : 'AT'}
                                                                        /
                                                                    </span>
                                                                )}
                                                                {invoice?.InvoiceNumber.toString().padStart(2, '0')}
                                                            </>
                                                            :
                                                            <>
                                                                <span className=''>{invoice.BillType === 'gst' ? 'GST' : 'DC'} - </span>
                                                                {invoice?.InvoiceNumber}
                                                            </>
                                                        }
                                                    </Link>
                                                </div>
                                                {invoice.DeliveryNote}

                                                {Number(hoverInvoiceId) === Number(invoice.InvoiceId) && (
                                                    <div className="absolute mt-2 w-1/3 border-2 border-gray-200 rounded-lg bg-white shadow-lg p-3 z-50 overflow-y-auto top-100 left-100">

                                                        <p className="text-center text-lg font-semibold mb-4">Purchase Details</p>

                                                        {invoiceDetails.length === 0 ? (
                                                            <p className="text-base text-gray-400">Loading...</p>
                                                        ) : (
                                                            <ul className="text-base space-y-1">
                                                                <li key={'hover_' + index} className="pb-2 border-b border-gray-200 mb-2 flex">
                                                                    <span className="w-1/2 pr-4"><span className="font-semibold">Name</span></span>
                                                                    <span className="w-1/6 pr-4"><span className="font-semibold">Qty</span></span>
                                                                    <span className="w-1/6 pr-4"><span className="font-semibold">Price</span></span>
                                                                    <span className="w-1/6 pr-4"><span className="font-semibold">Total</span></span>
                                                                </li>
                                                                {invoiceDetails.map((invDetail: any, index: number) => (
                                                                    <li key={index} className="pb-2 border-b border-gray-200 mb-2 flex">
                                                                        <span className="w-1/2 pr-4">{invDetail?.products?.Name}</span>
                                                                        <span className="w-1/6 pr-4">{invDetail?.Quantity}</span>
                                                                        <span className="w-1/6 pr-4">{invDetail.Price}</span>
                                                                        <span className="w-1/6 pr-4">{invDetail.Price * invDetail.Quantity}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}

                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3">
                                                {formatDateNew(invoice.InvoiceDate)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3 text-right">
                                                {invoice?.InvoiceAmount ? formatCurrency(invoice.InvoiceAmount) : ""}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3 text-right">
                                                {invoice?.ReceivedAmount ? formatCurrency(invoice.ReceivedAmount) : ""}
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-3 text-right">
                                                {formatCurrency(invoice?.InvoiceAmount - invoice.ReceivedAmount)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3">
                                                <InvoiceStatus
                                                    ReceivedAmount={invoice?.ReceivedAmount || 0}
                                                    BalanceAmount={invoice?.BalanceAmount || 0}
                                                    InvoiceAmount={invoice?.InvoiceAmount || 0}
                                                    InvoiceDate={invoice?.InvoiceDate}
                                                    IsCancel={invoice?.IsCancel}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {!printOption && (
                        <div className="mt-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="rounded-lg bg-blue-50 p-2 pt-6">
                                    <div className="mb-4 w-full flex justify-between">
                                        <label htmlFor="mobile" className="w-40 mb-2 block f text-sm self-center font-bold">
                                            Balance
                                        </label>
                                        <div className="relativeplt42 tex-2xl w-40 text-right  text-red-600 text-lg text-center">
                                            {formatCurrency(invoices.reduce((sum, item) => sum + (item?.InvoiceAmount || 0), 0) - payments.reduce((sum, item) => sum + item.TotalPaid, 0))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className={`${printOption ? 'w-full page-break' : 'w-1/2 pl-5'}`}>
                    <div className="flex w-full items-center">
                        <h1 className={`text-2xl`}>Payment&nbsp;Details</h1>
                        {/* {printOption && (
                            <div className="mb-4 w-full flex justify-end pt-2">
                                <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
                                    ({formatCurrency(payments.reduce((sum, item) => sum + item.TotalPaid, 0))})
                                </div>
                            </div>
                        )} */}
                    </div>
                    <div className="mt-6">
                        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
                            <table className="min-w-full text-gray-900">
                                <thead className="rounded-lg text-left text-lg font-medium">
                                    <tr className='font-bold'>
                                        <th scope="col" className="relative py-3 pl-3 pr-3 text-left">
                                            Date
                                        </th>
                                        <th scope="col" className="relative py-3 pl-6 pr-3">
                                            Bill
                                        </th>
                                        <th scope="col" className="relative py-3 pl-6 pr-3 text-right">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {payments?.map((pay: any, index: number) => (
                                        <tr
                                            key={`inv-'${index}`}
                                            className="w-full border-b py-3 text-base last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                        >
                                            <td className="whitespace-nowrap px-3 py-3">
                                                {formatDateNew(pay.Date)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3">
                                                {pay?.InvoiceNumber.join(', ')}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3 text-right">
                                                {pay?.TotalPaid ? formatCurrency(pay.TotalPaid) : ""}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {!printOption && (
                        <div className="mt-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
                                    <div className="mb-4 w-full flex">
                                        <label htmlFor="mobile" className="w-40 mb-2 block f text-sm self-center font-bold">
                                            Purchased
                                        </label>
                                        <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
                                            {formatCurrency(invoices.reduce((sum, item) => sum + (item?.InvoiceAmount || 0), 0))}
                                        </div>
                                    </div>
                                    <div className="w-full flex">
                                        <label htmlFor="mobile" className="w-40 block f text-sm self-center font-bold">
                                            Paid
                                        </label>
                                        <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
                                            {formatCurrency(payments.reduce((sum, item) => sum + item.TotalPaid, 0))}
                                        </div>
                                    </div>
                                    <div className="mb-4 w-full flex border-b text-black">&nbsp;</div>
                                    <div className="mb-4 w-full flex">
                                        <label htmlFor="mobile" className="w-40 mb-2 block f text-sm self-center font-bold">
                                            Balance
                                        </label>
                                        <div className="relativeplt42 tex-2xl w-40 text-right  text-red-600 text-lg text-center">
                                            {formatCurrency(invoices.reduce((sum, item) => sum + (item?.InvoiceAmount || 0), 0) - payments.reduce((sum, item) => sum + item.TotalPaid, 0))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}