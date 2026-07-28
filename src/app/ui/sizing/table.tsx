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
              {sizing?.map((siz: any, index: number) => (
                <tr
                  key={`inv'${index}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center">
                      {siz?.BillType === 'gst' ?
                        <span className=''>{siz?.BillType} - </span>
                        : null}
                      {siz?.InvoiceNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateNew(siz?.InvoiceDate)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {siz?.SizingName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 font-semibold text-red-600">
                      {siz?.Color}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {siz?.InvoiceAmount ? formatCurrency(siz?.InvoiceAmount) : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {siz?.ReceivedAmount ? formatCurrency(siz?.ReceivedAmount) : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(siz?.InvoiceAmount - (siz?.ReceivedAmount || 0))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus
                      ReceivedAmount={siz?.ReceivedAmount || 0}
                      InvoiceAmount={siz?.InvoiceAmount || 0}
                      InvoiceDate={siz?.InvoiceDate}
                    />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
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
