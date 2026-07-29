import db from '@/server/config/db';

export const fetchBeemDetailsById = async (id: number) => {
    try {
        const [rows]: any = await db.query(`SELECT * FROM beem_details WHERE BeemId = ?`, [id]);
        return rows || [];
    } catch (error) {
        return [];
    }
};

export const fetchBeemDetails = async (
    query: string,
    loomName: string,
    currentPage: number
) => {
    const ITEMS_PER_PAGE = 20;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        let whereSql = ` WHERE 1=1`;
        let params: any[] = [];

        if (query) {
            whereSql += ` AND L.LoomName LIKE ?`;
            params.push(`%${query}%`);
        }

        const sql = `
            SELECT B.*, L.LoomName, L.ContactNumber, L.Address
            FROM beem_details B
            LEFT JOIN loom_details L ON B.LoomId = L.LoomId
            ${whereSql}
            ORDER BY B.Date DESC
            LIMIT ? OFFSET ?
        `;

        const [rows]: any = await db.query(sql, [...params, ITEMS_PER_PAGE, offset]);

        const formatted = rows.map((r: any) => ({
            ...r,
            loom_details: r.LoomId ? {
                LoomId: r.LoomId,
                LoomName: r.LoomName,
                ContactNumber: r.ContactNumber,
                Address: r.Address
            } : null
        }));

        const sum = formatted.reduce(
            (acc: any, row: any) => ({
                Loaded: acc.Loaded + (row.Loaded ?? 0),
                Running: acc.Running + (row.Running ?? 0),
                Empty: acc.Empty + (row.Empty ?? 0),
                Return: acc.Return + (row.Return ?? 0),
            }),
            { Loaded: 0, Running: 0, Empty: 0, Return: 0 }
        );

        return { data: formatted || [], sum };
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
        let whereSql = ` WHERE 1=1`;
        let params: any[] = [];

        if (query) {
            whereSql += ` AND L.LoomName LIKE ?`;
            params.push(`%${query}%`);
        }

        const [rows]: any = await db.query(
            `SELECT COUNT(*) AS count FROM beem_details B LEFT JOIN loom_details L ON B.LoomId = L.LoomId${whereSql}`,
            params
        );
        const count = Number(rows[0]?.count || 0);
        const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

        return { totalPages };
    } catch (error) {
        return { totalPages: 0 };
    }
};

export const fetchBeemDetailsByLoomId = async (id: number) => {
    try {
        const [rows]: any = await db.query(`
            SELECT B.*, L.LoomName, L.ContactNumber, L.Address
            FROM beem_details B
            LEFT JOIN loom_details L ON B.LoomId = L.LoomId
            WHERE B.LoomId = ?
            ORDER BY B.Date DESC
        `, [id]);

        return rows.map((r: any) => ({
            ...r,
            loom_details: r.LoomId ? {
                LoomId: r.LoomId,
                LoomName: r.LoomName,
                ContactNumber: r.ContactNumber,
                Address: r.Address
            } : null
        })) || [];
    } catch (error) {
        return [];
    }
};
