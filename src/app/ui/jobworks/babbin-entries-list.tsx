'use client';
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import { deleteEntry } from "@/app/api/node/looms"
import { formatDateNew } from "@/app/lib/utils";

export default function LoomEntriesList({ entries, loom }: { entries: any[], loom: any }) {
    const [searchQuery, setSearchQuery] = useState("");

    if (!entries || entries.length === 0) {
        return (
            <div className="mt-8 rounded-md bg-white p-4 md:p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Babbin Entries</h3>
                <p className="text-sm text-slate-500">No entries found for this.</p>
            </div>
        );
    }

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

    const filteredEntries = entries.filter((e) => {
        const query = searchQuery.toLowerCase();
        const typeMatch = e.Type?.toLowerCase().includes(query);
        const detailsMatch = e.Details?.toLowerCase().includes(query);
        const formattedDate = e.Date ? formatDateNew(e.Date).toLowerCase() : "";
        const dateMatch = formattedDate.includes(query);
        return typeMatch || detailsMatch || dateMatch;
    });

    const givenTypes = ['Weft'];
    const receivedTypes = ['Babbin Return', 'Return Cone', 'Wast Percentage'];
    const givenBabbinTypes = ['Babbin Given'];

    const totalGivenWeight = filteredEntries.reduce((sum, e) => {
        if (givenTypes.includes(e.Type)) return sum + (Number(e.Weight) || 0);
        return sum;
    }, 0);

    const totalReceivedWeight = filteredEntries.reduce((sum, e) => {
        if (receivedTypes.includes(e.Type)) return sum + (Number(e.Weight) || 0);
        return sum;
    }, 0);

    const totalGivenBabbin = filteredEntries.reduce((sum, e) => {
        if (givenBabbinTypes.includes(e.Type)) return sum + (Number(e.BabbinCount) || 0);
        return sum;
    }, 0);

    const totalReceivedBabbin = filteredEntries.reduce((sum, e) => {
        if (receivedTypes.includes(e.Type)) return sum + (Number(e.BabbinCount) || 0);
        return sum;
    }, 0);

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
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">Total Given Yarn</p>
                    <p className="text-2xl font-bold text-indigo-700">{totalGivenWeight.toFixed(3)} <span className="text-sm font-normal text-indigo-500">kg</span></p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1">Total Received  Yarn</p>
                    <p className="text-2xl font-bold text-red-700">{totalReceivedWeight.toFixed(3)} <span className="text-sm font-normal text-red-500">kg</span></p>
                </div>
                <div className={`rounded-lg border ${totalGivenWeight - totalReceivedWeight > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} px-5 py-4`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${totalGivenWeight - totalReceivedWeight > 0 ? 'text-green-600' : 'text-green-600'} mb-1`}>Total Remaining</p>
                    <p className={`text-2xl font-bold ${totalGivenWeight - totalReceivedWeight > 0 ? 'text-green-600' : 'text-green-600'}`}>{(totalGivenWeight - totalReceivedWeight).toFixed(3)} <span className="text-sm font-normal text-green-500">kg</span></p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">Total Given Babbin</p>
                    <p className="text-2xl font-bold text-indigo-700">{totalGivenBabbin}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1">Total Received Babbin</p>
                    <p className="text-2xl font-bold text-red-700">{totalReceivedBabbin}</p>
                </div>
                <div className={`rounded-lg border ${totalGivenBabbin - totalReceivedBabbin > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} px-5 py-4`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${totalGivenBabbin - totalReceivedBabbin > 0 ? 'text-green-600' : 'text-green-600'} mb-1`}>Total Remaining</p>
                    <p className={`text-2xl font-bold ${totalGivenBabbin - totalReceivedBabbin > 0 ? 'text-green-600' : 'text-green-600'}`}>{(totalGivenBabbin - totalReceivedBabbin)}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-bold text-lg">Type</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg">Date</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg">Details</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Given Babbin</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Received Babbin</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Given Weight</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Received Weight</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Return Weight</th>
                            <th scope="col" className="px-4 py-3 font-bold text-lg text-right">Edit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredEntries.map((entry) => (
                            <tr
                                key={entry.id}
                                className={`hover:bg-slate-50 transition-colors ${entry.isSizingGroup ? 'bg-indigo-50/30' : ''}`}
                            >
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {entry.Type === 'Babbin Received' || entry.Type === 'Return Cone' || entry.Type === 'Babbin Return' || entry.Type === 'Wast Percentage' ? (
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
                                >
                                    {entry.Details || '-'}
                                </td>
                                <td className={`px-4 py-3 max-w-xs truncate text-green-600 font-bold text-base`} title={entry.BabbinCount || ''}
                                >
                                    {entry.Type === 'Babbin Given' ? entry.BabbinCount : '-'}
                                </td>
                                <td className={`px-4 py-3 max-w-xs truncate text-red-600 font-bold text-base`} title={entry.BabbinCount || ''}
                                >
                                    {entry.Type === 'Babbin Return' ? entry.BabbinCount : '-'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-green-600 text-base">
                                    {entry.Type === 'Weft' || entry.Type === 'Closed Positive' ? (entry.Weight ? Number(entry.Weight).toFixed(3) : '-') : '-'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-red-600 text-base">
                                    {entry.Type === 'Babbin Return' || entry.Type === 'Closed Positive' ? (entry.Weight ? Number(entry.Weight).toFixed(3) : '-') : '-'}
                                </td>

                                <td className={`px-4 py-3 whitespace-nowrap text-right ${entry.Type === 'Closed Negative' ? 'text-orange-600 font-bold' : 'text-red-600 font-medium'} text-base `}>
                                    {entry.Type === 'Return Cone' || entry.Type === 'Closed Negative' || entry.Type === 'Wast Percentage' ? entry.Weight ? Number(entry.Weight).toFixed(3) : '-' : '-'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-indigo-600 text-base">
                                    <Link className="cursor-pointer" href={`/admin/jobworks/${entry.id}/entries`}>
                                        Edit
                                    </Link>
                                    <span onClick={() => handleDelete(entry.id)} className="text-red-600 cursor-pointer">Delete</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
