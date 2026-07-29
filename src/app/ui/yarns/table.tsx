import { UpdateYarn, DeleteYarn } from '@/app/ui/yarns/buttons';
import { formatCurrency, formatDate, formatDateNew } from '@/app/lib/utils';
import YarnStatus from './status';

export default async function YarnTable({
  yarns
}: {
  yarns: any;
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
                  Company
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
              {yarns?.map((yrn: any) => (
                <tr
                  key={`inv_${yrn.YarnId}`}
                  className="hover:bg-slate-50/80 transition-colors text-slate-900"
                >
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 font-semibold text-slate-900">
                    {yrn?.InvoiceNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-800">
                    {yrn?.InvoiceDate ? formatDateNew(yrn.InvoiceDate) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-900 font-semibold">
                    {yrn?.SupplierName}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 text-xs">
                    {yrn?.yarn_details?.length ? (
                      <div className="space-y-0.5">
                        {yrn.yarn_details.map((row: any, idx: number) => (
                          <div key={idx} className="whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{row.Count}</span> - {row.Color} ({row.Bag} bags, {row.Quantity}kg) @ ₹{row.Price}
                          </div>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-900 font-semibold">
                    {formatCurrency(yrn.InvoiceAmount || 0)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 text-xs">
                    {yrn?.yarn_payment_details?.length ?
                      <div className="space-y-0.5">
                        {yrn.yarn_payment_details.map((row: any, idx: number) => (
                          <div key={idx} className="whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{formatDate(row.Date) + ' - ' + row.Type + ' - ' + row.Amount}</span>
                          </div>
                        ))}
                      </div>
                      : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold">
                    <span className={(yrn.InvoiceAmount - yrn.PaidAmount) > 0 ? 'text-red-600 font-extrabold text-base' : 'text-slate-900'}>
                      {formatCurrency((yrn.InvoiceAmount || 0) - (yrn.PaidAmount || 0))}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <YarnStatus InvoiceAmount={yrn.InvoiceAmount} PaidAmount={yrn.PaidAmount} InvoiceDate={yrn.InvoiceDate} />
                  </td>
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <UpdateYarn id={yrn.YarnId} />
                      <DeleteYarn id={yrn.YarnId} />
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
