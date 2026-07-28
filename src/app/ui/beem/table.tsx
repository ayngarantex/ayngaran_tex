import { UpdateBeem } from '@/app/ui/beem/buttons';
import { formatDate } from '@/app/lib/utils';

export default async function BeemTable({
  beems,
  hideAction
}: {
  beems: any;
  hideAction?: boolean;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Date
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Loom
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  New
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Running
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Empty
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Total in Hand
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Return
                </th>
                {!hideAction ?
                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                  : null}
              </tr>
            </thead>
            <tbody className="bg-white">
              {beems?.map((beem: any, index: number) => (
                <tr
                  key={`inv'${index}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center">
                      {beem?.Date ? formatDate(beem.Date) : ""}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 font-medium">
                      {beem?.loom_details?.LoomName || ""} ({beem?.loom_details?.Count || ""})
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 font-medium">
                      {beem?.Loaded}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {beem?.Running}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {beem?.Empty}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {beem?.Loaded + beem?.Running + beem?.Empty + beem?.Return}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {beem?.Return}
                  </td>
                  {!hideAction ?
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <UpdateBeem id={beem.BeemId} />
                      </div>
                    </td>
                    : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
