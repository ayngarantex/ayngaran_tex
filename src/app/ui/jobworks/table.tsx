import { DeleteLoom, UpdateLoom, ViewLoomEntries } from './buttons';

export default async function Table({
  looms
}: {
  looms: any[];
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0 overflow-x-auto w-full">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Loom Name
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Address
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Contact
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Looms
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 flex justify-end">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {looms?.map((loom: any) => (
                <tr
                  key={`inv-'${loom.LoomId}`}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {loom?.LoomName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {loom?.Address}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {loom?.ContactNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {loom?.Count}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <ViewLoomEntries id={loom.LoomId} />
                      <UpdateLoom id={loom.LoomId} />
                      <DeleteLoom id={loom.LoomId} />
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
