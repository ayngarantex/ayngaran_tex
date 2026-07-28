import { fetchLooms, fetchEntryById } from '@/app/api/node/looms';
import Link from 'next/link';
import LoomEntryDetails from './LoomEntryDetails';
import BabbinEntryDetails from './BabbinEntryDetails';

export default async function Page(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params;
    const Id = parseInt(params.id);
    const entry = await fetchEntryById(Id);
    const looms = await fetchLooms("", 0);

    return (
        <main className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className={`text-2xl`}>Update Entries & Warp Details</h1>
                <Link
                    href={
                        entry?.LoomId ? `/admin/jobworks/${entry?.LoomId}/view` : `/admin/jobworks`
                    }
                    className="flex h-10 items-center rounded-lg bg-blue-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-200"
                >
                    Go Back
                </Link>
            </div>

            {looms.filter((e: any) => e.LoomId === entry?.LoomId.toString())[0].LoomName === 'Babbin Kannan' ?
                <BabbinEntryDetails looms={looms} entry={entry} />
                :
                <LoomEntryDetails looms={looms} entry={entry} />
            }
        </main>
    );
}
