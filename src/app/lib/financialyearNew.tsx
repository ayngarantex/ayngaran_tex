"use client";

import { useEffect, useState } from 'react';
import { getFinancialYears, loomsList } from './utils';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { FinancialyearNewProps } from './types';

export default function FinancialyearNew({
  hideYear = false,
  orderBy = false,
  LoomName = false,
  hideBillType = false,
  setFilter,
}: FinancialyearNewProps) {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");    
    const [billType, setBillType] = useState<string>("");
    const [orderByColumn, setOrderByColumn] = useState<string>("");    
    const [loomName, setLoomName] = useState<string>("");

    useEffect(() => {
        setFilter(startDate, endDate, billType, orderByColumn, loomName)
    }, [startDate, endDate, billType, orderByColumn, loomName])

    return (
        <div className="w-full flex">
            {!hideYear ?
                <div className="relative w-1/2">
                    <select
                        id="financialYear"
                        name="financialYear"
                        onChange={(e) => {
                            let startDate = '';
                            let endDate = '';
                            if(e.target.value !== "select") {
                                const [start, end] = e.target.value.split("-").map(String);
                                startDate = `${start}-04-01` ;
                                endDate = `${end}-03-31`;
                            }
                            // alert(startDate)
                            setStartDate(startDate);
                            setEndDate(endDate);
                        }}
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
                        // value={financialYear}
                    >
                        <option key={'select'} value={'select'}> Financial Year </option>
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
                        // value={billType}
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
                        // value={orderBy}
                    >
                        <option key={'select'} value={''}>Name</option>
                        <option key='pending' value='pending'>Pending</option>
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
                        <option key={'select'} value={'select'}> Loom </option>
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
        </div>
    )
}