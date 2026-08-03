"use client";

import { useEffect, useState, Suspense } from 'react';
import { getFinancialYears, getFinancialYear, loomsList, formatDateNew } from './utils';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useLoading } from '../ui/loading-context';

function FinancialyearInner({ hidePage = false, hideYear = false, orderBy = false, LoomName = false, LoomsFetch = false, looms = [], hideBillType = false, LoomStatus = false, sizing = false, sizingList = [] }: {
    hidePage?: boolean, hideYear?: boolean, orderBy?: boolean, LoomName?: boolean, LoomsFetch?: boolean, looms?: any[], hideBillType?: boolean, LoomStatus?: boolean, sizing?: boolean, sizingList?: any[]
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const { startTransition } = useLoading();

    const paramStartDate = searchParams.get('startDate');
    const paramEndDate = searchParams.get('endDate');

    const currentFy = getFinancialYear(new Date());
    const initialFy = paramStartDate && paramEndDate 
        ? getFinancialYear(paramStartDate)
        : currentFy;

    const [startYearSplit, endYearSplit] = initialFy.split("-").map(String);

    const [financialYear, setFinancialYear] = useState<string>(initialFy);
    const [startDate, setStartDate] = useState<string>(paramStartDate || (initialFy !== "All" ? `${startYearSplit}-04-01` : ""));
    const [endDate, setEndDate] = useState<string>(paramEndDate || (initialFy !== "All" ? `${endYearSplit}-03-31` : ""));
    const [billType, setBillType] = useState<string>(searchParams.get('billType') || "");
    const [orderByColumn, setOrderByColumn] = useState<string>(searchParams.get('orderBy') || "");
    const [loomName, setLoomName] = useState<string>(searchParams.get('loomName') || "");
    const [loomId, setLoomId] = useState<string>(searchParams.get('loomId') || "");
    const [sizingId, setSizingId] = useState<string>(searchParams.get('sizingId') || "");
    const [loomStatus, setLoomStatus] = useState<string>(searchParams.get('loomStatus') || "");

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (!hidePage) {
            params.set('page', "1")
        }

        if (startDate && endDate) {
            params.set('startDate', startDate)
            params.set('endDate', endDate)
        } else {
            params.delete('startDate');
            params.delete('endDate');
        }

        if (billType) {
            params.set('billType', billType);
        } else {
            params.delete('billType');
        }

        if (orderByColumn) {
            params.set('orderBy', orderByColumn);
        } else {
            params.delete('orderBy');
        }

        if (loomName) {
            params.set('loomName', loomName);
        } else {
            params.delete('loomName');
        }

        if (loomId) {
            params.set('loomId', loomId);
        } else {
            params.delete('loomId');
        }

        if (sizingId) {
            params.set('sizingId', sizingId);
        } else {
            params.delete('sizingId');
        }

        if (loomStatus) {
            params.set('loomStatus', loomStatus);
        } else {
            params.delete('loomStatus');
        }

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }, [startDate, endDate, billType, orderByColumn, loomName, loomId, loomStatus, sizingId])

    useEffect(() => {
        if (financialYear !== "All") {
            const [start, end] = financialYear.split("-").map(String);
            setStartDate(`${start}-04-01`);
            setEndDate(`${end}-03-31`);
        } else {
            setStartDate("");
            setEndDate("");
        }
    }, [financialYear])

    return (
        <div className="w-full flex">
            {!hideYear ?
                <div className="relative w-1/2">
                    <select
                        id="financialYear"
                        name="financialYear"
                        onChange={(e) => {
                            setFinancialYear(e.target.value);
                        }}
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
                        value={financialYear}
                    >
                        <option key={'All'} value={'All'}> All Financial Year </option>
                        {getFinancialYears(2022).map((year: string) => (
                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
                : null}
            {!hideBillType ?
                <div className="relative pl-2 w-1/2">
                    <select
                        id="billType"
                        name="billType"
                        onChange={(e) => {
                            setBillType(e.target.value)
                        }}
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
                        value={billType}
                    >
                        <option key={'select'} value={''}>Bill Type </option>
                        <option key='normal' value='normal'>Normal Bill</option>
                        <option key='gst' value='gst'>Gst Bill</option>
                    </select>
                </div>
                : null}
            {orderBy ?
                <div className="relative pl-2 w-1/2">
                    <select
                        id="orderBy"
                        name="orderBy"
                        onChange={(e) => {
                            setOrderByColumn(e.target.value)
                        }}
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
                        value={orderByColumn || ""}
                    >
                        <option key={'select'} value={''}>Name</option>
                        <option key='pending' value='pending'>Pending</option>
                    </select>
                </div>
                : null}
            {LoomsFetch ?
                <div className="relative pl-2 w-1/2">
                    <select
                        id="orderBy"
                        name="orderBy"
                        onChange={(e) => {
                            setLoomId(e.target.value)
                        }}
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
                    // value={orderBy}
                    >
                        <option key={'select'} value={''}> Select Loom </option>
                        {looms.map((row: any) => (
                            <option
                                key={row.LoomId}
                                value={row.LoomId}
                            >
                                {row.LoomName}
                            </option>
                        ))}
                    </select>
                </div>
                : null}
            {LoomName ?
                <div className="relative pl-2 w-1/2">
                    <select
                        id="orderBy"
                        name="orderBy"
                        onChange={(e) => {
                            setLoomName(e.target.value)
                        }}
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
                    // value={orderBy}
                    >
                        <option key={'select'} value={''}> Select Loom </option>
                        {loomsList().map((row) => (
                            <option
                                key={row}
                                value={row}
                            >
                                {row}
                            </option>
                        ))}
                    </select>
                </div>
                : null}

            {LoomStatus ?
                <div className="relative pl-2 w-1/2">
                    <select
                        id="loomStatus"
                        name="loomStatus"
                        onChange={(e) => {
                            setLoomStatus(e.target.value)
                        }}
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
                    >
                        <option key={'select'} value={''}>Loom Status</option>
                        <option key='Loaded' value='Loaded'>New</option>
                        <option key='Running' value='Running'>Running</option>
                        <option key='Completed' value='Completed'>Completed</option>
                    </select>
                </div>
                : null}

            {sizing ?
                <div className="relative pl-2 w-full">
                    <select
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
                        onChange={(e) => {
                            const value = e.target.value;
                            setSizingId(value)
                        }}
                    >
                        <option value="">Select Sizing</option>
                        {sizingList.map((item: any) => (
                            <option key={item.SizingId} value={item.SizingId}>
                                ({item.Color + " - " + (item?.TotalWarp || 0)})
                                {"  - " + (item?.InvoiceDate ? formatDateNew(item?.InvoiceDate) : "") + " " + (item?.DeliveredDate ? formatDateNew(item.DeliveredDate) : "") + " " + (item?.SizingName || "")}
                            </option>
                        ))}
                    </select>

                </div>
                : null}
        </div>
    )
}

export default function Financialyear(props: any) {
    return (
        <Suspense fallback={<div className="h-10 w-full bg-gray-150 rounded-md animate-pulse" />}>
            <FinancialyearInner {...props} />
        </Suspense>
    );
}