'use client';

import { DeleteExpense, UpdateExpenses } from '@/app/ui/expenses/buttons';
import { formatCurrency, formatDate } from '@/app/lib/utils';

export default function ExpenseTable({ expenses }: { expenses: any }) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0 overflow-x-auto w-full">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className="font-bold">
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Reason
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Type
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 text-right">
                  Amount
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {expenses?.map((exp: any, index: number) => (
                <tr
                  key={`inv-${index}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {formatDate(exp.Date)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {exp?.Reason}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {exp?.Type === "Others" && exp?.otherType ? `Others (${exp.otherType})` : (exp?.Type || '-')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    {exp?.Amount ? formatCurrency(exp.Amount) : ''}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateExpenses id={exp.ExpenseId} />
                      <DeleteExpense id={exp.ExpenseId} />
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
