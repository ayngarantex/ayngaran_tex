import { UpdateSupplier, DeleteSupplier, SupplierLeader } from '@/app/ui/suppliers/buttons';
import { fetchSuppliers } from '@/app/api/node/supplier';
import { formatCurrency } from '@/app/lib/utils';

export default async function SupplierTable({
  query,
  currentPage,
  startDate,
  endDate,
  billType,
  orderBy
}: {
  query: string;
  currentPage: number;
  startDate: string,
  endDate: string
  billType: string,
  orderBy: string
}) {
  const suppliers = await fetchSuppliers(query, currentPage, orderBy);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Supplier Name
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Gst Number
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  State
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Mobile
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Agent
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Pending
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 w-[200px]">
                  Adderss
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {suppliers?.map((sup: any) => (
                <tr
                  key={`inv'${sup.SupplierId}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {sup?.Name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {sup?.GstNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {sup?.State}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {sup?.Mobile}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {sup?.Agent}
                    </div>
                  </td>

                  {sup?.pendingAmount >= 0 ?
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className={`flex items-center gap-3 ${sup?.pendingAmount ? 'text-red-500 text-lg' : ''}`}>
                        {formatCurrency(sup?.pendingAmount)}
                      </div>
                    </td>
                    :
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className={`flex items-center gap-3 ${sup?.yarns.reduce((sum: number, yrn: any) => {
                        return sum + ((yrn.InvoiceAmount ?? 0) - (yrn.PaidAmount ?? 0));
                      }, 0) > 0 ? 'text-red-500 text-lg' : ''}`}>
                        {formatCurrency(
                          sup?.yarns.reduce((sum: number, yrn: any) => {
                            return sum + ((yrn.InvoiceAmount ?? 0) - (yrn.PaidAmount ?? 0));
                          }, 0)
                        )}
                      </div>
                    </td>
                  }
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <SupplierLeader id={sup.SupplierId} startDate={startDate} endDate={endDate} billType={billType} />
                      <UpdateSupplier id={sup.SupplierId} />
                      <DeleteSupplier id={sup.SupplierId} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3 w-[200px]">
                    <div className="flex items-center gap-3 w-[200px] text-wrap">
                      {sup?.Address}
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
