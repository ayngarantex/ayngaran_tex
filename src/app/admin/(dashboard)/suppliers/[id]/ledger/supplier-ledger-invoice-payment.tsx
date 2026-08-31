'use client'
import { useRef, useState } from 'react';
import { formatCurrency, formatDate, formatDateNew } from '@/app/lib/utils';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

export default function SupplierLedgerInvoicePayment({ supplier, invoices, payments, startDate, endDate }: { supplier: any, invoices: any[], payments: any[], startDate: string, endDate: string }) {
    const searchParams = useSearchParams();
    const isPrintMode = searchParams.get('print') === 'true';
    const filterTypeParam = searchParams.get('filterType') as 'all' | 'debit' | 'credit';

    const [printOption, setPrintOption] = useState(isPrintMode);
    const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>(filterTypeParam || 'all');
    const [downloading, setDownloading] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);
    const supData = Array.isArray(supplier) ? supplier[0] : supplier;
    const isSizing = supData?.Type === 'Sizing';

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

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            if (filterType) params.set('filterType', filterType);
            const billType = searchParams.get('billType');
            if (billType) params.set('billType', billType);

            const response = await fetch(`/api/suppliers/${supData.Id}/pdf?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to download PDF");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const fileName = `ledger_supplier_${supData.Name.replace(/\s+/g, '_')}.pdf`;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Error downloading PDF");
        } finally {
            setDownloading(false);
        }
    };

    // Calculate totals
    const totalPurchased = invoices.reduce((sum, item) => sum + (item?.InvoiceAmount || 0), 0);
    const totalPaid = payments.reduce((sum, item) => sum + Number(item.Amount || 0), 0);

    // Merge and chronologically sort invoices and payments
    const combinedItems = [
        ...invoices.map((inv) => ({
            date: new Date(inv.InvoiceDate),
            dateStr: inv.InvoiceDate,
            type: 'Invoice',
            refId: `invoice_${isSizing ? inv.SizingId : inv.YarnId}`,
            data: inv,
            debit: inv.InvoiceAmount || 0,
            credit: 0,
        })),
        ...payments.map((pay, idx) => ({
            date: new Date(pay.Date),
            dateStr: pay.Date,
            type: 'Payment',
            refId: `payment_${pay.Date}_${idx}`,
            data: pay,
            debit: 0,
            credit: Number(pay.Amount || 0),
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
            runningBalance += item.debit;
        } else {
            runningBalance -= item.credit;
        }
        return {
            ...item,
            balance: runningBalance,
        };
    });

    const filteredRows = ledgerRows.filter((item) => {
        if (filterType === 'all') return true;
        if (filterType === 'debit') return item.type === 'Invoice';
        if (filterType === 'credit') return item.type === 'Payment';
        return true;
    });

    // For multi-page printing, paginate rows: Page 1 fits 16 rows, other pages fit 14
    const pages: any[][] = [];
    if (printOption) {
        let currentPageRows: any[] = [];
        const isSinglePage = filteredRows.length <= 14;
        filteredRows.forEach((row, idx) => {
            currentPageRows.push(row);
            const limit = isSinglePage ? 14 : (pages.length === 0 ? 11 : 15);
            if (currentPageRows.length === limit || idx === filteredRows.length - 1) {
                pages.push(currentPageRows);
                currentPageRows = [];
            }
        });
    }

    return (
        <div>
            <div className='flex justify-between items-center no-print mt-6'>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Filter Type:</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as 'all' | 'debit' | 'credit')}
                        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10"
                    >
                        <option value="all">Show All</option>
                        <option value="debit">Debit Only (Invoices)</option>
                        <option value="credit">Credit Only (Payments)</option>
                    </select>
                </div>
                <div className="flex gap-2">
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
                    <Button
                        type="button"
                        color="blue"
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                        className="flex items-center gap-2"
                    >
                        <div className='flex'>
                            {downloading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            ) : (
                                <ArrowDownTrayIcon className="w-5" />
                            )}
                            Download PDF
                        </div>
                    </Button>
                </div>
            </div>

            <div className={`flex flex-col w-full mt-6 p-2 md:p-6 justify-between gap-6 print:mt-0 print:p-0 print:gap-0 ${printOption ? 'print-layout' : ''}`} ref={printRef} >
                {printOption && (
                    <>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                                @media print {
                                    * {
                                        color: #000000 !important;
                                        border-color: #c0c0c0 !important;
                                    }
                                    .bg-blue-50, .bg-blue-100, .bg-red-100, .bg-red-300, .bg-green-200 {
                                        background-color: transparent !important;
                                    }
                                    .break-before-page {
                                        page-break-before: always !important;
                                        break-before: page !important;
                                    }
                                }
                            `
                        }} />
                        <div className='flex flex-wrap w-full border-b mb-3'>
                            <div className="w-1/3">
                                <label className="text-sm font-bold text-gray-500">
                                    Supplier Name
                                </label>
                                <div className="mt-1 text-lg font-semibold text-gray-800">
                                    {supData?.Name}
                                </div>
                            </div>
                            {supData?.GstNumber && (
                                <div className="w-1/3 pl-8">
                                    <label className="text-sm font-bold text-gray-500">
                                        GST Number
                                    </label>
                                    <div className="mt-1 text-lg font-semibold text-gray-800">
                                        {supData?.GstNumber}
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
                    {printOption ? (
                        /* Print layout: Render separated tables per page with carried forward values */
                        pages.map((pageRows, pageIdx) => {
                            const isFirstPage = pageIdx === 0;
                            const isLastPage = pageIdx === pages.length - 1;

                            const pageDebit = pageRows.reduce((sum, r) => sum + r.debit, 0);
                            const pageCredit = pageRows.reduce((sum, r) => sum + r.credit, 0);
                            const openingBalance = isFirstPage ? 0 : pages[pageIdx - 1][pages[pageIdx - 1].length - 1].balance;
                            const closingBalance = pageRows[pageRows.length - 1].balance;

                            return (
                                <div key={pageIdx} className={`w-full ${pageIdx > 0 ? 'break-before-page mt-8' : ''}`}>
                                    {pageIdx > 0 && (
                                        <div className="flex justify-between border-b pb-2 mb-4 text-xs font-bold text-gray-500 uppercase">
                                            <span>Ledger Statement: {supData?.Name}</span>
                                            <span>Page {pageIdx + 1} of {pages.length}</span>
                                        </div>
                                    )}
                                    <div className="rounded-lg bg-blue-50 p-2 md:pt-0 overflow-x-auto w-full mb-6">
                                        <table className="min-w-full text-gray-900 table-fixed">
                                            <thead className="rounded-lg text-left text-sm font-normal">
                                                <tr className='font-bold text-gray-700 border-b border-gray-200'>
                                                    <th scope="col" style={{ width: '110px' }} className="px-4 py-5 font-bold">Date</th>
                                                    <th scope="col" className="px-3 py-5 font-bold">Details</th>
                                                    <th scope="col" style={{ width: '130px' }} className="px-3 py-5 font-bold text-right">Invoice</th>
                                                    <th scope="col" style={{ width: '130px' }} className="px-3 py-5 font-bold text-right">Payment</th>
                                                    <th scope="col" style={{ width: '140px' }} className="px-3 py-5 font-bold text-right">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white">
                                                {!isFirstPage && (
                                                    <tr className="bg-gray-50 text-xs italic text-gray-600 border-b">
                                                        <td className="px-4 py-2"></td>
                                                        <td className="px-3 py-2 font-medium">Balance Brought Forward (b/f)</td>
                                                        <td className="px-3 py-2 text-right">-</td>
                                                        <td className="px-3 py-2 text-right">-</td>
                                                        <td className="px-3 py-2 text-right font-semibold">{formatCurrency(openingBalance)}</td>
                                                    </tr>
                                                )}

                                                {pageRows.map((item: any, index: number) => {
                                                    const isInvoice = item.type === 'Invoice';
                                                    const editUrl = isSizing
                                                        ? `/admin/sizing/${item.data.SizingId || item.data.YarnId}/edit`
                                                        : `/admin/yarns/${item.data.YarnId}/edit`;

                                                    return (
                                                        <tr key={item.refId} className={`w-full border-b py-4 text-sm last-of-type:border-none bg-white`}>
                                                            <td className="whitespace-nowrap px-4 py-4">{formatDateNew(item.dateStr)}</td>
                                                            <td className="px-3 py-4 relative">
                                                                {isInvoice ? (
                                                                    <div>
                                                                        <div className="flex items-center">
                                                                            <span className="font-semibold text-gray-800">
                                                                                Invoice: {item.data.InvoiceNumber}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm font-medium text-gray-700">
                                                                        Payment: {item.data.Type || 'Paid'}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-right">{isInvoice && item.debit ? formatCurrency(item.debit) : "-"}</td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-right text-emerald-700 font-medium">{item.credit ? formatCurrency(item.credit) : "-"}</td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-right font-semibold">{formatCurrency(item.balance)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="border-t-2 border-gray-300 font-bold bg-blue-50/50">
                                                {isLastPage ? (
                                                    <tr className="text-sm text-gray-800 border-t border-gray-300">
                                                        <td className="px-4 py-4">Grand Total</td>
                                                        <td className="px-3 py-4 text-xs italic text-gray-500">
                                                            Closing Balance
                                                        </td>
                                                        <td className="px-3 py-4 text-right">
                                                            {formatCurrency(filteredRows.reduce((sum, r) => sum + r.debit, 0))}
                                                        </td>
                                                        <td className="px-3 py-4 text-right text-emerald-800">
                                                            {formatCurrency(filteredRows.reduce((sum, r) => sum + r.credit, 0))}
                                                        </td>
                                                        <td className="px-3 py-4 text-right text-red-800">
                                                            {formatCurrency(filteredRows[filteredRows.length - 1]?.balance || 0)}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <tr className="text-sm text-gray-800">
                                                        <td className="px-4 py-4">Page Total</td>
                                                        <td className="px-3 py-4 text-xs italic text-gray-500">
                                                            Balance Carried Forward (c/f)
                                                        </td>
                                                        <td className="px-3 py-4 text-right">{formatCurrency(pageDebit)}</td>
                                                        <td className="px-3 py-4 text-right text-emerald-800">{formatCurrency(pageCredit)}</td>
                                                        <td className="px-3 py-4 text-right text-red-800">{formatCurrency(closingBalance)}</td>
                                                    </tr>
                                                )}
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* Default screen layout: Render a single continuous scrollable table */
                        <>
                            <div className="flex w-full items-center justify-between">
                                <h1 className="text-2xl font-semibold text-gray-800">Statement of Account (Supplier Ledger)</h1>
                            </div>
                            <div className="mt-6">
                                <div className="rounded-lg bg-blue-50 p-2 md:pt-0 overflow-x-auto w-full">
                                    <table className="min-w-full text-gray-900 table-fixed">
                                        <thead className="rounded-lg text-left text-sm font-normal">
                                            <tr className='font-bold text-gray-700 border-b border-gray-200'>
                                                <th scope="col" style={{ width: '110px' }} className="px-4 py-5 font-bold">Date</th>
                                                <th scope="col" className="px-3 py-5 font-bold">Details</th>
                                                <th scope="col" style={{ width: '130px' }} className="px-3 py-5 font-bold text-right">Invoice</th>
                                                <th scope="col" style={{ width: '130px' }} className="px-3 py-5 font-bold text-right">Payment</th>
                                                <th scope="col" style={{ width: '140px' }} className="px-3 py-5 font-bold text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {filteredRows.map((item: any, index: number) => {
                                                const isInvoice = item.type === 'Invoice';
                                                const editUrl = isSizing
                                                    ? `/admin/sizing/${item.data.SizingId || item.data.YarnId}/edit`
                                                    : `/admin/yarns/${item.data.YarnId}/edit`;

                                                return (
                                                    <tr key={item.refId} className={`w-full border-b py-4 text-sm last-of-type:border-none bg-white`}>
                                                        {/* Date */}
                                                        <td className="whitespace-nowrap px-4 py-4">{formatDateNew(item.dateStr)}</td>

                                                        {/* Details */}
                                                        <td className="px-3 py-4 relative">
                                                            {isInvoice ? (
                                                                <div>
                                                                    <div className="flex items-center">
                                                                        <Link className='text-blue-600 font-semibold hover:underline' href={editUrl}>
                                                                            Invoice: {item.data.InvoiceNumber}
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm font-medium text-gray-700">
                                                                    Payment: {item.data.Type || 'Paid'}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Debit */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-right">{isInvoice && item.debit ? formatCurrency(item.debit) : "-"}</td>

                                                        {/* Credit */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-right text-emerald-700 font-medium">{item.credit ? formatCurrency(item.credit) : "-"}</td>

                                                        {/* Balance */}
                                                        <td className="whitespace-nowrap px-3 py-4 text-right font-semibold">{formatCurrency(item.balance)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="border-t-2 border-gray-300 font-bold bg-blue-50/50">
                                            <tr className="text-sm text-gray-800">
                                                <td className="px-4 py-4">Total</td>
                                                <td className="px-3 py-4"></td>
                                                <td className="px-3 py-4 text-right">{formatCurrency(totalPurchased)}</td>
                                                <td className="px-3 py-4 text-right text-emerald-800">{formatCurrency(totalPaid)}</td>
                                                <td className="px-3 py-4 text-right text-red-800">{formatCurrency(totalPurchased - totalPaid)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

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
