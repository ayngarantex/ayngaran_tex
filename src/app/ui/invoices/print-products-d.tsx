import { ProductField } from "@/app/lib/definitions";
import React, { useEffect, useState } from "react";
import { ProductRow } from '@/app/lib/types';
import { formatCurrency, numberToIndianWords, productType } from "@/app/lib/utils";

interface ProductsProps {
  invoice: any,
  invProducts: any;
  products: ProductField[];
}


export default function PrintProductDc({ invoice, invProducts, products }: ProductsProps) {
  const [fillTdRow, setFillTdRow] = useState<any[]>([])
  useEffect(() => {
    let fillTdRows = []
    let int = (invoice?.BillType === 'gst' ? 8 : 13) - invProducts.length
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
              <th className="border-b px-2 py-1 text-left" style={{ width: "60px" }}>S No.</th>
              <th className="border-b border-x px-2 py-1 text-left">Item</th>
              {invoice?.BillType === 'gst' ?
                <th className="border-b px-2 py-1 text-left" style={{ width: "100px" }}>Hsn Code</th>
                : null}
              <th className="border-b border-x px-2 py-1 text-left" style={{ width: "90px" }}>Qty</th>
              <th className="border-b border-r px-2 py-1 text-left" style={{ width: "90px" }}>Price</th>
              <th className="border-b border-r px-2 py-1 text-right" style={{ width: "120px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invProducts?.length ?
              invProducts.map((row: any, rowIndex: number) => (
                <tr key={"text_" + rowIndex}>
                  <td style={{ height: "40px" }} className="px-2 py-1">{rowIndex + 1}</td>
                  <td className="border-x px-2 py-1">
                    <div className="flex flex-wrap">
                      {row.ItemId ? products.filter(e => e.Id === row.ItemId)?.[0].Name : ""}
                      {row.ItemId && products.filter(e => e.Id === row.ItemId).length && products.filter(e => e.Id === row.ItemId)?.[0].ProductCode ?
                        <div className="pl-2">
                          ({products.filter(e => e.Id === row.ItemId)?.[0].ProductCode})
                        </div>
                        : ""}
                      {row?.Type === 'Unfold' ?
                        <span className="pl-2 italic text-sm">( {row.Type} )</span>
                        : null}
                    </div>
                  </td>
                  {invoice?.BillType === 'gst' ?
                    <td className="px-2 py-1">
                      {row.ItemId && products.filter(e => e.Id === row.ItemId).length ?
                        products.filter(e => e.Id === row.ItemId)?.[0]?.HSNCode || ""
                        : "52081210"
                      }
                    </td>
                    : null}
                  <td className="border-x px-2 py-1 text-right">{row.Quantity}</td>
                  <td className="border-r px-2 py-1 text-right">{parseFloat(row.Price).toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">{(parseFloat(row.Total).toFixed(2))}</td>
                </tr>
              ))
              : null}
            {fillTdRow?.length ?
              fillTdRow.map((row: any, rowIndex: number) => (
                <tr key={"fillRow_" + rowIndex}>
                  <td style={{ height: "40px" }} className="px-2 py-1">&nbsp;</td>
                  <td className="border-x px-2 py-1">&nbsp;</td>
                  {invoice?.BillType === 'gst' ?
                    <td className="px-2 py-1">&nbsp;</td>
                    : null}
                  <td className="border-x px-2 py-1 text-right">&nbsp;</td>
                  <td className="border-r px-2 py-1 text-right">&nbsp;</td>
                  <td className="px-2 py-1 text-right">&nbsp;</td>
                </tr>
              ))
              : null}
          </tbody>
        </table>
      </div>
      <div className="print-footer-fixed">
        <div className={`flex flex-wrap border-t w-full`} id="banking">
          {invoice?.BillType === 'gst' ?
            <div className="px-2 py-2 align-top text-left w-1/2">
              <p className="self-center flex">
                <span className='w-32 text-sm'>Bank Details : </span>
                <span className="pl-2 text-sm">CANARA BANK</span>
              </p>
              <p className="self-center flex pt-2">
                <span className='w-32 text-sm'>Branch : </span>
                <span className="pl-2 text-sm">KOMARAPALAYAM</span>
              </p>
              <p className="self-center flex py-2">
                <span className='w-32 text-sm'>Account Number : </span>
                <span className="pl-2 text-sm">120024091918</span>
              </p>
              <p className="self-center flex">
                <span className='w-32 text-sm'>IFSC Code : </span>
                <span className="pl-2 text-sm">CNRB0001208</span>
              </p>
            </div>
            : null}
          <div className={`text-right ${invoice?.BillType === 'gst' ? 'w-1/2' : 'w-full'}`}>
            {invoice?.BillType === 'gst' ?
              <>
                <div className="border-0 pl-2 align-top justify-end w-full flex py-1">
                  <span className='text-sm py-1 text-lg text-left pl-4' style={{ width: "181px" }}>Total Amount Before Tax</span>
                  <span className="pt-1 pr-2 text-right" style={{ width: "120px" }}>{(invoice?.BeforeTax).toFixed(2)}</span>
                </div>
                {invoice?.customers?.State === 'TamilNadu' ?
                  <>
                    <div className="border-0 pl-2 align-top justify-end w-full flex">
                      <span className='text-sm py-1 text-lg text-left pl-4' style={{ width: "181px" }}>CGST <span className="pl-2">(2.5%)</span></span>
                      <span className="pl-4 pt-1 pr-2 text-right" style={{ width: "120px" }}>{invoice?.customers?.State === 'TamilNadu' ? (invoice?.Cgst).toFixed(2) : null}</span>
                    </div>
                    <div className="border-0 pl-2 align-top justify-end w-full flex">
                      <span className='text-sm py-1 text-lg text-left pl-4' style={{ width: "181px" }}>SGST <span className="pl-2">(2.5%)</span></span>
                      <span className="pl-4 pt-1 pr-2 text-right" style={{ width: "120px" }}>{invoice?.customers?.State === 'TamilNadu' ? (invoice?.Sgst).toFixed(2) : null}</span>
                    </div>
                  </>
                  :
                  <div className="border-0 pl-2 align-top justify-end w-full flex">
                    <span className='text-sm py-1 text-lg text-left pl-4' style={{ width: "181px" }}>IGST <span className="pl-2">(5%) </span></span>
                    <span className="pl-4 pt-1 pr-2 text-right" style={{ width: "120px" }}>{invoice?.customers?.State !== 'TamilNadu' ? (invoice?.Igst).toFixed(2) : null}</span>
                  </div>
                }
                <div className="border-0 pl-2 align-top justify-end w-full flex">
                  <span className='text-sm py-1 text-lg text-left pl-4' style={{ width: "181px" }}>Round Off (-/+)</span>
                  <span className="pl-4 pt-1 pr-2 text-right" style={{ width: "120px" }}>{invoice?.RoundOff ? (invoice?.RoundOff) : ""}</span>
                </div>
                <div className="border-0 pl-2 align-top justify-end w-full flex">
                  <span className='text-sm py-1 text-lg text-left pl-4' style={{ width: "181px" }}>Discount (-/+)</span>
                  <span className="pl-4 pt-1 pr-2 text-right" style={{ width: "120px" }}>{invoice?.Discount ? (invoice?.Discount) : ""}</span>
                </div>
              </>
              : null}
            <div className="border-0 pl-2 align-top justify-end w-full flex">
              <span className='text-sm py-1 text-lg text-left pl-4' style={{ width: "181px" }}> Total Amount After Tax</span>
              <span className="pt-1 pr-2 text-right" style={{ width: "120px" }}>{invoice?.InvoiceAmount ? formatCurrency(invoice?.InvoiceAmount) : ""}</span>
            </div>
          </div>
        </div>
        {invoice?.BillType === 'gst' ?
          <div className="border-t px-2 py-2 align-top text-left" id="total">
            <span className='text-sm'>Amount in Words : </span>
            <span className="pl-4 w-40 text-right">{numberToIndianWords(invoice?.InvoiceAmount)} Only</span>
          </div>
          : null}
        <div className="border-t align-top text-left flex justify-between h-28" id="terms">
          {invoice?.BillType === 'gst' ?
            <div className="py-2 px-2">
              <p className="text-sm self-center flex font-semibold">Terms & Conditions</p>
              <p className="text-sm self-center flex">
                <span className='text-sm w-4'>1, </span>
                <span className="text-sm pl-2">Subjected to Erode Jurisdiction.</span>
              </p>
              <p className="text-sm self-center flex py-1">
                <span className='text-sm w-4'>2. </span>
                <span className="text-sm pl-2">Interest @24% will be charged if the payment is not made in due time.</span>
              </p>
              <p className="text-sm self-center flex">
                <span className='text-sm w-4'>3. </span>
                <span className="text-sm pl-2">All Payment should be made by A/c Payess Cheque/Draft/RTGS</span>
              </p>
            </div>
            :
            <div className="px-2 py-2 align-top text-left self-center" id="total">
              <span className='text-sm'>Amount in Words : </span>
              <span className="pl-4 w-40 text-right">{numberToIndianWords(invoice?.InvoiceAmount)} Only</span>
            </div>
          }
          <div className="flex flex-wrap justify-end border-l py-2" style={{ width: "200px" }}>
            <p className="w-full self-start text-center font-semibold"><span className="font-normal">for</span> Ayngaran Tex</p>
            <p className="w-full self-end text-center font-semibold">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}