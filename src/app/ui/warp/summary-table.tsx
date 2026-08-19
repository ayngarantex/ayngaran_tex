import { formatDate, formatDateNew } from "@/app/lib/utils";
import { EditSUmmary } from "./buttons";
import Link from "next/link";

export default function WarpSummaryTable({
  summary,
}: {
  summary: any[];
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0 overflow-x-auto w-full">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className="font-bold">
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Loom Name
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Date
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Supplier Name
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Color
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Total Warps
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Total Weight
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Total Meter
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                  Total Dhoties
                </th>
              </tr>
            </thead>
            <tbody className={`bg-white`}>
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-gray-500 font-medium">
                    No warp summaries found.
                  </td>
                </tr>
              ) : (
                summary.map((row: any, index: number) => (
                  <tr
                    key={`sum-${index}`}
                    className={`w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg ${row.IsCompleted === 1 ? 'bg-red-300' : ''}`}
                  >
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <span>{row.LoomName || "Unassigned"}</span>
                        {row.IsCompleted === 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-gray-650">
                      {formatDateNew(row.InvoiceDate)}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-gray-600">
                      <Link className="cursor-pointer text-blue-600 hover:underline" href={`/admin/sizing/${row.SizingId}/edit`}>
                        {`${row.SupplierName} - ${row.InvoiceNumber}`}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 font-medium text-gray-700">
                      {row.Color || "-"}
                      {row?.Date && (
                        <div className="space-y-0.5">
                          <div className="whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{row.Dc} - {row?.Date ? formatDate(row.Date) : ''} - {row.Count} Unit @ {row?.Weight ? row.Weight + ' kgs' : ''}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 font-bold text-blue-700">
                      {row.TotalWarps}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 font-bold text-blue-700">
                      {row.TotalWeight}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 font-bold">
                      <p className="text-red-600 w-24 mb-1">
                        <span className="w-12 pr-4 inline-block text-right">Total</span>:
                        <span className="w-12 pl-1 inline-block text-right">{row.TotalMeters}</span>
                      </p>
                      <p className="text-blue-600 w-24">
                        <span className="w-12 pr-4 inline-block text-right">Rec</span>:
                        <span className="w-12 pl-1 inline-block text-right">
                          {(row.LoomId === 11 || row.LoomId === 33) ?
                            Math.floor(row.ReceivedDhoties * 1.89) :
                            Math.floor(row.ReceivedDhoties * 1.93)
                          }
                        </span>
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 font-bold text-blue-700 text-right">
                      <p className="text-red-600 w-24 mb-1">
                        <span className="w-12 pr-4 inline-block text-right">Total</span>:
                        <span className="w-12 pl-1 inline-block text-right">
                          {(row.LoomId === 11 || row.LoomId === 33) ?
                            Math.floor(row.TotalMeters / 1.89) :
                            Math.floor(row.TotalMeters / 1.93)
                          }
                        </span>
                      </p>
                      <p className="text-blue-600 w-24 mb-1">
                        <span className="w-12 pr-3 inline-block text-right">Rec</span>:
                        <span className="w-12 pl-1 inline-block text-right">{row.ReceivedDhoties}</span>
                      </p>
                      <p className="text-gray-600 w-24">
                        <span className="w-12 pr-3 inline-block text-right">Diff</span>:
                        <span className="w-12 pl-1 inline-block text-right">
                          {(row.LoomId === 11 || row.LoomId === 33) ?
                            Math.floor(row.TotalMeters / 1.89) - row.ReceivedDhoties :
                            Math.floor(row.TotalMeters / 1.93) - row.ReceivedDhoties
                          }
                        </span>
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <EditSUmmary Id={row.SizingId} LoomId={row.LoomId} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
