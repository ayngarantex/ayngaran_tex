import db from '../config/db';

export const getSizings = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    let sql = `
    SELECT S.*, Sup.Name AS SupplierName, Sup.Name AS SizingName, Sup.GstNumber AS SupplierGstNumber,
           Sup.Agent AS SupplierAgent, Sup.AccountNumber AS SupplierAccountNumber, Sup.Bank AS SupplierBank, COUNT(SWD.WarpId) AS TotalWarp
    FROM sizing S
    LEFT JOIN suppliers Sup ON S.SupplierId = Sup.SupplierId
    LEFT JOIN sizing_warp_details SWD ON S.SizingId = SWD.SizingId    
    WHERE 1=1
    `;
    let params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            S.InvoiceNumber LIKE ?
            OR Sup.Name LIKE ?
            OR Sup.GstNumber LIKE ?
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(S.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND S.BillType = ? ";
        params.push(billType);
    }

    sql += " GROUP BY S.SizingId ";

    if (orderBy === 'pending') {
        sql += ` ORDER BY 
            CASE WHEN (COALESCE(S.InvoiceAmount, 0) - COALESCE(S.ReceivedAmount, 0)) > 0 THEN 0 ELSE 1 END,
            S.InvoiceDate ASC`;
    } else {
        sql += " ORDER BY S.InvoiceDate DESC, S.SizingId DESC";
    }

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);

    return rows.map((row: any) => ({
        ...row,
        TotalWarp: Number(row.TotalWarp || 0),
        suppliers: row.SupplierId ? {
            SupplierId: row.SupplierId,
            Name: row.SupplierName,
            GstNumber: row.SupplierGstNumber,
            Adress: row.SupplierAddress,
            State: row.SupplierState,
            Phone: row.SupplierPhone,
            Mobile: row.SupplierMobile,
            Agent: row.SupplierAgent,
            AccountNumber: row.SupplierAccountNumber,
            Bank: row.SupplierBank,
            IfscCode: row.SupplierIfscCode,
            Type: row.SupplierType
        } : null
    }));
};

export const getSizingCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `
    SELECT COUNT(DISTINCT S.SizingId) AS total
    FROM sizing S
    LEFT JOIN suppliers Sup ON S.SupplierId = Sup.SupplierId
    WHERE 1=1
    `;
    const params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            S.InvoiceNumber LIKE ?
            OR Sup.Name LIKE ?
            OR Sup.GstNumber LIKE ?
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(S.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND S.BillType = ? ";
        params.push(billType);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0]?.total ?? 0;
};

export const getSizingTotal = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    let sql = `
    SELECT SUM(S.InvoiceAmount) AS totalInvoiceAmount, SUM(S.ReceivedAmount) AS totalReceived
    FROM sizing S
    LEFT JOIN suppliers Sup ON S.SupplierId = Sup.SupplierId
    WHERE 1=1
    `;
    const params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            S.InvoiceNumber LIKE ?
            OR Sup.Name LIKE ?
            OR Sup.GstNumber LIKE ?
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(S.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND S.BillType = ? ";
        params.push(billType);
    }

    const [rows]: any = await db.query(sql, params);
    const totalInvoiceAmount = Number(rows[0]?.totalInvoiceAmount || 0);
    const totalReceived = Number(rows[0]?.totalReceived || 0);
    const balance = totalInvoiceAmount - totalReceived;

    return {
        totalInvoiceAmount,
        totalReceived,
        balance
    };
};

export const getSizingById = async (id: number) => {
    let sql = `
    SELECT S.*, Sup.Name AS SupplierName, Sup.GstNumber AS SupplierGstNumber
    FROM sizing S
    LEFT JOIN suppliers Sup ON S.SupplierId = Sup.SupplierId
    WHERE S.SizingId = ?
    `;
    const [rows]: any = await db.query(sql, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];

    // Fetch payment details
    const [payments]: any = await db.query("SELECT * FROM sizing_payment_details WHERE SizingId = ?", [id]);

    // Fetch warp details
    const [warps]: any = await db.query("SELECT * FROM sizing_warp_details WHERE SizingId = ?", [id]);

    // Fetch yarn details
    const [yarns]: any = await db.query("SELECT * FROM sizing_yarn_details WHERE SizingId = ?", [id]);

    return {
        ...row,
        suppliers: row.SupplierId ? {
            SupplierId: row.SupplierId,
            Name: row.SupplierName,
            GstNumber: row.SupplierGstNumber,
            Adress: row.SupplierAddress,
            State: row.SupplierState,
            Phone: row.SupplierPhone,
            Mobile: row.SupplierMobile,
            Agent: row.SupplierAgent,
            AccountNumber: row.SupplierAccountNumber,
            Bank: row.SupplierBank,
            IfscCode: row.SupplierIfscCode,
            Type: row.SupplierType
        } : null,
        sizing_payment_details: payments,
        sizing_warp_details: warps,
        sizing_yarn_details: yarns,
        TotalWarp: warps.length
    };
};

