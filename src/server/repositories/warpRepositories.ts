import db from '../config/db';

export const getWarps = async (
    search: string | null,
    loomId: any,
    loomStatus: string | null,
    sizingId: any,
    page: number | null,
    limit: number | null
) => {
    let query = `
    SELECT SWD.*, L.LoomName
    FROM sizing_warp_details SWD
    LEFT JOIN loom_details L ON SWD.LoomId = L.LoomId
    WHERE 1=1
  `;

    if (search) {
        const searchTerm = search.toLowerCase();
        // query += ` AND SWD.WarpName LIKE '%${searchTerm}%'`;
    }

    if (loomId) {
        query += ` AND SWD.LoomId = ${Number(loomId)} `;
    }

    if (loomStatus) {
        if (loomStatus === 'Loaded') {
            query += ` AND SWD.StartDate IS NULL`;
        } else if (loomStatus === 'Running') {
            query += ` AND SWD.StartDate IS NOT NULL AND SWD.CompletedDate IS NULL `;
        } else if (loomStatus === 'Completed') {
            query += ` AND SWD.CompletedDate IS NOT NULL `;
        }
    }

    if (sizingId) {
        query += ` AND SWD.SizingId = ${Number(sizingId)} `;
    }

    query += ` ORDER BY SWD.DeliveredDate DESC`;

    if (page && limit) {
        query += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
    }

    const [rows]: any = await db.query(query);
    const warps: any[] = [];

    for (const row of rows) {
        let detQuery = `
            SELECT WDD.*
            FROM warp_dc_details WDD
            WHERE WDD.WarpId = ${row.WarpId}
        `;

        const [details]: any = await db.query(detQuery);

        warps.push({
            ...row,
            lastDcNumber: details.length > 0 ? details[details.length - 1].Dc : null,
            lastCount: details.length > 0 ? details[details.length - 1].Count : null,
            lastDcDate: details.length > 0 ? details[details.length - 1].Date : null,
            totalDhoties: details.reduce((total: number, detail: any) => total + Number(detail.Count), 0),
        });
    }

    return warps;
};

export const getWarpCount = async (
    search: string | null,
    loomId: any,
    loomStatus: string | null,
    sizingId: any
) => {
    let query = `
    SELECT COUNT(*) as total
    FROM sizing_warp_details SWD
    WHERE 1=1
  `;

    if (loomId) {
        query += ` AND SWD.LoomId = ${Number(loomId)} `;
    }

    if (loomStatus) {
        if (loomStatus === 'Loaded') {
            query += ` AND SWD.StartDate IS NULL`;
        } else if (loomStatus === 'Running') {
            query += ` AND SWD.StartDate IS NOT NULL AND SWD.CompletedDate IS NULL `;
        } else if (loomStatus === 'Completed') {
            query += ` AND SWD.CompletedDate IS NOT NULL `;
        }
    }

    if (sizingId) {
        query += ` AND SWD.SizingId = ${Number(sizingId)} `;
    }

    const [rows]: any = await db.query(query);
    return rows[0].total;
};

export const getWarpById = async (id: any) => {
    let query = `
    SELECT SWD.*, L.LoomName
    FROM sizing_warp_details SWD
    LEFT JOIN loom_details L ON SWD.LoomId = L.LoomId
    WHERE SWD.WarpId = ${Number(id)}
  `;

    const [rows]: any = await db.query(query);
    const warp = rows[0];
    if (!warp) return null;

    let detQuery = `
    SELECT WDD.*
    FROM warp_dc_details WDD
    WHERE WDD.WarpId = ${Number(id)}
  `;

    const [details]: any = await db.query(detQuery);

    return {
        ...warp,
        warp_dc_details: details,
    };
};

export const updateWarp = async (warpData: any) => {
    await db.query(
        "UPDATE sizing_warp_details SET StartDate=?, CompletedDate=?, LoomId=?, LoomNumber=? WHERE WarpId=?",
        [warpData?.StartDate || null, warpData?.EndDate || null, Number(warpData?.LoomId) > 0 ? Number(warpData?.LoomId) : null, warpData?.LoomNumber || null, Number(warpData.WarpId)]
    );

    const [getWarpDc]: any = await db.query(
        "SELECT DcId FROM warp_dc_details WHERE WarpId=?",
        [warpData.WarpId]
    );
    const existingDcIds = getWarpDc.map((row: any) => String(row.DcId));

    const newDcIds = warpData.warp_dc_details.map((row: any) => String(row.dcId));
    const dcIdsToDelete = existingDcIds.filter((id: string) => !newDcIds.includes(id));
    if (dcIdsToDelete.length > 0) {
        await db.query(
            "DELETE FROM warp_dc_details WHERE DcId IN (?)",
            [dcIdsToDelete]
        );
    }
    if (warpData.warp_dc_details) {
        for (const detail of warpData.warp_dc_details) {
            if (detail.dcId) {
                await db.query(
                    "UPDATE warp_dc_details SET Dc=?, Color=?, Date=?, Piece=?, Count=?, Weight=? WHERE DcId=?",
                    [detail.dc, detail.color, detail.date, detail.piece, detail.count, detail.weight, detail.dcId]
                );
            } else {
                await db.query(
                    "INSERT INTO warp_dc_details (Dc, Color, Date, Piece, Count, Weight, WarpId) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [detail.dc, detail.color, detail.date, detail.piece, detail.count, detail.weight, warpData.WarpId]
                );
            }
        }
    }
    return "Warp updated successfully";
};

