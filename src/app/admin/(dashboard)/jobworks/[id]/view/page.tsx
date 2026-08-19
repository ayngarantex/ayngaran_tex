import { fetchLoomById, fetchLoomEntriesByLoomId, fetchSizingWarpDetailsByLoomId, fetchWarpSummaryEntriesByLoomId } from '@/app/api/node/looms'
import BabbinEntriesList from '@/app/ui/jobworks/babbin-entries-list';
import { CreateLoomEntry } from '@/app/ui/jobworks/buttons';
import LoomEntriesList from '@/app/ui/jobworks/loom-entries-list';
import Link from 'next/link';

export default async function Page(props: {
    params: Promise<{ id: string }>
}) {
    // const searchParams = await props.searchParams;
    const params = await props.params;
    const Id = parseInt(params.id);
    const loom = await fetchLoomById(String(Id));
    // const currentPage = Number(searchParams?.page) || 1;

    const [loomEntries, sizingGroups, warpSummaryEntries] = await Promise.all([
        fetchLoomEntriesByLoomId(Id),
        fetchSizingWarpDetailsByLoomId(Id),
        fetchWarpSummaryEntriesByLoomId(Id),
    ]);

    // Format loom_entries to match the unified structure
    const formattedLoomEntries = loomEntries.map((entry: any) => ({
        id: `${entry.LoomEntryId}`,
        Type: entry.Type,
        Date: entry.Date,
        Details: entry.Details,
        Weight: entry.Weight || 0,
        BabbinCount: entry.BabbinCount || 0,
        WarpWeight: entry.WarpWeight || 0,
        isSizingGroup: false,
        isWarpSummary: false
    }));

    const formattedSummaryEntries = warpSummaryEntries.map((entry: any) => ({
        ...entry,
        Weight: entry.Weight || 0,
        BabbinCount: 0,
        WarpWeight: 0,
    }));

    // Combine and sort based on date descending
    const combinedEntries = [...formattedLoomEntries, ...sizingGroups, ...formattedSummaryEntries].sort((a, b) => {
        const dateA = a.Date ? (isNaN(Number(a.Date)) ? new Date(a.Date).getTime() : Number(a.Date)) : 0;
        const dateB = b.Date ? (isNaN(Number(b.Date)) ? new Date(b.Date).getTime() : Number(b.Date)) : 0;
        return dateB - dateA;
    });

    const loomName = loom?.LoomName || 'Unknown Loom';

    return (
        <main className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className={`text-2xl`}>{loomName} Entries & Warp Details</h1>
                <CreateLoomEntry loomId={Id.toString()} />
                <Link
                    href={`/admin/jobworks`}
                    className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
                >
                    Go Back
                </Link>
            </div>
            {loomName === 'Babbin Kannan' ?
                <BabbinEntriesList entries={combinedEntries} loom={loom} />
                :
                <LoomEntriesList entries={combinedEntries} loom={loom} />
            }
        </main>
    );
}
