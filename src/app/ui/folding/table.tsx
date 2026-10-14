import React from 'react';
import { FoldingItems, formatDate } from "@/app/lib/utils";
import { fetchFoldingEntries } from "@/app/api/node/folding";
import { UpdateFolding, DeleteFolding } from "./buttons";
import { CalendarIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default async function Table({
  query,
  currentPage
}: {
  query: string;
  currentPage: number;
}) {
  const foldingItemList = FoldingItems();
  const entries = await fetchFoldingEntries(query, currentPage);

  // Compute column totals for current page (Given adds, Return reduces)
  const columnTotals: Record<string, { given: number; return: number; net: number }> = {};
  foldingItemList.forEach(item => {
    let given = 0;
    let ret = 0;
    entries.forEach((entry: any) => {
      const val = Number(entry.Items?.[item]) || 0;
      if (entry.Type === 'Return') {
        ret += val;
      } else {
        given += val;
      }
    });
    columnTotals[item] = { given, return: ret, net: given - ret };
  });

  const totalPageGiven = entries.reduce((sum: number, entry: any) => {
    return sum + (entry.Type !== 'Return' ? Number(entry.TotalCount || 0) : 0);
  }, 0);
  const totalPageReturn = entries.reduce((sum: number, entry: any) => {
    return sum + (entry.Type === 'Return' ? Number(entry.TotalCount || 0) : 0);
  }, 0);
  const grandTotalPieces = totalPageGiven - totalPageReturn;

  return (
    <div className="mt-4 flow-root">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                Date
              </th>
              <th scope="col" className="px-3 py-3.5 whitespace-nowrap">
                DC #
              </th>
              {foldingItemList.map((item: string) => (
                <th key={item} scope="col" className="px-3 py-3.5 text-right whitespace-nowrap">
                  {item}
                </th>
              ))}
              <th scope="col" className="px-4 py-3.5 text-right font-extrabold text-slate-800 whitespace-nowrap bg-emerald-50/50">
                Total (Pcs)
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-center whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          {entries.length > 0 && (
            <tfoot className="bg-slate-50/95 border-t-2 border-slate-300 font-bold text-slate-700">
              <tr>
                <td colSpan={2} className="py-3 pl-6 pr-3 uppercase tracking-wider text-xs">
                  <div className="font-bold text-slate-800">Page Total:</div>
                  <div className="text-[10px] text-slate-400 font-normal">Given / Return / Net</div>
                </td>
                {foldingItemList.map((item: string) => {
                  const stats = columnTotals[item] || { given: 0, return: 0, net: 0 };
                  const hasActivity = stats.given > 0 || stats.return > 0;
                  return (
                    <td key={item} className="px-3 py-2 text-right whitespace-nowrap">
                      {hasActivity ? (
                        <div className="flex flex-col items-end text-[11px] leading-tight">
                          {stats.given > 0 && (
                            <span className="text-blue-700 font-bold text-[10px]">+{stats.given.toLocaleString()}</span>
                          )}
                          {stats.return > 0 && (
                            <span className="text-amber-700 font-bold text-[10px]">-{stats.return.toLocaleString()}</span>
                          )}
                          <span className={`font-black pt-0.5 border-t border-slate-200 ${stats.net > 0 ? 'text-emerald-800' : stats.net < 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                            {stats.net.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-2 text-right whitespace-nowrap bg-emerald-100/60">
                  <div className="flex flex-col items-end text-[11px] leading-tight">
                    <span className="text-blue-800 font-bold text-[10px]">+{totalPageGiven.toLocaleString()}</span>
                    <span className="text-amber-800 font-bold text-[10px]">-{totalPageReturn.toLocaleString()}</span>
                    <span className="font-black text-emerald-900 text-sm pt-0.5 border-t border-emerald-300">
                      {grandTotalPieces.toLocaleString()} Pcs
                    </span>
                  </div>
                </td>
                <td className="py-3 pl-3 pr-6 text-center">&nbsp;</td>
              </tr>
            </tfoot>
          )}

          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={foldingItemList.length + 4} className="py-12 text-center text-sm font-medium text-slate-400">
                  No folding entries found. Click "+ New" to record a folding entry.
                </td>
              </tr>
            ) : (
              entries.map((entry: any) => (
                <tr key={entry.FoldingId} className={`hover:bg-slate-50/80 transition-colors ${entry.Type === 'Return' ? 'bg-red-200' : ''}`}>
                  <td className="py-3 pl-6 pr-3 whitespace-nowrap font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-emerald-600" />
                      <span>{formatDate(entry.Date)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-600">
                    <div className="flex flex-col gap-1 items-start">
                      {entry.DcNumber ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                          <DocumentTextIcon className="h-3 w-3 text-slate-400" />
                          {entry.DcNumber}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                      <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {entry.Folder}
                      </span>
                    </div>
                  </td>
                  {foldingItemList.map((item: string) => {
                    const count = Number(entry.Items?.[item]) || 0;
                    return (
                      <td key={item} className="px-3 py-3 text-right whitespace-nowrap">
                        {count > 0 ? (
                          <span className="font-bold text-slate-800 bg-slate-100/70 px-1.5 py-0.5 rounded">
                            {count.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-700 whitespace-nowrap bg-emerald-50/30">
                    {(Number(entry.TotalCount) || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Pcs</span>
                  </td>
                  <td className="py-3 pl-3 pr-6 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <UpdateFolding entry={entry} type={entry.Type} />
                      <DeleteFolding id={entry.FoldingId} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
