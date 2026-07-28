import { UpdateInvoice, DeleteInvoice } from '@/app/ui/sizing/buttons';
import { formatCurrency, formatDate } from '@/app/lib/utils';
import InvoiceStatus from './status';

export default async function InvoicesTable({
  invoices
}: {
  invoices: any;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Bill Number
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Date
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Supplier
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Warp Design
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Paid
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Balance
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices?.map((invoice: any, index: number) => (
                <tr
                  key={`inv'${index}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center">
                      {invoice?.BillType === 'gst' ?
                        <span className=''>{invoice.BillType} - </span>
                        : null}
                      {invoice?.InvoiceNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDate(invoice.InvoiceDate)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {invoice?.suppliers?.Name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 font-semibold text-red-600">
                      {invoice?.Color}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {invoice?.InvoiceAmount ? formatCurrency(invoice.InvoiceAmount) : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {invoice?.ReceivedAmount ? formatCurrency(invoice.ReceivedAmount) : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(invoice?.InvoiceAmount - (invoice?.ReceivedAmount || 0))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus
                      ReceivedAmount={invoice?.ReceivedAmount || 0}
                      InvoiceAmount={invoice?.InvoiceAmount || 0}
                      InvoiceDate={invoice.InvoiceDate}
                    />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={invoice.SizingId} />
                      <DeleteInvoice id={invoice.SizingId} />
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
