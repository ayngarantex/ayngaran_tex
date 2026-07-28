import { prisma } from '@/app/lib/prisma';

export const fetchBeemDetailsById = async (id: number) => {
    try {
        const data = await prisma.beem_details.findMany({
            where: {
                BeemId: id
            },
        })
        return data || [];
    } catch (error) {
        // return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
        return [];
    }
}

export const fetchBeemDetails = async (
    query: string,
    loomName: string,
    currentPage: number
) => {
    const ITEMS_PER_PAGE = 20;
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const where: any = {
            loom_details: {
                is: {},
            },
        };

        if (query) {
            where.loom_details.is.LoomName = {
                contains: query,
                mode: "insensitive",
            };
        }

        // if (loomName) {
        //     where.loom_details.is.LoomName = loomName;
        // }

        const data = await prisma.beem_details.findMany({
            distinct: ['LoomId'],
            orderBy: [
                { Date: 'desc' }
            ],
            skip,
            take: ITEMS_PER_PAGE,
            where,
            include: {
                loom_details: true,
            },
        });

        const sum = data.reduce(
            (acc, row) => ({
                Loaded: acc.Loaded + (row.Loaded ?? 0),
                Running: acc.Running + (row.Running ?? 0),
                Empty: acc.Empty + (row.Empty ?? 0),
                Return: acc.Return + (row.Return ?? 0),
            }),
            { Loaded: 0, Running: 0, Empty: 0, Return: 0 }
        );

        return { data: data || [], sum };
    } catch (error) {
        return { data: [], sum: { Loaded: 0, Running: 0, Empty: 0, Return: 0 } };
    }
};

export const fetchBeemDetailPages = async (
    query: string,
    loomName: string
) => {
    const ITEMS_PER_PAGE = 20;

    try {
        const where: any = {
            loom_details: {
                is: {},
            },
        };

        if (query) {
            where.loom_details.is.LoomName = {
                contains: query,
                mode: "insensitive",
            };
        }

        if (loomName) {
            where.loom_details.is.LoomName = loomName;
        }

        const count = await prisma.beem_details.count({
            orderBy: [
                { LoomId: 'asc' },
                { Date: 'desc' }  // latest first
            ],
            where,
        });

        const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

        return { totalPages };
    } catch (error) {
        console.error("Database error:", error);
        return { totalPages: 0 };
    }
};

export const fetchBeemDetailsByLoomId = async (id: number) => {
    try {
        const data = await prisma.beem_details.findMany({
            include: {
                loom_details: true
            },
            where: {
                LoomId: id
            },
            orderBy: {
                Date: 'desc'
            }
        })
        return data || [];
    } catch (error) {
        // return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
        return [];
    }
}

