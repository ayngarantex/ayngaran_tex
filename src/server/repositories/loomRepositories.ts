import db from '../config/db';

export const getLooms = async (search: string | null, page: number | null, limit: number | null) => {
    let sql = "SELECT * FROM loom_details";
    let params: any[] = [];

    if (search != null && search != "") {
        sql += " WHERE LOWER(LoomName) LIKE ?";
        params.push(`%${search}%`);
    }

    if (page != null && limit != null) {
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, (page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getLoomCount = async (search: string | null) => {
    let sql = "SELECT COUNT(*) as count FROM loom_details";
    let params: any[] = [];

    if (search != null && search != "") {
        sql += " WHERE LOWER(LoomName) LIKE ?";
        params.push(`%${search}%`);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0].count;
};

export const getLoomById = async (Id: any) => {
    const [rows]: any = await db.query("SELECT * FROM loom_details WHERE LoomId = ?", [Id]);
    return rows[0];
};

export const createLoom = async (loomData: any) => {
    const { LoomName, Address, ContactNumber, Count } = loomData;
    const [result]: any = await db.query(
        "INSERT INTO loom_details (LoomName, Address, ContactNumber, Count) VALUES (?, ?, ?, ?)",
        [LoomName, Address, ContactNumber, Count]
    );
    return result;
};

export const updateLoom = async (loomData: any) => {
    const { LoomId, LoomName, Address, ContactNumber, Count } = loomData;
    const [result]: any = await db.query(
        "UPDATE loom_details SET LoomName = ?, Address = ?, ContactNumber = ?, Count = ? WHERE LoomId = ?",
        [LoomName, Address, ContactNumber, Count, LoomId]
    );
    return result.affectedRows;
};

export const deleteLoom = async (Id: any) => {
    const [result]: any = await db.query("DELETE FROM loom_details WHERE LoomId = ?", [Id]);
    return result.affectedRows;
};

export const getEntryById = async (Id: any) => {
    const [rows]: any = await db.query("SELECT * FROM loom_entries WHERE LoomEntryId = ?", [Id]);
    return rows[0];
}

export const createEntry = async (entryData: any) => {
    if (entryData && entryData.length > 0) {
        for (const item of entryData) {
            const loomId = Number(item.LoomId) > 0 ? Number(item.LoomId) : null;
            await db.query(
                "INSERT INTO loom_entries (Date, Type, LoomId, Details, BabbinCount, Weight) VALUES (?, ?, ?, ?, ?, ?)",
                [item.Date, item.Type, loomId, item.Details, item.BabbinCount, item.Weight]
            );
        }
        return "Created";
    }
    return "Error";
}

export const updateEntry = async (entryData: any) => {
    const { LoomEntryId, Date, Type, LoomId, Details, BabbinCount, Weight } = entryData;
    const loomId = Number(LoomId) > 0 ? Number(LoomId) : null;

    const [result]: any = await db.query(
        "UPDATE loom_entries SET Date = ?, Type = ?, LoomId = ?, Details = ?, BabbinCount = ?, Weight = ? WHERE LoomEntryId = ?",
        [Date, Type, loomId, Details, BabbinCount, Weight, LoomEntryId]
    );
    return result.affectedRows;
}

export const deleteEntry = async (Id: any) => {
    const [result]: any = await db.query("DELETE FROM loom_entries WHERE LoomEntryId = ?", [Id]);
    return result.affectedRows;
};

export const getLoomEntriesByLoomId = async (loomId: any) => {
    const [rows]: any = await db.query(
        "SELECT * FROM loom_entries WHERE LoomId = ? ORDER BY Date DESC",
        [Number(loomId)]
    );
    return rows;
};

export const getSizingWarpDetailsByLoomId = async (loomId: any) => {
    const [rows]: any = await db.query(
        `SELECT SizingId, DeliveredDate, Color, SUM(Weight) as sumWeight, SUM(Meters) as sumMeters, COUNT(*) as count 
         FROM sizing_warp_details 
         WHERE LoomId = ? AND SizingId IS NOT NULL 
         GROUP BY SizingId, DeliveredDate, Color`,
        [Number(loomId)]
    );

    const formattedData = rows.map((group: any) => {
        const sumWeight = parseFloat(group.sumWeight) || 0;
        const sumMeters = parseFloat(group.sumMeters) || 0;
        const count = parseInt(group.count) || 0;
        const Color = group.Color || '';
        const SizingId = group.SizingId;
        const dateObj = group.DeliveredDate ? new Date(group.DeliveredDate) : null;

        return {
            sizingId: SizingId,
            id: `sizing-${SizingId}-${dateObj ? dateObj.getTime() : 'nodate'}`,
            Type: 'Warp',
            LoomId: Number(loomId),
            Date: group.DeliveredDate || null,
            Details: `Meters: ${sumMeters}, Count: ${count} (Sizing #${SizingId}), Color: ${Color}`,
            Weight: sumWeight,
            isSizingGroup: true,
        };
    });

    return formattedData;
};

export const getWarpSummaryEntriesByLoomId = async (loomId: any) => {
    const [rows]: any = await db.query(
        `SELECT SSD.*, S.Color as SizingColor
         FROM sizing_summary_details SSD
         LEFT JOIN sizing S ON SSD.SizingId = S.SizingId
         WHERE SSD.LoomId = ? AND SSD.Date >= '2026-07-20' AND SSD.Weight IS NOT NULL
         ORDER BY SSD.Date DESC`,
        [Number(loomId)]
    );

    return rows.map((row: any) => ({
        id: `summary-${row.DcId}`,
        Type: 'Vesti (Warp Summary)',
        LoomId: Number(loomId),
        Date: row.Date || null,
        Details: `DC: ${row.Dc}, Count: ${row.Count} Color: ${row.SizingColor || ''} (Sizing #${row.SizingId})`,
        Weight: parseFloat(row.weight || row.Weight) || 0,
        isSizingGroup: false,
        isWarpSummary: true,
        sizingId: row.SizingId,
    }));
};