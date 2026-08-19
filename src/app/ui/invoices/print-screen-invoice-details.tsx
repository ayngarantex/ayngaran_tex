'use client'
import { ProductField } from '@/app/lib/definitions';
import { useRef, useMemo } from 'react';
import Image from "next/image"
import AyngaranLogo from '@/app/ui/ayngaran-logo.jpeg';
import { formatDateNew, getFinancialYearShortNew, statesList } from '@/app/lib/utils';
import PrintProduct from './print-products';

export default function PrintScreenInvoiceDetails({
    invoice,
    products,
    type,
    customer
}: {
    invoice: any;
    products: ProductField[];
    type: string;
    customer: any
}) {
    const printRef = useRef<HTMLDivElement>(null);

    const invoiceProductData = useMemo(() => {
        return invoice?.invoice_details ?? [];
    }, [invoice?.invoice_details]);

    return (
        <>
            {invoice?.BillType === 'gst' ?
                <p className="self-center flex justify-end pb-2 font-bold uppercase">{type}</p>
                : null}
            <div className='border pt-3 m-1'>
                <div className="flex justify-between items-start w-full">
                    <div className="w-full">
                        <div className='flex justify-between px-4 '>
                            <h1 className="text-xl font-bold">GSTIN: 33AYWPV5842M1ZD</h1>
                            {/* <p className="self-center flex">({type})</p> */}
                            <p className="text-xl font-boldmb-2 self-center flex">Tamilnadu (33)</p>
                        </div>

                        <div className="flex justify-between items-center gap-4 w-full pr-4">
                            <div className='flex'>
                                <Image
                                    src={AyngaranLogo}
                                    alt="Ayngaran Logo"
                                    width={120}
                                    height={60}
                                    className="w-[120px] h-[60px] object-contain"
                                    unoptimized
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
                <p className='py-1 bg-blue-200 flex justify-center text-xl border-t mt-2'>
                    {invoice?.BillType === 'gst' ? 'Tax Invoice' : 'Delivery Chalan | Not for Sale'}
                </p>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 border-t'>
                    <div className='px-4 py-4 w-2/5 border-r'>
                        <p className="text-base mb-2 self-start w-full flex">
                            <span className='w-32'>Invoice No # </span>
                            {invoice?.BillType === 'gst' ?
                                <span className='text-sm font-medium'>{getFinancialYearShortNew(invoice?.InvoiceDate)}/AT/{invoice?.InvoiceNumber?.toString().padStart(2, '0')}</span>
                                : <span className='text-sm font-medium'>{invoice?.InvoiceNumber?.toString().padStart(2, '0')}</span>
                            }
                        </p>
                        <p className="text-base mb-2 self-start w-full flex"><span className='w-32'>Invoice Date : </span> <span className='text-sm font-medium'>{invoice?.InvoiceDate ? formatDateNew(invoice?.InvoiceDate) : ""}</span></p>
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
                            <span className='capitalize '>{customer?.CustomerName}</span>
                        </p>
                        <p className="text-base self-center flex pb-1 pl-4">
                            <span className='min-w-24'>Address: </span>
                            <span className='text-wrap capitalize text-sm'>{customer?.Address?.toLowerCase()}&nbsp;{customer?.Address2?.toLowerCase()}</span>
                        </p>
                        {customer?.GstNumber ?
                            <p className="text-base self-center flex pb-1 pl-4">
                                <span className='w-24'>GSTIN: </span>
                                <span className='uppercase'>{customer?.GstNumber}</span>
                            </p>
                            : null}
                        <div className='flex justify-between'>
                            <p className="text-base self-center flex pb-1 pl-4">
                                <span className='w-24'>State: </span>
                                <span>{customer?.State}</span>
                                <span className='pl-2 text-sm'>({customer?.State ?
                                    statesList().filter(e => e.label === customer?.State)?.[0].code
                                    : ""})</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ✅ TABLE grows */}
                <div className="flex-grow">
                    <PrintProduct
                        invoice={invoice}
                        invProducts={invoiceProductData}
                        products={products}
                        customer={customer}
                    />
                </div>
            </div>
        </>
    );
}