import { UpdateWarp } from '@/app/ui/warp/buttons';
import { formatDateNew, formatNumDate } from '@/app/lib/utils';

export default async function WarpTable({
  warps,
}: {
  warps: any;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0 overflow-x-auto w-full">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Date
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Color
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Weight
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Meter / Dhoties
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Loom / Last Dc
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Start Date
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  End Date
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {warps?.map((wrp: any, index: number) => (
                <tr
                  key={`inv'${index}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center">
                      {wrp?.DeliveredDate ? formatDateNew(wrp?.DeliveredDate) : ""}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 font-medium">
                      {wrp.Color}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 font-medium">
                      {wrp.Weight}Kgs
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 font-bold pb-2">
                      Meter  {wrp.Meters} - ({Math.ceil(wrp.totalDhoties * 1.93)})
                    </div>
                    <div className="flex items-center gap-3 font-medium">
                      Dhotie {Math.ceil(wrp.Meters / 1.93) + ' - (' + wrp.totalDhoties + ')'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 font-bold pb-2">
                      {wrp?.LoomName ?
                        <span className='pl-1'>{wrp.LoomName}</span>
                        : ""}
                      {wrp?.LoomNumber ?
                        <span className='pl-1'>(L - {wrp.LoomNumber})</span>
                        : null}
                    </div>
                    {wrp.lastDcNumber ?
                      <div className="flex items-center gap-3 font-medium">
                        DC {wrp.lastDcNumber} <span className='font-bold'>(vesti {wrp.lastCount} - {wrp?.lastDcDate ? formatDateNew(wrp?.lastDcDate) : ""})</span>
                      </div>
                      : null}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {wrp.StartDate ? formatDateNew(wrp.StartDate) : ""}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {wrp.CompletedDate ? formatDateNew(wrp.CompletedDate) : ""}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateWarp id={wrp.WarpId} />
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
