import { UpdateYarn, DeleteYarn } from '@/app/ui/yarns/buttons';
import { formatCurrency, formatDateNew } from '@/app/lib/utils';
import YarnStatus from './status';

export default async function YarnTable({
  yarns
}: {
  yarns: any;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Invoice Number
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Date
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Company
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Details
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-bold">
                  Paid On
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
              {yarns?.map((yrn: any) => (
                <tr
                  key={`inv'${yrn.YarnId}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center text-bold text-lg">
                      {yrn?.InvoiceNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateNew(yrn.InvoiceDate)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className='flex flex-wrap'>
                      <div className="flex items-center gap-3 w-full">
                        {yrn?.suppliers?.Name}
                      </div>
                      <div className="flex items-center gap-3">
                        {yrn?.suppliers?.AccountNumber}
                      </div>
                    </div>
                  </td><td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {yrn?.yarn_details?.length ?
                      <div className='flex flex-col w-full'>
                        {yrn?.yarn_details?.map((yd: any) => (
                          yd.Count !== 'Freight' && (
                            <div key={yd.YarnDetailId}>
                              {yd.Count} - <span className='font-bold'>{yd.Color}</span> - {yd.Bag} {`(${yd.Quantity} Kgs)`} - {formatCurrency(yd.Price)}
                            </div>
                          )
                        ))}
                      </div>
                      : null
                    }
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {yrn?.InvoiceAmount ? formatCurrency(yrn.InvoiceAmount) : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {yrn?.yarn_payment_details?.length ?
                      <div className='flex flex-col w-full'>
                        {yrn?.yarn_payment_details?.map((yd: any) => (
                          <div key={yd.Date}>
                            {formatDateNew(yd.Date)} - {formatCurrency(yd.Amount)}
                          </div>
                        ))}
                      </div>
                      : null
                    }

                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(yrn?.InvoiceAmount - (yrn?.PaidAmount || 0))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <YarnStatus
                      PaidAmount={yrn?.PaidAmount || 0}
                      InvoiceAmount={yrn?.InvoiceAmount || 0}
                      InvoiceDate={yrn.InvoiceDate}
                    />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateYarn id={yrn.YarnId} />
                      <DeleteYarn id={yrn.YarnId} />
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
