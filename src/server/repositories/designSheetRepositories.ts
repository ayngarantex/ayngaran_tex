import db from '../config/db';
import type { DesignSheetItem, DesignSheet } from '@/app/lib/types';
export type { DesignSheetItem, DesignSheet };

export const getDesignSheets = async (
    search: string = '',
    page: number = 1,
    limit: number = 20
): Promise<DesignSheet[]> => {
    const offset = (page - 1) * limit;
    let query = `
        SELECT 
            Id, DesignNumber, DesignName, ItemWidth, TotalEnds,
            ColorSummary, Notes, Items,
            DATE_FORMAT(CreatedAt, '%Y-%m-%d %H:%i') AS CreatedAt,
            DATE_FORMAT(UpdatedAt, '%Y-%m-%d %H:%i') AS UpdatedAt
        FROM design_sheets
    `;
    const params: any[] = [];

    if (search && search.trim() !== '') {
        query += ` WHERE LOWER(DesignNumber) LIKE ? OR LOWER(DesignName) LIKE ? OR LOWER(ItemWidth) LIKE ?`;
        const s = `%${search.trim().toLowerCase()}%`;
        params.push(s, s, s);
    }

    query += ` ORDER BY Id DESC LIMIT ${Number(limit) || 20} OFFSET ${Number(offset) || 0}`;

    const [rows]: any = await db.query(query, params);

    return rows.map((r: any) => ({
        ...r,
        ColorSummary: typeof r.ColorSummary === 'string' ? JSON.parse(r.ColorSummary) : r.ColorSummary,
        Items: typeof r.Items === 'string' ? JSON.parse(r.Items) : (r.Items || [])
    }));
};

export const getDesignSheetsCount = async (search: string = ''): Promise<number> => {
    let query = `SELECT COUNT(*) AS total FROM design_sheets`;
    const params: any[] = [];

    if (search && search.trim() !== '') {
        query += ` WHERE LOWER(DesignNumber) LIKE ? OR LOWER(DesignName) LIKE ? OR LOWER(ItemWidth) LIKE ?`;
        const s = `%${search.trim().toLowerCase()}%`;
        params.push(s, s, s);
    }

    const [rows]: any = await db.query(query, params);
    return rows[0]?.total || 0;
};

export const getDesignSheetById = async (id: number): Promise<DesignSheet | null> => {
    const [rows]: any = await db.query(
        `SELECT 
            Id, DesignNumber, DesignName, ItemWidth, TotalEnds,
            ColorSummary, Notes, Items,
            DATE_FORMAT(CreatedAt, '%Y-%m-%d %H:%i') AS CreatedAt,
            DATE_FORMAT(UpdatedAt, '%Y-%m-%d %H:%i') AS UpdatedAt
         FROM design_sheets WHERE Id = ?`,
        [Number(id)]
    );

    if (rows.length === 0) return null;

    const r = rows[0];
    return {
        ...r,
        ColorSummary: typeof r.ColorSummary === 'string' ? JSON.parse(r.ColorSummary) : r.ColorSummary,
        Items: typeof r.Items === 'string' ? JSON.parse(r.Items) : (r.Items || [])
    };
};

export const createDesignSheet = async (data: {
    DesignNumber: string;
    DesignName: string;
    ItemWidth: string;
    TotalEnds: number;
    ColorSummary: Record<string, number>;
    Notes?: string | null;
    Items: DesignSheetItem[];
}): Promise<number> => {
    const [result]: any = await db.query(
        `INSERT INTO design_sheets (DesignNumber, DesignName, ItemWidth, TotalEnds, ColorSummary, Notes, Items)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            data.DesignNumber.trim(),
            data.DesignName.trim(),
            data.ItemWidth || '54"',
            data.TotalEnds || 0,
            JSON.stringify(data.ColorSummary || {}),
            data.Notes || null,
            JSON.stringify(data.Items || [])
        ]
    );

    return result.insertId;
};

export const updateDesignSheet = async (
    id: number,
    data: {
        DesignNumber: string;
        DesignName: string;
        ItemWidth: string;
        TotalEnds: number;
        ColorSummary: Record<string, number>;
        Notes?: string | null;
        Items: DesignSheetItem[];
    }
): Promise<boolean> => {
    await db.query(
        `UPDATE design_sheets SET
            DesignNumber = ?,
            DesignName = ?,
            ItemWidth = ?,
            TotalEnds = ?,
            ColorSummary = ?,
            Notes = ?,
            Items = ?
         WHERE Id = ?`,
        [
            data.DesignNumber.trim(),
            data.DesignName.trim(),
            data.ItemWidth || '54"',
            data.TotalEnds || 0,
            JSON.stringify(data.ColorSummary || {}),
            data.Notes || null,
            JSON.stringify(data.Items || []),
            Number(id)
        ]
    );

    return true;
};

export const deleteDesignSheet = async (id: number): Promise<boolean> => {
    await db.query(`DELETE FROM design_sheets WHERE Id = ?`, [Number(id)]);
    return true;
};

export const getDesignSheetByNumber = async (designNumber: string): Promise<DesignSheet | null> => {
    const [rows]: any = await db.query(
        `SELECT 
            Id, DesignNumber, DesignName, ItemWidth, TotalEnds,
            ColorSummary, Notes, Items,
            DATE_FORMAT(CreatedAt, '%Y-%m-%d %H:%i') AS CreatedAt,
            DATE_FORMAT(UpdatedAt, '%Y-%m-%d %H:%i') AS UpdatedAt
         FROM design_sheets WHERE LOWER(DesignNumber) = LOWER(?) LIMIT 1`,
        [designNumber.trim()]
    );

    if (rows.length === 0) return null;

    const r = rows[0];
    return {
        ...r,
        ColorSummary: typeof r.ColorSummary === 'string' ? JSON.parse(r.ColorSummary) : r.ColorSummary,
        Items: typeof r.Items === 'string' ? JSON.parse(r.Items) : (r.Items || [])
    };
};