export const getWarpSummary = async (
    search: string | null,
    loomId: any,
    sizingId: any
) => {
    let query = `SELECT         
        S.InvoiceDate,
        S.InvoiceNumber,
        S.SizingId,
        S.Color,
        Sup.Name AS SupplierName,
        COUNT(SWD.WarpId) AS TotalWarps,
        ROUND(COALESCE(SUM(SWD.Weight), 0), 2) AS TotalWeight,
        ROUND(COALESCE(SUM(SWD.Meters), 0), 2) AS TotalMeters,        
        L.LoomName,
        L.LoomId,
        MAX(T.ReceivedWeight) AS ReceivedWeight,
        MAX(T.ReceivedDhoties) AS ReceivedDhoties,
        MAX(T.IsCompleted) AS IsCompleted
    FROM sizing_warp_details SWD     
    LEFT JOIN loom_details L         
        ON SWD.LoomId = L.LoomId     
    LEFT JOIN sizing S         
        ON SWD.SizingId = S.SizingId     
    LEFT JOIN suppliers Sup         
        ON S.SupplierId = Sup.SupplierId     
    LEFT JOIN (         
        SELECT 
            SizingId,
            LoomId,
            ROUND(COALESCE(SUM(Weight), 0), 2) AS ReceivedWeight,
            ROUND(COALESCE(SUM(Count), 0), 2) AS ReceivedDhoties,
            MAX(IsCompleted) AS IsCompleted
        FROM sizing_summary_details SSD                 
        GROUP BY SizingId, LoomId  
    ) AS T
        ON S.SizingId = T.SizingId AND L.LoomId = T.LoomId  
        WHERE 1=1
    `;

    if (search) {
        const searchEscaped = search.replace(/'/g, "''");
        query += ` AND (
            LOWER(Sup.Name) LIKE '%${searchEscaped}%'
            OR LOWER(L.LoomName) LIKE '%${searchEscaped}%'
            OR LOWER(SWD.Color) LIKE '%${searchEscaped}%'
        ) `;
    }

    if (loomId) {
        query += ` AND SWD.LoomId = ${Number(loomId)} `;
    }

    if (sizingId) {
        query += ` AND SWD.SizingId = ${Number(sizingId)} `;
    }

    query += `
    GROUP BY S.SizingId, L.LoomId, S.InvoiceDate, S.InvoiceNumber, S.Color, Sup.Name, L.LoomName
    ORDER BY S.InvoiceDate DESC
    `;

    const [rows]: any = await db.query(query);
    return rows.map((row: any) => ({
        InvoiceDate: row.InvoiceDate || '',
        InvoiceNumber: row.InvoiceNumber || '',
        SizingId: row.SizingId || '',
        SupplierName: row.SupplierName || '',
        Color: row.Color || '',
        TotalWarps: row.TotalWarps || 0,
        TotalWeight: row.TotalWeight || 0,
        TotalMeters: row.TotalMeters || 0,
        LoomId: row.LoomId || '',
        LoomName: row.LoomName || '',
        ReceivedWeight: row.ReceivedWeight || 0,
        ReceivedDhoties: row.ReceivedDhoties || 0,
        IsCompleted: row.IsCompleted || 0,
    }));
};

export const getWarpSummaryById = async (sizingId: any, loomId: any) => {
    const sId = Number(sizingId);
    const lId = Number(loomId);

    let sizingDetailsQuery = `
        SELECT 
            S.InvoiceDate,
            S.SizingId,
            S.Color,
            COUNT(SWD.WarpId) AS TotalWarps,
            ROUND(COALESCE(SUM(SWD.Weight), 0), 2) AS TotalWeight,
            ROUND(COALESCE(SUM(SWD.Meters), 0), 2) AS TotalMeters,
            L.LoomId,
            L.LoomName
        FROM sizing S 
        LEFT JOIN sizing_warp_details SWD ON S.SizingId = SWD.SizingId ${lId > 0 ? `AND SWD.LoomId = ${lId}` : ''}
        LEFT JOIN loom_details L ON SWD.LoomId = L.LoomId
        WHERE S.SizingId = ${sId}
        GROUP BY S.SizingId, L.LoomId, S.InvoiceDate, S.Color, L.LoomName
    `;

    const [sizingDetailsResult]: any = await db.query(sizingDetailsQuery);

    let sizingSummaryQuery = `
        SELECT SSD.Date,
        SSD.Piece,
        SSD.Count,
        SSD.Weight,
        SSD.DcId,
        SSD.Dc,
        SSD.IsCompleted
        FROM sizing_summary_details SSD
        WHERE SSD.SizingId = ${sId} ${lId > 0 ? `AND SSD.LoomId = ${lId}` : ''}
    `;
    const [sizingSummaryResult]: any = await db.query(sizingSummaryQuery);

    let warpDhotieDetailsQuery = `
        SELECT SWD.*
        FROM sizing_warp_details SWD 
        WHERE SWD.SizingId = ${sId} ${lId > 0 ? `AND SWD.LoomId = ${lId}` : ''}
    `;
    const [warpDhotieDetailsResult]: any = await db.query(warpDhotieDetailsQuery);

    const firstRow = sizingDetailsResult && sizingDetailsResult.length > 0 ? sizingDetailsResult[0] : {};

    let data = {
        InvoiceDate: firstRow.InvoiceDate || null,
        SizingId: firstRow.SizingId || sId,
        Color: firstRow.Color || '',
        LoomId: firstRow.LoomId || lId,
        LoomName: firstRow.LoomName || '',
        TotalWarps: firstRow.TotalWarps || 0,
        TotalWeight: firstRow.TotalWeight || 0,
        TotalMeters: firstRow.TotalMeters || 0,
        IsCompleted: sizingSummaryResult.length > 0 ? (sizingSummaryResult[0].IsCompleted ? 1 : 0) : 0,
        warp_detail: warpDhotieDetailsResult || [],
        warp_summary_details: sizingSummaryResult || []
    };

    return data;
};

export const updateWarpSummary = async (summaryData: any) => {
    const { SizingId, LoomId, warp_summary_details, IsCompleted } = summaryData;

    // 1. Get existing DcIds for this SizingId and LoomId
    const [existingRows]: any = await db.query(
        "SELECT DcId FROM sizing_summary_details WHERE SizingId = ? AND LoomId = ?",
        [Number(SizingId), Number(LoomId)]
    );
    const existingDcIds = existingRows.map((row: any) => String(row.DcId));

    // 2. Identify DcIds to delete
    const incomingDcIds = warp_summary_details
        .filter((detail: any) => detail.DcId)
        .map((detail: any) => String(detail.DcId));

    const dcIdsToDelete = existingDcIds.filter((id: string) => !incomingDcIds.includes(id));
    if (dcIdsToDelete.length > 0) {
        await db.query(
            "DELETE FROM sizing_summary_details WHERE DcId IN (?)",
            [dcIdsToDelete]
        );
    }

    // Update IsCompleted status for all existing rows for this Sizing and Loom
    await db.query(
        "UPDATE sizing_summary_details SET IsCompleted = ? WHERE SizingId = ? AND LoomId = ?",
        [IsCompleted ? 1 : 0, Number(SizingId), Number(LoomId)]
    );

    // 3. Insert or Update incoming details
    if (warp_summary_details) {
        for (const detail of warp_summary_details) {
            const dcVal = detail.Dc ? Number(detail.Dc) : null;
            const dateVal = detail.Date || null;
            const pieceVal = detail.Piece ? Number(detail.Piece) : null;
            const countVal = detail.Count || null;
            const weightVal = detail.Weight || null;

            if (detail.DcId) {
                await db.query(
                    "UPDATE sizing_summary_details SET Dc=?, Date=?, Piece=?, Count=?, Weight=? WHERE DcId=?",
                    [dcVal, dateVal, pieceVal, countVal, weightVal, Number(detail.DcId)]
                );
            } else {
                await db.query(
                    "INSERT INTO sizing_summary_details (SizingId, LoomId, Dc, Date, Piece, Count, Weight, IsCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [Number(SizingId), Number(LoomId), dcVal, dateVal, pieceVal, countVal, weightVal, IsCompleted ? 1 : 0]
                );
            }
        }
    }

    return "Warp summary details updated successfully";
};