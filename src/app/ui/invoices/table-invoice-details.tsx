'use client';

import { useState } from 'react';
import { PrintInvoice, UpdateInvoice, DeleteInvoice, DownloadInvoice } from '@/app/ui/invoices/buttons';
import { formatCurrency, formatDateNew, getFinancialYearShortNew } from '@/app/lib/utils';
import InvoiceStatus from './status';
import Link from 'next/link';

export default function TableInvoiceDetails({
    invoices,
    printMode
}: {
    invoices: any;
    printMode: any;
}) {
    const [hoverInvoiceId, setHoverInvoiceId] = useState<number | null>(null);
    const [invoiceDetails, setInvoiceDetails] = useState<any[]>([]);
    const [hoverPaymentId, setHoverPaymentId] = useState<number | null>(null);

    const handleMouseEnter = (InvoiceId: number, invoiceDetails: any) => {
        setHoverInvoiceId(InvoiceId);
        setInvoiceDetails(invoiceDetails);
    };

    const handleMouseLeave = () => {
        setHoverInvoiceId(null);
        setInvoiceDetails([]);
    };

    const handlePaymentMouseEnter = (InvoiceId: number) => {
        setHoverPaymentId(InvoiceId);
    };

    const handlePaymentMouseLeave = () => {
        setHoverPaymentId(null);
    };

    return invoices?.map((invoice: any, index: number) => (
        <tr
            key={`inv'${index}`}
            className={`w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg ${invoice?.IsCancel === 1 ? 'bg-red-100' : ''}`}
        >
            <td className="whitespace-nowrap py-3 pl-6 pr-3 col-billNumber">
                <div className="flex items-center">
                    <span className=''>
                        {invoice?.InvoiceType === 'Tax Invoice' ?
                            getFinancialYearShortNew(invoice.InvoiceDate) + '/AT/' + invoice?.InvoiceNumber.toString().padStart(2, '0')
                            : invoice.InvoiceType === 'Credit Note' ?
                                getFinancialYearShortNew(invoice.InvoiceDate) + '/AT-C/' + invoice?.InvoiceNumber.toString().padStart(2, '0')
                                : 'S-DC/' + invoice?.InvoiceNumber.toString().padStart(2, '0')
                        }
                    </span>
                </div>
                {invoice?.EwayBillNumber ?
                    <p className='pt-1 text-xs text-gray-500'>Eway No: {invoice?.EwayBillNumber}</p>
                    : null}
                {invoice?.DeliveryNote ?
                    <p className='pt-0.5 text-xs text-gray-500'>Note: {invoice?.DeliveryNote}</p>
                    : null}
            </td>
            <td className="whitespace-nowrap px-3 py-3 col-date">
                {formatDateNew(invoice.InvoiceDate)}
            </td>
            <td className="whitespace-nowrap py-3 pl-6 pr-3 col-customer">
                <div className="flex items-center gap-3">
                    <Link className='font-medium text-blue-600 hover:underline' href={`/admin/customers?query=${invoice?.CustomerName}`}>{invoice?.CustomerName}</Link>
                </div>
                <div className="flex items-center gap-3">
                    {invoice?.GstNumber}
                </div>
                <div className="flex items-center gap-3">
                    {invoice?.CustomerMobile}
                </div>
            </td>
            <td className="whitespace-nowrap py-3 pl-6 pr-3 col-gstNumber">
                <div className="flex items-center gap-3">
                    {formatCurrency(invoice?.BeforeTax)}
                </div>
                <div className="flex items-center gap-3">
                    {formatCurrency(Number(invoice?.Cgst || 0) + Number(invoice?.Sgst || 0) + Number(invoice?.Igst || 0) + Number(invoice?.RoundOff || 0))}
                </div>
            </td>
            <td className="whitespace-nowrap px-3 py-3 col-amount"
                onMouseEnter={() => handleMouseEnter(invoice.InvoiceId, invoice.invoice_details)}
                onMouseLeave={handleMouseLeave}
            >
                <span className='flex w-full'>{invoice?.InvoiceAmount ? formatCurrency(invoice.InvoiceAmount) : ""}</span>
                <span className='flex w-full pt-2 text-sm italic font-semibold'>Dot: {invoice?.invoice_details?.reduce((total: number, detail: any) => total + detail.Quantity, 0)}</span>

                {Number(hoverInvoiceId) === Number(invoice.InvoiceId) && (
                    <div className="absolute mt-2 w-1/3 border-2 border-gray-200 rounded-lg bg-white shadow-lg p-3 z-50 overflow-y-auto top-100 left-100">

                        <p className="text-center text-lg font-semibold mb-4">Purchase Details</p>

                        {invoiceDetails.length === 0 ? (
                            <p className="text-base text-gray-400">Loading...</p>
                        ) : (
                            <ul className="text-base space-y-1">
                                <li key={index} className="pb-2 border-b border-gray-200 mb-2 flex">
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
            <td className="whitespace-nowrap px-3 py-3 col-received">
                {invoice?.ReceivedAmount ? formatCurrency(invoice.ReceivedAmount) : ""}
            </td>
            <td className="whitespace-nowrap px-3 py-3 col-balance">
                {formatCurrency(invoice?.BalanceAmount || 0)}
            </td>
            <td className="whitespace-nowrap px-3 py-3 col-status"
                onMouseEnter={() => handlePaymentMouseEnter(invoice.InvoiceId)}
                onMouseLeave={handlePaymentMouseLeave}
            >
                <InvoiceStatus
                    ReceivedAmount={invoice?.ReceivedAmount || 0}
                    InvoiceAmount={invoice?.InvoiceAmount || 0}
                    BalanceAmount={invoice?.BalanceAmount || 0}
                    InvoiceDate={invoice.InvoiceDate}
                    IsCancel={invoice?.IsCancel}
                />

                {Number(hoverPaymentId) === Number(invoice.InvoiceId) && (
                    <div className="absolute mt-2 w-1/3 border-2 border-gray-200 rounded-lg bg-white shadow-lg p-3 z-50 overflow-y-auto top-100 left-100">

                        <p className="text-center text-lg font-semibold mb-4">Payment Details</p>

                        {invoice.invoice_payments.length === 0 ? (
                            <p className="text-base text-gray-400">No Payemnts Made</p>
                        ) : (
                            <>
                                <ul className="text-base space-y-1">
                                    <li key={index} className="pb-2 border-b border-gray-200 mb-2 flex">
                                        <span className="w-1/2 pr-4"><span className="font-semibold">Date</span></span>
                                        <span className="w-1/6 pr-4"><span className="font-semibold">Amount</span></span>
                                    </li>
                                    {invoice.invoice_payments.map((payDetail: any, index: number) => (
                                        <li key={index} className="pb-2 border-b border-gray-200 mb-2 flex">
                                            <span className="w-1/2 pr-4">{formatDateNew(payDetail.Date)}</span>
                                            <span className="w-1/6 pr-4">{payDetail.Amount}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className='flex justify-end text-lg'>
                                    <span className="pr-4"><span className="font-semibold">Total Paid</span></span>
                                    <span className="pr-4"><span className="font-semibold">{invoice?.ReceivedAmount}</span></span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </td>
            <td className="whitespace-nowrap py-3 pl-6 pr-3 no-print">
                <div className="flex justify-end gap-3">
                    <UpdateInvoice id={invoice.InvoiceId} />
                    <PrintInvoice id={invoice.InvoiceId} />
                    <DownloadInvoice invoice={invoice} />
                    <DeleteInvoice id={invoice.InvoiceId} />
                </div>
            </td>
        </tr>
    ))
}