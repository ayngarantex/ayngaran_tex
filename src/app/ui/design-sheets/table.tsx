import Link from 'next/link';
import { ViewDesignSheet, UpdateDesignSheet, DeleteDesignSheet, CopyDesignSheet } from './buttons';
import type { DesignSheet } from '@/app/lib/types';

export default function DesignSheetsTable({
  designSheets
}: {
  designSheets: DesignSheet[];
}) {
  if (!designSheets || designSheets.length === 0) {
    return (
      <div className="mt-6 rounded-xl bg-white border border-slate-200 p-12 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">No Design Sheets Found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Get started by creating a new sizing design sheet with creel pattern & bracket setups.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/design-sheets/create"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 shadow-sm transition-colors"
          >
            Create New Design Sheet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-xl bg-white border border-slate-200 p-2 md:p-4 shadow-sm overflow-x-auto">
          <table className="min-w-full text-slate-900 align-middle">
            <thead className="rounded-lg text-left text-xs sm:text-sm font-bold bg-slate-100 text-slate-900 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold sm:pl-6">
                  Design No.
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Design Name
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold text-center">
                  Item Width
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold text-right">
                  Total Ends
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Color Breakdown
                </th>
                <th scope="col" className="px-3 py-3.5 font-bold">
                  Created
                </th>
                <th scope="col" className="relative py-3.5 pl-4 pr-6 text-right font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm font-medium">
              {designSheets.map((sheet) => {
                const colors = sheet.ColorSummary || {};
                return (
                  <tr
                    key={sheet.Id}
                    className="hover:bg-slate-50/80 transition-colors text-slate-900"
                  >
                    <td className="whitespace-nowrap py-4 pl-6 pr-4 font-bold text-blue-600">
                      <Link href={`/admin/design-sheets/${sheet.Id}`} className="hover:underline">
                        {sheet.DesignNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      <div className="line-clamp-1">{sheet.DesignName}</div>
                      {sheet.Notes && (
                        <div className="text-xs font-normal text-slate-500 line-clamp-1 mt-0.5">
                          {sheet.Notes}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
                        {sheet.ItemWidth || '54"'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right">
                      <span className="font-mono text-base font-bold text-slate-900">
                        {sheet.TotalEnds?.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 block font-normal">ends</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {Object.entries(colors).map(([color, count]) => {
                          const isWhite = color.toLowerCase().includes('white') || color.includes('சலவை');
                          const isBlack = color.toLowerCase().includes('black') || color.includes('கருப்பு');
                          const isKaavi = color.toLowerCase().includes('kaavi') || color.includes('காவி');
                          return (
                            <span
                              key={color}
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium border ${isBlack
                                ? 'bg-slate-900 text-white border-slate-900'
                                : isWhite
                                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                                  : isKaavi
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                            >
                              <span>{color}:</span>
                              <strong className="font-mono">{count}</strong>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">
                      {sheet.CreatedAt?.split(' ')[0] || '-'}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <ViewDesignSheet id={sheet.Id} />
                        <CopyDesignSheet id={sheet.Id} designNumber={sheet.DesignNumber} designName={sheet.DesignName} />
                        <UpdateDesignSheet id={sheet.Id} />
                        <DeleteDesignSheet id={sheet.Id} designNumber={sheet.DesignNumber} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
