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
  startDate: string;
  endDate: string;
  billType: string;
  orderBy: string;
}) {
  const suppliers = await fetchSuppliers(query, currentPage, orderBy);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-xl bg-white border border-slate-200 p-2 md:p-4 shadow-sm overflow-x-auto">
          <table className="min-w-full text-slate-900 align-middle">
            <thead className="rounded-lg text-left text-xs sm:text-sm font-bold bg-slate-100 text-slate-900 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold sm:pl-6">
                  Supplier Name
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
                <th scope="col" className="relative py-3.5 pl-6 pr-3 text-right font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm font-medium">
              {suppliers?.map((sup: any) => (
                <tr
                  key={`inv_${sup.SupplierId}`}
                  className="hover:bg-slate-50/80 transition-colors text-slate-900"
                >
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 font-semibold text-slate-900">
                    {sup?.Name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-800 font-mono text-xs font-semibold">
                    {sup?.GstNumber || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-800">
                    {sup?.State || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-800 font-mono text-xs">
                    {sup?.Mobile || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-800">
                    {sup?.Agent || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-bold">
                    <span className={sup?.pendingAmount > 0 ? 'text-red-600 font-extrabold text-base' : 'text-slate-900'}>
                      {formatCurrency(sup?.pendingAmount || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                    {sup?.Address || '-'}
                  </td>
                  <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <SupplierLeader id={sup.SupplierId} startDate={startDate} endDate={endDate} billType={billType} />
                      <UpdateSupplier id={sup.SupplierId} />
                      <DeleteSupplier id={sup.SupplierId} />
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
