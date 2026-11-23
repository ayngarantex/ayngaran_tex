'use client'
import { ProductField } from '@/app/lib/definitions';
import { useRef, useMemo } from 'react';
import Image from "next/image"
import AyngaranLogo from '@/app/ui/ayngaran-logo.jpeg';
import { formatNewDate } from '@/app/lib/utils';
import Link from 'next/link';
import { Button } from '../button';
import PrintProductDc from './print-products-dc';

export default function PrintScreenDC({
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
        // document.body.innerHTML = originalContents;
        // window.location.reload();
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
                                <h1 className="text-xs font-bold">GSTIN: 33AYWPV5842M1ZD</h1>
                                <div>
                                    <h1 className="text-xs font-bold text-right">Cell: 9003613503</h1>
                                    <h1 className="text-xs font-bold text-right">9994874400</h1>
                                </div>
                            </div>

                            <div className="flex justify-between items-center gap-4 w-full pr-4">
                                <div className='flex'>
                                    <Image
                                        src={AyngaranLogo}
                                        alt="Ayngaran Logo"
                                        className="w-[60px] h-[40px] object-contain border-l"
                                    />
                                    <div className="flex flex-col flex-wrap pl-2">
                                        <h1 className="text-xs nowrap font-bold uppercase tracking-[0.5rem] text-center leading-tight">
                                            AYNGARAN&nbsp;TEX
                                        </h1>
                                        <h2 className="text-xs no-wrap border-t flex justify-center">
                                            198B, Sabari Cables, Anna Nagar,
                                        </h2>
                                        <h2 className="text-xs no-wrap flex justify-center">
                                            Bhavani 638301
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className='py-1 bg-blue-200 border-y flex justify-center text-xs mt-2'>Delivery Chalan | Not for Sale</p>
                    <div className='flex flex-wrap justify-between my-1 px-1'>
                        <p className="text-xs">
                            <span className='w-24'>No # : </span>
                            <span className='text-xs font-medium text-left'>{invoice?.InvoiceNumber}</span>
                        </p>
                        <p className="text-xs"><span className='w-24'>Date : </span> <span className='text-xs font-medium'>{invoice?.InvoiceDate ? formatNewDate(invoice?.InvoiceDate) : ""}</span></p>
                    </div>
                    <div className='flex flex-wrap px-1 pb-2'>
                        <p className="text-xs self-center flex py-1 w-full">
                            <span className='w-8'>To: </span>
                            <span className='w-full'>{invoice?.customers?.CustomerName}</span>
                        </p>
                        <p className="text-xs self-center flex py-1 w-full">
                            <span className='w-8'>&nbsp;</span>
                            <span className='text-wrap w-full'>{invoice?.customers?.Address?.toLowerCase()}</span>
                        </p>
                    </div>

                    {/* ✅ TABLE grows */}
                    <div className="flex-grow">
                        <PrintProductDc
                            invoice={invoice}
                            invProducts={invoiceProductData}
                            products={products}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}