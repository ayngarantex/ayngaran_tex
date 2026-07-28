'use client'
import { ProductField } from '@/app/lib/definitions';
import { useRef, useMemo, useState } from 'react';
import Image from "next/image"
import AyngaranLogo from '@/app/ui/ayngaran-logo.jpeg';
import { formatNewDate, getFinancialYearShort, statesList } from '@/app/lib/utils';
import PrintProduct from './print-products';
import Link from 'next/link';
import { Button } from '../button';
import PrintScreenInvoiceDetails from './print-screen-invoice-details';

export default function PrintScreen({
    invoice,
    products,
    customer
}: {
    invoice: any;
    products: ProductField[];
    customer: any
}) {
    const printRef = useRef<HTMLDivElement>(null);
    const [showDuplicateCopy, setShowDuplicateCopy] = useState(false);
    const [printOriginalCopy, setPrintOriginalCopy] = useState(true);
    const [printDuplicateCopy, setPrintDuplicateCopy] = useState(false);

    const handlePrint = () => {
        setShowDuplicateCopy(true);
        // window.print(); // ✅ clean print
        if (!printRef.current) return; //✅ null check 
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        setShowDuplicateCopy(false);
        window.location.reload();
    };

    const invoiceProductData = useMemo(() => {
        return invoice?.invoice_details ?? [];
    }, [invoice?.invoice_details]);

    return (
        <div className="p-8">
            <div className='flex justify-between no-print'>
                <Button type="button" color={'blue'} onClick={
                    () => {
                        setShowDuplicateCopy(true)
                        setTimeout(() => {
                            handlePrint()
                        }, 100);
                    }
                }>
                    Print Invoice
                </Button>

                <Link
                    href="/admin/invoices"
                    className="flex h-10 items-center rounded-lg bg-blue-600 px-4 font-medium text-white"
                >
                    Back
                </Link>
            </div>

            {/* <div className='flex gap-4 pb-4'> */}
            <div className="flex items-center pt-3 no-print">
                <input
                    id="pending"
                    name="status"
                    type="checkbox"
                    value="pending"
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-blue-100 text-gray-600 focus:ring-2"
                    onChange={(e) => setPrintOriginalCopy(e.target.checked)}
                    checked={printOriginalCopy}
                />
                <label
                    htmlFor="pending"
                    className="ml-2 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-600 pt-1"
                >
                    Original for Recipent
                </label>
            </div>
            <div className="flex items-center pt-3 no-print">
                <input
                    id="pending"
                    name="status"
                    type="checkbox"
                    value="pending"
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-blue-100 text-gray-600 focus:ring-2"
                    onChange={(e) => setPrintDuplicateCopy(e.target.checked)}
                    checked={printDuplicateCopy}
                />
                <label
                    htmlFor="pending"
                    className="ml-2 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-600 pt-1"
                >
                    Duplicate for Supplier / Transporter
                </label>
            </div>
            {/* </div> */}

            {/* ✅ PRINT AREA */}
            <div id="print-area" ref={printRef} className="bg-white shadow pt-4 print-container">
                {printOriginalCopy ?
                    <div className="invoice">
                        <PrintScreenInvoiceDetails
                            invoice={invoice}
                            products={products}
                            type={'ORIGINAL FOR RECIPIENT'}
                            customer={customer}
                        />
                    </div>
                    : null}
                {showDuplicateCopy && printDuplicateCopy ?
                    <div className="invoice print-container">
                        <PrintScreenInvoiceDetails
                            invoice={invoice}
                            products={products}
                            type={'Duplicate'}
                            customer={customer}
                        />
                    </div>
                    : null}
            </div>
        </div>
    );
}