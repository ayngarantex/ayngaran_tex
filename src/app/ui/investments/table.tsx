'use client';

import { UpdateInvestment, DeleteInvestment } from '@/app/ui/investments/buttons';
import { formatCurrency, formatDate } from '@/app/lib/utils';

export default function InvestmentTable({ investments, onRefresh }: { investments: any[]; onRefresh: () => void }) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className="font-bold">
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Investor Name
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Type
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 text-right">
                  Amount
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Notes
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {investments?.map((inv: any, index: number) => (
                <tr
                  key={`inv-${inv.InvestmentId || index}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {formatDate(inv.Date)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {inv.InvestorName || '-'}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {inv.Type || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                    {formatCurrency(inv.Amount || 0)}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">
                    {inv.Notes || '-'}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvestment id={String(inv.InvestmentId)} />
                      <DeleteInvestment id={Number(inv.InvestmentId)} onDeleteSuccess={onRefresh} />
                    </div>
                  </td>
                </tr>
              ))}
              {(!investments || investments.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-medium bg-white">
                    No investment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
