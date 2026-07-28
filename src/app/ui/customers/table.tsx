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
  startDate: string,
  endDate: string
  billType: string,
  orderBy: string,
  limit?: number | null
}) {
  const customers = await fetchCustomers(query, currentPage, orderBy, startDate, endDate, limit);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 col-name">
                  Customer Name
                </th>
                <th scope="col" className="px-3 py-5 font-bold col-gst">
                  Gst Number
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 col-state">
                  State
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 col-mobile">
                  Mobile
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 col-agent">
                  Agent
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 col-pending">
                  Pending
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3 no-print">
                  <span className="sr-only">Edit</span>
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 w-[200px] col-address">
                  Adderss
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {customers?.map((cus: any) => (
                <tr
                  key={`inv'${cus.CustomerId}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 col-name">
                    <div className="flex items-center gap-3">
                      {cus?.CustomerName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 col-gst">
                    <div className="flex items-center gap-3">
                      {cus?.GstNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 col-state">
                    <div className="flex items-center gap-3">
                      {cus?.State}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 col-mobile">
                    <div className="flex items-center gap-3">
                      {cus?.Mobile}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 col-agent">
                    <div className="flex items-center gap-3">
                      {cus?.Agent}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 col-pending">
                    <div className={`flex items-center gap-3 ${cus?.pending > 0 ? 'text-red-500 text-lg' : ''}`}>
                      {formatCurrency(cus?.pending || 0)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 no-print">
                    <div className="flex justify-end gap-3">
                      <UpdateCustomerProduct id={cus.CustomerId} />
                      <CustomerLeader id={cus.CustomerId} startDate={startDate} endDate={endDate} billType={billType} />
                      <UpdateCustomer id={cus.CustomerId} />
                      <DeleteCustomer id={cus.CustomerId} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 w-[200px] col-address">
                    <div className="flex items-center gap-3 w-[200px] text-wrap">
                      {cus?.Address}
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
