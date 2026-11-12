import { formatCurrency, formatDateNew } from '@/app/lib/utils';
import { fetchPaymentDetails } from '@/app/api/node/payment';

export default async function ProductTable({
  query,
  currentPage,
  pageLimit,
  startDate,
  endDate,
  type = 'invoice',
}: {
  query: string;
  currentPage: number;
  pageLimit: number;
  startDate: string;
  endDate: string;
  type?: string;
}) {
  const payments = await fetchPaymentDetails(query, currentPage, pageLimit, startDate, endDate, type);
  const isLoomOrFolding = type === 'loom' || type === 'folding';

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0 overflow-x-auto w-full">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-lg font-medium">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  {type === 'invoice' ? 'Customer Name' : isLoomOrFolding ? 'Loom / Folder Name' : 'Supplier Name'}
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  Date
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  {isLoomOrFolding ? 'DC / Week Ref' : 'Invoice Number'}
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-4 text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {payments?.map((pay: any, index: number) => (
                <tr
                  key={`inv-'${index}`}
                  className="w-full border-b py-3 text-base last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{pay?.CustomerName}</span>
                      {isLoomOrFolding && pay?.BillType && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          pay.BillType === 'Folding'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {pay.BillType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-700">
                    {formatDateNew(pay.PaymentDate)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                    {pay?.InvoiceNumber || '-'}
                  </td>
                  <td className="whitespace-nowrap pr-4 py-3 text-right font-bold text-slate-900">
                    {pay?.PaymentAmount ? formatCurrency(pay.PaymentAmount) : ""}
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
