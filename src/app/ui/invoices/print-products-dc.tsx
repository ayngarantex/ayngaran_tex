import { ProductField } from "@/app/lib/definitions";
import React, { useEffect, useState } from "react";
import { ProductRow } from '@/app/lib/types';
import { formatCurrency, numberToIndianWords, productType } from "@/app/lib/utils";

interface ProductsProps {
  invoice: any,
  invProducts: any;
  products: ProductField[];
}


export default function PrintProduct({ invoice, invProducts, products }: ProductsProps) {
  const [fillTdRow, setFillTdRow] = useState<any[]>([])
  useEffect(() => {
    let fillTdRows = []
    let int = 13 - invProducts.length
    for (let i = 0; i <= int; i++) {
      fillTdRows.push(i)
    }

    setFillTdRow(fillTdRows)
  }, [invProducts])

  return (
    <div className="">
      <div className="">
        <table className="pt-4 w-full border-t">
          <thead>
            <tr className="bg-blue-100">
              <th className="border-b border-l text-xs px-2 py-1 text-left" style={{ width: "40px" }}>No.</th>
              <th className="border-b text-xs border-l px-2 py-1 text-center" colSpan={2} style={{ width: "200px" }}>Item</th>
              <th className="border-b text-xs px-2 py-1 text-right" style={{ width: "80px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invProducts?.length ?
              invProducts.map((row: any, rowIndex: number) => (
                <tr className="" key={"text_" + rowIndex}>
                  <td style={{ height: "40px" }} className="text-xs px-2 py-1">{rowIndex + 1}</td>
                  <td className="text-xs border-l px-2 py-1">
                    <div className="flex flex-wrap">
                      {row.ItemId ? products.filter(e => e.Id === row.ItemId)?.[0].Name : ""}
                      {row?.Type === 'Unfold' ?
                        <span className="pl-2 italic text-xs">( {row.Type} )</span>
                        : null}
                    </div>
                  </td>
                  <td className="px-2 py-1 text-right text-xs">{row.Quantity}&nbsp;*&nbsp;{parseFloat(row.Price).toFixed(2)}</td>
                  <td className="border-l px-2 py-1 text-right text-xs">{(parseFloat(row.Total).toFixed(2))}</td>
                </tr>
              ))
              : null}
            {fillTdRow?.length ?
              fillTdRow.map((row: any, rowIndex: number) => (
                <tr className="" key={"fillRow_" + rowIndex}>
                  <td style={{ height: "40px" }} className="px-2 py-1">&nbsp;</td>
                  <td className="border-l px-2 py-1">&nbsp;</td>
                  <td className=" px-2 py-1 text-right">&nbsp;</td>
                  <td className="border-l px-2 py-1 text-right">&nbsp;</td>
                </tr>
              ))
              : null}
          </tbody>
        </table>
      </div>
      <div className="print-footer-fixed">
        <div className={`flex flex-wrap border-t w-full`} id="banking">
          <div className={`text-right w-full`}>
            <div className="border-0 pl-2 align-top justify-end w-full flex">
              <span className='py-1 text-xs text-left pl-4' style={{ width: "181px" }}> Total Amount</span>
              <span className="pt-1 text-right text-xs" style={{ width: "120px" }}>{invoice?.InvoiceAmount ? formatCurrency(invoice?.InvoiceAmount) : ""}</span>
            </div>
          </div>
        </div>
        <div className="border-t align-top text-left flex justify-end h-20" id="terms">
          <div className="flex flex-wrap justify-end py-2" style={{ width: "140px" }}>
            <p className="w-full self-start text-center text-xs  font-semibold"><span className="font-normal">for</span> Ayngaran Tex</p>
          </div>
        </div>
      </div>
    </div>
  );
}