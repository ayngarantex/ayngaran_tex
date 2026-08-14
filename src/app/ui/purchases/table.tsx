import { UpdatePurchase, DeletePurchase } from '@/app/ui/purchases/buttons';
import { formatCurrency, formatDate, formatDateNew } from '@/app/lib/utils';
import PurchaseStatus from './status';

export default async function PurchaseTable({
  purchases
}: {
  purchases: any;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-xl bg-white border border-slate-200 p-2 md:p-4 shadow-sm overflow-x-auto">
          <table className="min-w-full text-slate-900 align-middle">
            <thead className="rounded-lg text-left text-xs sm:text-sm font-bold bg-slate-100 text-slate-900 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold sm:pl-6">
                  Invoice Number
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Date
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Supplier
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Details
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Amount
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Paid On
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Balance
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-6 pr-3 text-right font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm font-medium">
              {purchases?.map((pur: any) => (
                <tr
                  key={`pur_${pur.PurchaseId}`}
                  className="hover:bg-slate-50/80 transition-colors text-slate-900"
                >
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 font-semibold text-slate-900">
                    {pur?.InvoiceNumber || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-800">
                    {pur?.InvoiceDate ? formatDateNew(pur.InvoiceDate) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-900 font-semibold">
                    {pur?.SupplierName || 'Direct Weaver / Customer'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 text-xs">
                    {pur?.purchase_details?.length ? (
                      <div className="space-y-0.5">
                        {pur.purchase_details.map((row: any, idx: number) => (
                          <div key={idx} className="whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{row.ItemName}</span> - {row.Quantity} {row.QuantityType} @ ₹{row.Price}
                          </div>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-900 font-semibold">
                    {formatCurrency(pur.InvoiceAmount || 0)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 text-xs">
                    {pur?.purchase_payment_details?.length ? (
                      <div className="space-y-0.5">
                        {pur.purchase_payment_details.map((row: any, idx: number) => (
                          <div key={idx} className="whitespace-nowrap">
                            <span className="font-semibold text-slate-900">
                              {formatDate(row.Date)} - {row.Type} - {formatCurrency(parseFloat(row.Amount) || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold">
                    <span className={(pur.InvoiceAmount - pur.PaidAmount) > 0 ? 'text-red-600 font-extrabold text-base' : 'text-slate-900'}>
                      {formatCurrency((pur.InvoiceAmount || 0) - (pur.PaidAmount || 0))}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <PurchaseStatus InvoiceAmount={pur.InvoiceAmount} PaidAmount={pur.PaidAmount} InvoiceDate={pur.InvoiceDate} />
                  </td>
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <UpdatePurchase id={pur.PurchaseId} />
                      <DeletePurchase id={pur.PurchaseId} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
