import { fetchStockEntries } from '@/app/api/node/stock';
import { formatDateNew, pageLimit } from '@/app/lib/utils';
import Pagination from '@/app/lib/pagination';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Page(props: {
    searchParams?: Promise<{
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;

    const allStockEntries = await fetchStockEntries();
    const totalEntries = allStockEntries.length;
    const totalPages = Math.ceil(totalEntries / pageLimit);

    // Slice entries based on pagination
    const stockEntries = allStockEntries.slice(
        (currentPage - 1) * pageLimit,
        currentPage * pageLimit
    );

    return (
        <main className="w-full max-w-6xl mx-auto py-4">
            {/* Header section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Inventory logs</span>
                    <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Stock Ledger History</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Viewing all recorded stock updates across all products in descending date order.
                    </p>
                </div>
                <Link
                    href="/admin/products"
                    className="flex h-10 items-center rounded-lg bg-blue-50 px-5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 border border-blue-200/50"
                >
                    Back to Products
                </Link>
            </div>

            {/* Pagination at top */}
            {totalPages > 1 && (
                <div className="flex w-full justify-center mb-6">
                    <Pagination totalPages={totalPages} />
                </div>
            )}

            {/* Ledger Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {!stockEntries || stockEntries.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500 font-medium">No stock entries found.</p>
                        <p className="text-xs text-slate-400 mt-1">Add stock from the product management view to see entries here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-slate-900 text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Product Name</th>
                                    <th scope="col" className="px-6 py-4">Entry Date</th>
                                    <th scope="col" className="px-6 py-4">Quantity</th>
                                    <th scope="col" className="px-6 py-4">Notes / Remarks</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stockEntries.map((entry: any) => {
                                    const dateStr = entry.EntryDate ? formatDateNew(entry.EntryDate) : 'N/A';
                                    return (
                                        <tr key={entry.Id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {entry.ProductName || `Product ID: ${entry.ProductId}`}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600">
                                                {dateStr}
                                            </td>
                                            <td className={`px-6 py-4 font-bold ${entry.Quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {entry.Quantity > 0 ? `+${entry.Quantity}` : entry.Quantity}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 whitespace-pre-wrap max-w-xs break-words">
                                                {entry.Notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/products/${entry.ProductId}/stocks`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-250 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                    </svg>
                                                    Manage Stock
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination at bottom */}
            {totalPages > 1 && (
                <div className="flex w-full justify-center mt-8">
                    <Pagination totalPages={totalPages} />
                </div>
            )}
        </main>
    );
}
