'use client'
import { useRef, useState, useEffect } from 'react';
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
        if (!printRef.current) return;
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

    // Calculate totals
    const totalPurchased = invoices
        .filter((inv) => inv.InvoiceType !== 'Credit Note')
        .reduce((sum, item) => sum + (item?.InvoiceAmount || 0), 0);

    const totalPaid = payments.reduce((sum, item) => sum + item.TotalPaid, 0);

    // Merge and chronologically sort invoices and payments
    const combinedItems = [
        ...invoices.map((inv) => ({
            date: new Date(inv.InvoiceDate),
            dateStr: inv.InvoiceDate,
            type: 'Invoice',
            refId: `invoice_${inv.InvoiceId}`,
            data: inv,
            debit: inv.InvoiceType === 'Credit Note' ? 0 : inv.InvoiceAmount,
            credit: inv.InvoiceType === 'Credit Note' ? inv.InvoiceAmount : 0,
        })),
        ...payments.map((pay) => ({
            date: new Date(pay.Date),
            dateStr: pay.Date,
            type: 'Payment',
            refId: `payment_${pay.Date}_${pay.BillType}`,
            data: pay,
            debit: 0,
            credit: pay.TotalPaid,
        }))
    ];

    combinedItems.sort((a, b) => {
        const timeDiff = a.date.getTime() - b.date.getTime();
        if (timeDiff !== 0) return timeDiff;
        // Invoices first on the same date
        if (a.type === 'Invoice' && b.type === 'Payment') return -1;
        if (a.type === 'Payment' && b.type === 'Invoice') return 1;
        return 0;
    });

    // Compute running balance
    let runningBalance = 0;
    const ledgerRows = combinedItems.map((item) => {
        if (item.type === 'Invoice') {
            const isCreditNote = item.data.InvoiceType === 'Credit Note';
            const isCancel = item.data.IsCancel === 1;
            const change = (isCreditNote || isCancel) ? 0 : item.debit;
            runningBalance += change;
        } else {
            runningBalance -= item.credit;
        }
        return {
            ...item,
            balance: runningBalance,
        };
    });

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
            <div className={`flex flex-col w-full mt-6 p-2 md:p-6 justify-between gap-6 ${printOption ? 'print-layout' : ''}`} ref={printRef} >
                {printOption && (
                    <>
                        <div className='flex flex-wrap w-full border-b mb-3'>
                            <div className="w-1/3">
                                <label className="text-sm font-bold text-gray-500">
                                    Customer Name
                                </label>
                                <div className="mt-1 text-lg font-semibold text-gray-800">
                                    {cusData?.CustomerName}
                                </div>
                            </div>
                            {cusData?.GstNumber && (
                                <div className="w-1/3 pl-8">
                                    <label className="text-sm font-bold text-gray-500">
                                        GST Number
                                    </label>
                                    <div className="mt-1 text-lg font-semibold text-gray-800">
                                        {cusData?.GstNumber}
                                    </div>
                                </div>
                            )}
                            <div className="w-1/3">
                                <label className="text-sm font-bold text-gray-500">
                                    Ledger Date
                                </label>
                                <div className="mt-1 text-lg font-semibold text-gray-800">
                                    {formatDate(startDate)} - {formatDate(endDate)}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between bg-blue-50 mb-4 p-3 border-b rounded-md">
                            <div className="text-blue-600 font-bold text-md">
                                Purchased: {formatCurrency(totalPurchased)}
                            </div>
                            <div className="text-blue-600 font-bold text-md pl-4">
                                Paid: {formatCurrency(totalPaid)}
                            </div>
                            <div className="text-red-600 font-bold text-md pl-4">
                                Balance: {formatCurrency(totalPurchased - totalPaid)}
                            </div>
                        </div>
                    </>
                )}

                <div className="w-full">
                    <div className="flex w-full items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-800">Statement of Account (Ledger)</h1>
                    </div>
                    <div className="mt-6">
                        <div className="rounded-lg bg-blue-50 p-2 md:pt-0 overflow-x-auto w-full">
                            <table className="min-w-full text-gray-900 table-fixed">
                                <thead className="rounded-lg text-left text-sm font-normal">
                                    <tr className='font-bold text-gray-700 border-b border-gray-200'>
                                        <th scope="col" style={{ width: '110px' }} className="px-4 py-5 font-bold">
                                            Date
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-bold">
                                            Reference / Particulars
                                        </th>
                                        <th scope="col" style={{ width: '130px' }} className="px-3 py-5 font-bold text-right">
                                            Debit (Invoice)
                                        </th>
                                        <th scope="col" style={{ width: '130px' }} className="px-3 py-5 font-bold text-right">
                                            Credit (Payment)
                                        </th>
                                        <th scope="col" style={{ width: '140px' }} className="px-3 py-5 font-bold text-right">
                                            Balance
                                        </th>
                                        <th scope="col" style={{ width: '110px' }} className="px-3 py-5 font-bold text-left">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {ledgerRows.map((item: any, index: number) => {
                                        const isInvoice = item.type === 'Invoice';
                                        const isCreditNote = isInvoice && item.data.InvoiceType === 'Credit Note';
                                        const isCancel = isInvoice && item.data.IsCancel === 1;

                                        let rowBg = 'bg-white';
                                        if (isCancel) rowBg = 'bg-red-100';
                                        else if (isCreditNote) rowBg = 'bg-red-300';
                                        else if (item.type === 'Payment') rowBg = 'bg-emerald-50/40';

                                        return (
                                            <tr
                                                key={item.refId}
                                                className={`w-full border-b py-3 text-sm last-of-type:border-none ${rowBg}`}
                                            >
                                                {/* Date */}
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {formatDateNew(item.dateStr)}
                                                </td>

                                                {/* Reference / Particulars */}
                                                <td className="px-3 py-3 relative">
                                                    {isInvoice ? (
                                                        <div>
                                                            <div className="flex items-center"
                                                                onMouseEnter={() => handleMouseEnter(item.data.InvoiceId, item.data.invoice_details)}
                                                                onMouseLeave={handleMouseLeave}
                                                            >
                                                                <Link className='text-blue-600 font-semibold hover:underline' href={`/admin/invoices/${item.data.InvoiceId}/edit`}>
                                                                    {new Date(item.data.InvoiceDate) > new Date('2026-03-31') || item.data.InvoiceType === 'Credit Note' ?
                                                                        <>
                                                                            {item.data.BillType === 'gst' && (
                                                                                <span>
                                                                                    {getFinancialYearShortNew(item.data.InvoiceDate)}/
                                                                                    {item.data.InvoiceType === 'Credit Note' ? 'AT-C' : 'AT'}
                                                                                    /
                                                                                </span>
                                                                            )}
                                                                            {item.data?.InvoiceNumber.toString().padStart(2, '0')}
                                                                        </>
                                                                        :
                                                                        <>
                                                                            <span>{item.data.BillType === 'gst' ? 'GST' : 'DC'} - </span>
                                                                            {item.data?.InvoiceNumber}
                                                                        </>
                                                                    }
                                                                </Link>
                                                            </div>
                                                            {item.data.DeliveryNote && (
                                                                <div className="text-xs text-gray-500 mt-0.5">{item.data.DeliveryNote}</div>
                                                            )}
                                                            {Number(hoverInvoiceId) === Number(item.data.InvoiceId) && (
                                                                <div className="absolute mt-2 w-80 border-2 border-gray-200 rounded-lg bg-white shadow-lg p-3 z-50 overflow-y-auto left-4">
                                                                    <p className="text-center text-sm font-semibold mb-2 text-gray-700">Purchase Details</p>
                                                                    {invoiceDetails.length === 0 ? (
                                                                        <p className="text-xs text-gray-400">Loading...</p>
                                                                    ) : (
                                                                        <ul className="text-xs space-y-1 text-gray-600">
                                                                            <li key={'hover_' + index} className="pb-1 border-b border-gray-200 mb-1 flex font-semibold text-gray-800">
                                                                                <span className="w-1/2 pr-2">Name</span>
                                                                                <span className="w-1/6 pr-2">Qty</span>
                                                                                <span className="w-1/6 pr-2">Price</span>
                                                                                <span className="w-1/6">Total</span>
                                                                            </li>
                                                                            {invoiceDetails.map((invDetail: any, idx: number) => (
                                                                                <li key={idx} className="pb-1 border-b border-gray-200 mb-1 flex">
                                                                                    <span className="w-1/2 pr-2 truncate">{invDetail?.products?.Name}</span>
                                                                                    <span className="w-1/6 pr-2">{invDetail?.Quantity}</span>
                                                                                    <span className="w-1/6 pr-2">{invDetail.Price}</span>
                                                                                    <span className="w-1/6">{invDetail.Price * invDetail.Quantity}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm font-medium text-gray-700">
                                                            Payment Received {item.data?.InvoiceNumber?.length ? `(Bill: ${item.data.InvoiceNumber.join(', ')})` : ''}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Debit (Invoice) */}
                                                <td className="whitespace-nowrap px-3 py-3 text-right">
                                                    {isInvoice && item.debit ? formatCurrency(item.debit) : "-"}
                                                </td>

                                                {/* Credit (Payment) */}
                                                <td className="whitespace-nowrap px-3 py-3 text-right text-emerald-700 font-medium">
                                                    {item.credit ? formatCurrency(item.credit) : "-"}
                                                </td>

                                                {/* Running Balance */}
                                                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                                                    {formatCurrency(item.balance)}
                                                </td>

                                                {/* Status */}
                                                <td className="whitespace-nowrap px-3 py-3">
                                                    {isInvoice ? (
                                                        <InvoiceStatus
                                                            ReceivedAmount={item.data?.ReceivedAmount || 0}
                                                            BalanceAmount={item.data?.BalanceAmount || 0}
                                                            InvoiceAmount={item.data?.InvoiceAmount || 0}
                                                            InvoiceDate={item.data?.InvoiceDate}
                                                            IsCancel={item.data?.IsCancel}
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-green-700 font-semibold bg-green-100 px-2.5 py-1 rounded">Paid</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {!printOption && (
                        <div className="mt-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="rounded-lg bg-blue-50 p-6 flex flex-wrap gap-12 justify-start">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500">
                                            Total Purchased
                                        </label>
                                        <div className="mt-1 text-2xl font-semibold text-blue-600">
                                            {formatCurrency(totalPurchased)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500">
                                            Total Paid
                                        </label>
                                        <div className="mt-1 text-2xl font-semibold text-blue-600">
                                            {formatCurrency(totalPaid)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500">
                                            Closing Balance
                                        </label>
                                        <div className="mt-1 text-2xl font-semibold text-red-600">
                                            {formatCurrency(totalPurchased - totalPaid)}
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