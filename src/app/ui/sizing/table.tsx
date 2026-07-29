import { UpdateSizing, DeleteSizing } from '@/app/ui/sizing/buttons';
import { formatCurrency, formatDateNew } from '@/app/lib/utils';
import InvoiceStatus from './status';

export default async function InvoicesTable({
  sizing
}: {
  sizing: any;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-xl bg-white border border-slate-200 p-2 md:p-4 shadow-sm overflow-x-auto">
          <table className="min-w-full text-slate-900 align-middle">
            <thead className="rounded-lg text-left text-xs sm:text-sm font-bold bg-slate-100 text-slate-900 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold sm:pl-6">
                  Bill Number
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Date
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Supplier
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Warp Design
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Amount
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Paid
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
              {sizing?.map((siz: any, index: number) => (
                <tr
                  key={`inv_${index}`}
                  className="hover:bg-slate-50/80 transition-colors text-slate-900"
                >
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 font-semibold text-slate-900">
                    {siz?.InvoiceNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-800">
                    {siz?.InvoiceDate ? formatDateNew(siz.InvoiceDate) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-900 font-semibold">
                    {siz?.SupplierName}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 text-xs">
                    {siz?.Color} ({siz?.Meters}m)
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-900 font-semibold">
                    {formatCurrency(siz.InvoiceAmount || 0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-emerald-700 font-semibold">
                    {formatCurrency(siz.ReceivedAmount || 0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold">
                    <span className={(siz.InvoiceAmount - siz.ReceivedAmount) > 0 ? 'text-red-600 font-extrabold text-base' : 'text-slate-900'}>
                      {formatCurrency((siz.InvoiceAmount || 0) - (siz.ReceivedAmount || 0))}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <InvoiceStatus InvoiceAmount={siz.InvoiceAmount} ReceivedAmount={siz.ReceivedAmount} InvoiceDate={siz.InvoiceDate} />
                  </td>
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <UpdateSizing id={siz?.SizingId} />
                      <DeleteSizing id={siz?.SizingId} />
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
