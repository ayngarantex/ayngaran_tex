import { UpdateCustomer, DeleteCustomer, CustomerLeader, UpdateCustomerProduct } from '@/app/ui/customers/buttons';
import { formatCurrency } from '@/app/lib/utils';
import { fetchCustomers } from '@/app/api/node/customers';

export default async function CustomerTable({
  query,
  currentPage,
  startDate,
  endDate,
  billType,
  orderBy,
  limit
}: {
  query: string;
  currentPage: number;
  startDate: string;
  endDate: string;
  billType: string;
  orderBy: string;
  limit?: number | null;
}) {
  const customers = await fetchCustomers(query, currentPage, orderBy, startDate, endDate, limit);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-xl bg-white border border-slate-200 p-2 md:p-4 shadow-sm overflow-x-auto">
          <table className="min-w-full text-slate-900 align-middle">
            <thead className="rounded-lg text-left text-xs sm:text-sm font-bold bg-slate-100 text-slate-900 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold sm:pl-6">
                  Customer Name
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  GST Number
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  State
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Mobile
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Agent
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Pending
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Address
                </th>
                <th scope="col" className="relative py-3.5 pl-6 pr-3 text-right font-bold no-print">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm font-medium">
              {customers?.map((cust: any) => (
                <tr
                  key={`inv_${cust.CustomerId}`}
                  className="hover:bg-slate-50/80 transition-colors text-slate-900"
                >
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 font-semibold text-slate-900">
                    {cust?.CustomerName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-800 font-mono text-xs font-semibold">
                    {cust?.GstNumber || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-800">
                    {cust?.State || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-800 font-mono text-xs">
                    {cust?.Mobile || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-800">
                    {cust?.Agent || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-bold">
                    <span className={cust?.pending > 0 ? 'text-red-600 font-extrabold text-base' : 'text-slate-900'}>
                      {formatCurrency(cust?.pending || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                    {cust?.Address || '-'}
                  </td>
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-right no-print">
                    <div className="flex justify-end items-center gap-2">
                      <UpdateCustomerProduct id={cust.CustomerId} />
                      <CustomerLeader id={cust.CustomerId} startDate={startDate} endDate={endDate} billType={billType} />
                      <UpdateCustomer id={cust.CustomerId} />
                      <DeleteCustomer id={cust.CustomerId} />
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
