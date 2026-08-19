'use client';
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import { deleteEntry } from "@/app/api/node/looms"
import { formatDateNew } from "@/app/lib/utils";

export default function LoomEntriesList({ entries, loom }: { entries: any[], loom: any }) {

    const [hoveredSizingId, setHoveredSizingId] = useState<number | null>(null);
    const [warpDetails, setWarpDetails] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const handleDelete = async (entryId: number) => {
        if (!confirm("Are you sure you want to delete this entry?")) {
            return;
        }

        const res = await deleteEntry(entryId);

        if (res?.data?.deleteEntry) {
            redirect(`/admin/jobworks/${loom?.LoomId}/view`);
        }
        // return
    }

    const handleMouseEnter = async (sizingId: number, loomId: number) => {
        setHoveredSizingId(sizingId);

        const res = await fetch(`/api/create/details?sizingId=${sizingId}&loomId=${loomId}`);
        const data = await res.json();

        setWarpDetails(data);
    };

    const handleMouseLeave = () => {
        setHoveredSizingId(null);
        setWarpDetails([]);
    };

    if (!entries || entries.length === 0) {
        return (
            <div className="mt-8 rounded-md bg-white p-4 md:p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Loom Entries & Warp Details</h3>
                <p className="text-sm text-slate-500">No entries found for this loom.</p>
            </div>
        );
    }

    const filteredEntries = entries.filter((e) => {
        const query = searchQuery.toLowerCase();
        const typeMatch = e.Type?.toLowerCase().includes(query);
        const detailsMatch = e.Details?.toLowerCase().includes(query);
        const formattedDate = e.Date ? formatDateNew(e.Date).toLowerCase() : "";
        const dateMatch = formattedDate.includes(query);
        return typeMatch || detailsMatch || dateMatch;
    });

    const givenTypes = ['Warp', 'Weft', 'Babbin', 'Kuri Cone', 'Closed Positive'];
    const receivedTypes = ['Vesti', 'Vesti (Warp Summary)', 'Return Cone', 'Closed Negative', 'Wast Percentage'];

    const totalGivenWeight = filteredEntries.reduce((sum, e) => {
        if (givenTypes.includes(e.Type)) return sum + (Number(e.Weight) || 0);
        return sum;
    }, 0);

    const totalReceivedWeight = filteredEntries.reduce((sum, e) => {
        if (receivedTypes.includes(e.Type)) return sum + (Number(e.Weight) || 0);
        return sum;
    }, 0);

    // Suffix balance: for each row, net weight from that row to the bottom (bottom-to-top calculation)
    const suffixBalances = filteredEntries.map((_, i) =>
        filteredEntries.slice(i).reduce((sum, e) => {
            if (givenTypes.includes(e.Type)) return sum + (Number(e.Weight) || 0);
            if (receivedTypes.includes(e.Type)) return sum - (Number(e.Weight) || 0);
            return sum;
        }, 0)
    );

    return (
        <div className="mt-8 rounded-md bg-white p-4 md:p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Loom Entries & Warp Details</h3>

            {/* Search Input */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by Type, Date, or Details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md rounded-md border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">Total Given Weight</p>
                    <p className="text-2xl font-bold text-indigo-700">{totalGivenWeight.toFixed(3)} <span className="text-sm font-normal text-indigo-500">kg</span></p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1">Total Received Weight</p>
                    <p className="text-2xl font-bold text-red-700">{totalReceivedWeight.toFixed(3)} <span className="text-sm font-normal text-red-500">kg</span></p>
                </div>
                <div className={`rounded-lg border ${totalGivenWeight - totalReceivedWeight > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} px-5 py-4`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${totalGivenWeight - totalReceivedWeight > 0 ? 'text-green-600' : 'text-green-600'} mb-1`}>Total Remaining</p>
                    <p className={`text-2xl font-bold ${totalGivenWeight - totalReceivedWeight > 0 ? 'text-green-600' : 'text-green-600'}`}>{(totalGivenWeight - totalReceivedWeight).toFixed(3)} <span className="text-sm font-normal text-green-500">kg</span></p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-bold text-lg">Type</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg">Date</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg">Details</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Given Weight</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Received Weight</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Total Weight to Reduce</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Edit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredEntries.map((entry, index) => {
                            const isGiven = givenTypes.includes(entry.Type);
                            const isReceived = receivedTypes.includes(entry.Type);
                            const balance = suffixBalances[index];
                            return (
                                <tr
                                    key={entry.id}
                                    className={`hover:bg-slate-50 transition-colors ${entry.isSizingGroup ? 'bg-indigo-50/30' : ''}`}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {entry.isSizingGroup ? (
                                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-base font-medium text-indigo-800">
                                                <Link href={`/admin/sizing/${entry.sizingId}/edit`}>
                                                    Sizing Id {entry.sizingId}
                                                </Link>
                                            </span>
                                        ) : entry.Type === 'Vesti' || entry.Type === 'Vesti (Warp Summary)' || entry.Type === 'Return Cone' || entry.Type === 'Babbin Return' || entry.Type === 'Wast Percentage' ? (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-base font-medium text-red-800">
                                                {entry.Type}
                                            </span>
                                        ) : entry.Type === 'Closed Negative' || entry.Type === 'Closed Positive' ? (
                                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-base font-bold text-orange-800">
                                                {entry.Type}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-base font-medium text-emerald-800">
                                                {entry.Type}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap ${entry.Type === 'Closed Negative' ? 'text-orange-600 font-bold text-base' : ''}`}>
                                        {entry.Date ? formatDateNew(entry.Date) : '-'}
                                    </td>
                                    <td className={`px-4 py-3 max-w-xs truncate ${entry.Type === 'Closed Negative' ? 'text-orange-600 font-bold text-base' : ''}`} title={entry.Details || ''}
                                        onMouseEnter={() => handleMouseEnter(entry.sizingId, entry.LoomId)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {hoveredSizingId === Number(entry.sizingId) && (
                                            <div className="absolute mt-2 w-1/2 border-2 border-gray-200 rounded-lg bg-white shadow-lg p-3 z-50 overflow-y-auto bottom-50">

                                                <p className="font-semibold mb-2">Warp Details</p>

                                                {warpDetails.length === 0 ? (
                                                    <p className="text-base text-gray-400">Loading...</p>
                                                ) : (
                                                    <ul className="text-base space-y-1">
                                                        {warpDetails.map((warp: any, index: number) => (
                                                            <li key={entry.id + ' ' + index} className="pb-2 border-b border-gray-200 mb-2">
                                                                <span className="w-full pr-4"><span className="font-semibold">Meter:</span> {warp.Meters}</span>
                                                                <span className="w-full pr-4"><span className="font-semibold">Weight:</span> {warp.Weight}</span>
                                                                <span className="w-full pr-4"><span className="font-semibold">Color:</span> {warp.Color}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                        {entry.Details || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-green-600 text-base">
                                        {entry.Type === 'Warp' || entry.Type === 'Weft' || entry.Type === 'Babbin' || entry.Type === 'Kuri Cone' || entry.Type === 'Closed Positive' ? (entry.Weight ? Number(entry.Weight).toFixed(3) : '-') : '-'}
                                    </td>

                                    <td className={`px-4 py-3 whitespace-nowrap text-right ${entry.Type === 'Closed Negative' ? 'text-orange-600 font-bold' : 'text-red-600 font-medium'} text-base `}>
                                        {entry.Type === 'Vesti' || entry.Type === 'Vesti (Warp Summary)' || entry.Type === 'Return Cone' || entry.Type === 'Closed Negative' || entry.Type === 'Wast Percentage' ? entry.Weight ? Number(entry.Weight).toFixed(3) : '-' : '-'}
                                    </td>

                                    <td className={`px-4 py-3 whitespace-nowrap text-right font-semibold text-base ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                        {(isGiven || isReceived) ? balance.toFixed(3) : '-'}
                                    </td>

                                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-indigo-600 text-base">
                                        {entry.isWarpSummary ? (
                                            <Link className="cursor-pointer text-indigo-600 font-bold hover:underline" href={`/admin/warp/${entry.sizingId}/${entry.LoomId}/summary`}>
                                                Edit (Warp Summary)
                                            </Link>
                                        ) : (
                                            <>
                                                <Link className="cursor-pointer" href={`/admin/jobworks/${entry.id}/entries`}>
                                                    Edit
                                                </Link>
                                                <span onClick={() => handleDelete(Number(entry.id))} className="text-red-600 cursor-pointer">Delete</span>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
