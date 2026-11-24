'use client'
import { ProductField } from '@/app/lib/definitions';
import { useRef, useMemo } from 'react';
import Image from "next/image"
import AyngaranLogo from '@/app/ui/ayngaran-logo.jpeg';
import { formatNewDate, statesList } from '@/app/lib/utils';
import PrintProduct from './print-products';
import Link from 'next/link';
import { Button } from '../button';

export default function PrintScreen({
    invoice,
    products
}: {
    invoice: any;
    products: ProductField[];
}) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // window.print(); // ✅ clean print
        if (!printRef.current) return; //✅ null check 
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const invoiceProductData = useMemo(() => {
        return invoice?.invoice_details ?? [];
    }, [invoice?.invoice_details]);

    return (
        <div className="p-8">
            <div className='flex justify-between no-print'>
                <Button type="button" color={'blue'} onClick={handlePrint}>
                    Print Invoice
                </Button>

                <Link
                    href="/admin/invoices"
                    className="flex h-10 items-center rounded-lg bg-blue-600 px-4 font-medium text-white"
                >
                    Back
                </Link>
            </div>

            {/* ✅ PRINT AREA */}
            <div id="print-area" ref={printRef} className="bg-white shadow pt-4">

                {/* HEADER */}
                <div className='border pt-3'>
                    <div className="flex justify-between items-start w-full">
                        <div className="w-full">
                            <div className='flex justify-between px-4 '>
                                <h1 className="text-xl font-bold">GSTIN: 33AYWPV5842M1ZD</h1>
                                <p className="text-xl font-boldmb-2 self-center flex">Tamilnadu (33)</p>
                            </div>

                            <div className="flex justify-between items-center gap-4 w-full pr-4">
                                <div className='flex'>
                                    <Image
                                        src={AyngaranLogo}
                                        alt="Ayngaran Logo"
                                        className="w-[120px] h-[60px] object-contain"
                                    />
                                    <div className="flex flex-col flex-wrap">
                                        <h1 className="text-4xl font-bold uppercase tracking-[0.25rem] text-center leading-tight">
                                            AYNGARAN TEX
                                        </h1>
                                        <h2 className="text-base no-wrap border-t ">
                                            198B, Sabari Cables, Anna Nagar, Bhavani 638301
                                        </h2>
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold text-right">Cell: 9003613503</h1>
                                    <h1 className="text-xl font-bold text-right">9994874400</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className='py-1 bg-blue-200 flex justify-center text-xl border-t border-r mt-2'>{invoice?.BillType === 'gst' ? 'Tax Invoice' : 'Delivery Chalan | Not for Sale'}</p>
                    <div className='flex flex-wrap border-t'>
                        <div className='pr-4 py-4 w-2/5 border-r pl-2'>
                            <p className="text-base mb-2 self-start w-full flex">
                                <span className='w-32'>Invoice No # </span>
                                <span className='text-sm font-medium'>{invoice?.InvoiceNumber}</span>
                            </p>
                            <p className="text-base mb-2 self-start w-full flex"><span className='w-32'>Invoice Date : </span> <span className='text-sm font-medium'>{invoice?.InvoiceDate ? formatNewDate(invoice?.InvoiceDate) : ""}</span></p>
                            {invoice?.EwayBillNumber ?
                                <p className="text-base mb-2 self-start w-full flex">
                                    <span className='w-32'>Eway No : </span>
                                    <span className='text-sm font-medium'>{invoice?.EwayBillNumber}</span>
                                </p>
                                : null}
                        </div>
                        <div className=' py-1 w-3/5'>
                            <p className="text-base self-center flex py-1 pl-4">
                                <span className='w-24'>Name: </span>
                                <span className='capitalize'>{invoice?.customers?.CustomerName}</span>
                            </p>
                            <p className="text-base self-center flex pb-1 pl-4">
                                <span className='w-24'>Address: </span>
                                <span className='text-wrap capitalize text-sm'>{invoice?.customers?.Address?.toLowerCase()}</span>
                            </p>
                            {invoice?.customers?.Address2 ?
                                <p className="text-base self-center flex pb-1 pl-4">
                                    <span className='w-24'>&nbsp;</span>
                                    <span className='text-wrap capitalize text-sm'>{invoice?.customers?.Address2?.toLowerCase()}</span>
                                </p>
                                : null}
                            {invoice?.customers?.GstNumber ?
                                <p className="text-base self-center flex pb-1 pl-4">
                                    <span className='w-24'>GSTIN: </span>
                                    <span className='uppercase'>{invoice?.customers?.GstNumber}</span>
                                </p>
                                : null}
                            <div className='flex justify-between'>
                                <p className="text-base self-center flex pb-1 pl-4">
                                    <span className='w-24'>State: </span>
                                    <span>{invoice?.customers?.State}</span>
                                    <span className='pl-2 text-sm'>({invoice?.customers?.State ?
                                        statesList().filter(e => e.label === invoice?.customers?.State)?.[0].code
                                        : ""})</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow">
                        <PrintProduct
                            invoice={invoice}
                            invProducts={invoiceProductData}
                            products={products}
                            customer={invoice?.customers}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}