export const deleteSizing = async (id: any) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        await conn.query(
            "DELETE FROM sizing_yarn_details WHERE SizingId = ?",
            [id]
        );

        await conn.query(
            "DELETE FROM sizing_warp_details WHERE SizingId = ?",
            [id]
        );

        await conn.query(
            "DELETE FROM sizing_payment_details WHERE SizingId = ?",
            [id]
        );

        const [result]: any = await conn.query(
            "DELETE FROM sizing WHERE SizingId = ?",
            [id]
        );

        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const createSizing = async (
    invoiceData: any,
    products: any[],
    payments: any[],
    sizingYarn: any[]
) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insert sizing
        const [sizingRes]: any = await conn.query(
            `INSERT INTO sizing (
                SupplierId, InvoiceNumber, InvoiceDate, WarpType, Color, Meters, YarnId,
                YarnSent, YarnUsed, YarnBalance, Price, BeforeTax, TaxPercentage,
                Cgst, Sgst, Igst, AfterTax, RoundOff, InvoiceAmount, ReceivedAmount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoiceData.SupplierId || null,
                invoiceData.InvoiceNumber || null,
                invoiceData.InvoiceDate ? new Date(invoiceData.InvoiceDate) : null,
                invoiceData.WarpType || null,
                invoiceData.Color || null,
                invoiceData.Meters || 0,
                invoiceData.YarnId || null,
                invoiceData.YarnSent || 0,
                invoiceData.YarnUsed || 0,
                invoiceData.YarnBalance || 0,
                invoiceData.Price || null,
                invoiceData.BeforeTax || 0,
                invoiceData.TaxPercentage || 0,
                invoiceData.Cgst || 0,
                invoiceData.Sgst || 0,
                invoiceData.Igst || 0,
                invoiceData.AfterTax || 0,
                invoiceData.RoundOff || null,
                invoiceData.InvoiceAmount || 0,
                invoiceData.ReceivedAmount || 0
            ]
        );

        const sizingId = sizingRes.insertId;

        // 2. Insert products (warp details)
        for (const p of products) {
            await conn.query(
                `INSERT INTO sizing_warp_details (
                    SizingId, Meters, Color, DeliveredDate, Price, Weight, LoomId
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    sizingId,
                    p.meters || 0,
                    p.color || null,
                    p.date ? new Date(p.date) : null,
                    p.price ? parseFloat(String(p.price)) : null,
                    p.weight ? parseFloat(String(p.weight)) : null,
                    p.loomId ? parseInt(p.loomId) : null
                ]
            );
        }

        // 3. Insert sizingYarn (yarn details)
        for (const sy of sizingYarn) {
            await conn.query(
                `INSERT INTO sizing_yarn_details (
                    SizingId, Color, YarnSent, YarnUsed, YarnBalance
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    sizingId,
                    sy.color || null,
                    sy.yarnSent || 0,
                    sy.yarnUsed || 0,
                    sy.yarnBalance || 0
                ]
            );
        }

        // 4. Insert payments (payment details)
        for (const pay of payments) {
            await conn.query(
                `INSERT INTO sizing_payment_details (
                    SizingId, Date, Amount, Type, ReceivedBy
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    sizingId,
                    pay.date ? new Date(pay.date) : null,
                    pay.amount || null,
                    pay.type || null,
                    pay.to || null
                ]
            );
        }

        await conn.commit();
        return { SizingId: sizingId };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const updateSizing = async (
    invoiceData: any,
    products: any[],
    payments: any[],
    sizingYarn: any[]
) => {
    const conn = await db.getConnection();
    const sizingId = Number(invoiceData.SizingId);
    try {
        await conn.beginTransaction();

        // 1. Wipe old yarn and payment details
        await conn.query("DELETE FROM sizing_yarn_details WHERE SizingId = ?", [sizingId]);
        await conn.query("DELETE FROM sizing_payment_details WHERE SizingId = ?", [sizingId]);

        // 2. Fetch existing warp details to find which ones to delete
        const [existingWarps]: any = await conn.query(
            "SELECT WarpId FROM sizing_warp_details WHERE SizingId = ?",
            [sizingId]
        );
        const existingWarpIds = existingWarps.map((w: any) => w.WarpId);
        const incomingWarpIds = products.filter((p: any) => p.warpId).map((p: any) => Number(p.warpId));

        const toRemove = existingWarpIds.filter((id: number) => !incomingWarpIds.includes(id));

        for (const warpId of toRemove) {
            const [used]: any = await conn.query(
                "SELECT DcId FROM warp_dc_details WHERE WarpId = ? LIMIT 1",
                [warpId]
            );
            if (used.length === 0) {
                await conn.query("DELETE FROM sizing_warp_details WHERE WarpId = ?", [warpId]);
            } else {
                console.log(`Warp ${warpId} is used in warp_dc_details, skipping delete`);
            }
        }

        // 3. Update or Insert products (warp details)
        for (const p of products) {
            if (p.warpId) {
                await conn.query(
                    `UPDATE sizing_warp_details SET
                        Meters = ?, Color = ?, DeliveredDate = ?, Price = ?, Weight = ?, LoomId = ?
                     WHERE WarpId = ?`,
                    [
                        p.meters || 0,
                        p.color || null,
                        p.date ? new Date(p.date) : null,
                        p.price ? parseFloat(String(p.price)) : null,
                        p.weight ? parseFloat(String(p.weight)) : null,
                        p.loomId ? parseInt(p.loomId) : null,
                        Number(p.warpId)
                    ]
                );
            } else {
                await conn.query(
                    `INSERT INTO sizing_warp_details (
                        SizingId, Meters, Color, DeliveredDate, Price, Weight, LoomId
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        sizingId,
                        p.meters || 0,
                        p.color || null,
                        p.date ? new Date(p.date) : null,
                        p.price ? parseFloat(String(p.price)) : null,
                        p.weight ? parseFloat(String(p.weight)) : null,
                        p.loomId ? parseInt(p.loomId) : null
                    ]
                );
            }
        }

        // 4. Insert new yarn details
        for (const sy of sizingYarn) {
            await conn.query(
                `INSERT INTO sizing_yarn_details (
                    SizingId, Color, YarnSent, YarnUsed, YarnBalance
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    sizingId,
                    sy.color || null,
                    sy.yarnSent || 0,
                    sy.yarnUsed || 0,
                    sy.yarnBalance || 0
                ]
            );
        }

        // 5. Insert new payment details
        for (const pay of payments) {
            await conn.query(
                `INSERT INTO sizing_payment_details (
                    SizingId, Date, Amount, Type, ReceivedBy
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    sizingId,
                    pay.date ? new Date(pay.date) : null,
                    pay.amount || null,
                    pay.type || null,
                    pay.to || null
                ]
            );
        }

        // 6. Update main sizing record
        await conn.query(
            `UPDATE sizing SET
                SupplierId = ?, InvoiceNumber = ?, InvoiceDate = ?, WarpType = ?, Color = ?, Meters = ?, YarnId = ?,
                YarnSent = ?, YarnUsed = ?, YarnBalance = ?, Price = ?, BeforeTax = ?, TaxPercentage = ?,
                Cgst = ?, Sgst = ?, Igst = ?, AfterTax = ?, RoundOff = ?, InvoiceAmount = ?, ReceivedAmount = ?
             WHERE SizingId = ?`,
            [
                invoiceData.SupplierId || null,
                invoiceData.InvoiceNumber || null,
                invoiceData.InvoiceDate ? new Date(invoiceData.InvoiceDate) : null,
                invoiceData.WarpType || null,
                invoiceData.Color || null,
                invoiceData.Meters || 0,
                invoiceData.YarnId || null,
                invoiceData.YarnSent || 0,
                invoiceData.YarnUsed || 0,
                invoiceData.YarnBalance || 0,
                invoiceData.Price || null,
                invoiceData.BeforeTax || 0,
                invoiceData.TaxPercentage || 0,
                invoiceData.Cgst || 0,
                invoiceData.Sgst || 0,
                invoiceData.Igst || 0,
                invoiceData.AfterTax || 0,
                invoiceData.RoundOff || null,
                invoiceData.InvoiceAmount || 0,
                invoiceData.ReceivedAmount || 0,
                sizingId
            ]
        );

        await conn.commit();
        return { SizingId: sizingId };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

