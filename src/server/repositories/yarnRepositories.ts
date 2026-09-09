import db from '../config/db';

export const getYarns = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    let sql = `
    SELECT Y.*, Sup.Name AS SupplierName, Sup.GstNumber AS SupplierGstNumber,
           Sup.Address AS SupplierAddress, Sup.State AS SupplierState, Sup.Phone AS SupplierPhone,
           Sup.Mobile AS SupplierMobile, Sup.Agent AS SupplierAgent, Sup.AccountNumber AS SupplierAccountNumber,
           Sup.Bank AS SupplierBank, Sup.IfscCode AS SupplierIfscCode, Sup.Type AS SupplierType
    FROM yarns Y
    LEFT JOIN suppliers Sup ON Y.SupplierId = Sup.SupplierId
    WHERE 1=1
    `;
    let params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            LOWER(Y.InvoiceNumber) LIKE LOWER(?)
            OR LOWER(Sup.Name) LIKE LOWER(?)
            OR LOWER(Sup.GstNumber) LIKE LOWER(?)
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(Y.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND Y.BillType = ? ";
        params.push(billType);
    }

    if (orderBy === 'pending') {
        sql += ` ORDER BY 
            CASE WHEN (COALESCE(Y.InvoiceAmount, 0) - COALESCE(Y.PaidAmount, 0)) > 0 THEN 0 ELSE 1 END,
            Y.InvoiceDate ASC`;
    } else {
        sql += " ORDER BY Y.InvoiceDate DESC, Y.YarnId DESC";
    }

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    const yarns: any[] = [];

    for (const row of rows) {

        let detPayment = `
            SELECT YPD.*
            FROM yarn_payment_details YPD
            WHERE YPD.YarnId = ${row.YarnId}
        `;

        const [payments]: any = await db.query(detPayment);
        let detYarn = `
            SELECT YD.*
            FROM yarn_details YD
            WHERE YD.YarnId = ${row.YarnId}
        `
        const [details]: any = await db.query(detYarn)
        yarns.push({
            ...row,
            suppliers: row.SupplierId ? {
                SupplierId: row.SupplierId,
                Name: row.SupplierName,
                GstNumber: row.SupplierGstNumber,
                Address: row.SupplierAddress,
                State: row.SupplierState,
                Phone: row.SupplierPhone,
                Mobile: row.SupplierMobile,
                Agent: row.SupplierAgent,
                AccountNumber: row.SupplierAccountNumber,
                Bank: row.SupplierBank,
                IfscCode: row.SupplierIfscCode,
                Type: row.SupplierType
            } : null,
            yarn_payment_details: payments,
            yarn_details: details
        })
    };
    return yarns;
};

export const getYarnCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `
    SELECT COUNT(DISTINCT Y.YarnId) AS total
    FROM yarns Y
    LEFT JOIN suppliers Sup ON Y.SupplierId = Sup.SupplierId
    WHERE 1=1
    `;
    const params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            LOWER(Y.InvoiceNumber) LIKE LOWER(?)
            OR LOWER(Sup.Name) LIKE LOWER(?)
            OR LOWER(Sup.GstNumber) LIKE LOWER(?)
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(Y.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND Y.BillType = ? ";
        params.push(billType);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0]?.total ?? 0;
};

export const getYarnTotal = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    let sql = `
    SELECT SUM(Y.InvoiceAmount) AS totalInvoiceAmount, SUM(Y.PaidAmount) AS totalPaidAmount
    FROM yarns Y
    LEFT JOIN suppliers Sup ON Y.SupplierId = Sup.SupplierId
    WHERE 1=1
    `;
    const params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            LOWER(Y.InvoiceNumber) LIKE LOWER(?)
            OR LOWER(Sup.Name) LIKE LOWER(?)
            OR LOWER(Sup.GstNumber) LIKE LOWER(?)
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(Y.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND Y.BillType = ? ";
        params.push(billType);
    }

    const [rows]: any = await db.query(sql, params);
    const totalInvoiceAmount = Number(rows[0]?.totalInvoiceAmount || 0);
    const totalPaidAmount = Number(rows[0]?.totalPaidAmount || 0);
    const totalPendingAmount = totalInvoiceAmount - totalPaidAmount;

    return {
        totalInvoiceAmount,
        totalPaidAmount,
        totalPendingAmount
    };
};

export const getYarnById = async (id: number) => {
    let sql = `
    SELECT Y.*, Sup.Name AS SupplierName, Sup.GstNumber AS SupplierGstNumber,
           Sup.Address AS SupplierAddress, Sup.State AS SupplierState, Sup.Phone AS SupplierPhone,
           Sup.Mobile AS SupplierMobile, Sup.Agent AS SupplierAgent, Sup.AccountNumber AS SupplierAccountNumber,
           Sup.Bank AS SupplierBank, Sup.IfscCode AS SupplierIfscCode, Sup.Type AS SupplierType
    FROM yarns Y
    LEFT JOIN suppliers Sup ON Y.SupplierId = Sup.SupplierId
    WHERE Y.YarnId = ?
    `;
    const [rows]: any = await db.query(sql, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];

    const [products]: any = await db.query("SELECT * FROM yarn_details WHERE YarnId = ?", [id]);
    const [payments]: any = await db.query("SELECT * FROM yarn_payment_details WHERE YarnId = ?", [id]);

    return {
        ...row,
        suppliers: row.SupplierId ? {
            SupplierId: row.SupplierId,
            Name: row.SupplierName,
            GstNumber: row.SupplierGstNumber,
            Address: row.SupplierAddress,
            State: row.SupplierState,
            Phone: row.SupplierPhone,
            Mobile: row.SupplierMobile,
            Agent: row.SupplierAgent,
            AccountNumber: row.SupplierAccountNumber,
            Bank: row.SupplierBank,
            IfscCode: row.SupplierIfscCode,
            Type: row.SupplierType
        } : null,
        yarn_details: products,
        yarn_payment_details: payments
    };
};

export const deleteYarn = async (id: number) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query("DELETE FROM yarn_details WHERE YarnId = ?", [id]);
        await conn.query("DELETE FROM yarn_payment_details WHERE YarnId = ?", [id]);
        const [result]: any = await conn.query("DELETE FROM yarns WHERE YarnId = ?", [id]);

        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const createYarn = async (
    invoiceData: any,
    products: any[],
    payments: any[]
) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [yarnRes]: any = await conn.query(
            `INSERT INTO yarns (
                SupplierId, InvoiceNumber, InvoiceDate, BeforeTax, TaxPercentage,
                Cgst, Sgst, Igst, AfterTax, BillType, RoundOff, InvoiceAmount, PaidAmount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                Number(invoiceData.SupplierId) > 0 ? Number(invoiceData.SupplierId) : null,
                invoiceData.InvoiceNumber || null,
                invoiceData.InvoiceDate ? new Date(invoiceData.InvoiceDate) : null,
                invoiceData.BeforeTax || 0,
                invoiceData.TaxPercentage || 0,
                invoiceData.Cgst || 0,
                invoiceData.Sgst || 0,
                invoiceData.Igst || 0,
                invoiceData.AfterTax || 0,
                invoiceData.BillType || 'gst',
                invoiceData.RoundOff || null,
                invoiceData.InvoiceAmount || 0,
                invoiceData.PaidAmount || 0
            ]
        );

        const yarnId = yarnRes.insertId;

        for (const p of products) {
            const qty = parseFloat(String(p.quantity || 0));
            const prc = parseFloat(String(p.price || 0));
            await conn.query(
                `INSERT INTO yarn_details (
                    YarnId, Count, Color, Varient, Bag, Quantity, Price, Total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    yarnId,
                    p.count || null,
                    p.color || null,
                    p.varient || null,
                    p.bag || null,
                    qty,
                    prc,
                    qty * prc
                ]
            );
        }

        for (const pay of payments) {
            if (pay.date && pay.amount) {
                await conn.query(
                    `INSERT INTO yarn_payment_details (
                        YarnId, Date, Amount, Type, ReceivedBy
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        yarnId,
                        pay.date ? new Date(pay.date) : null,
                        pay.amount || null,
                        pay.type || null,
                        pay.to || null
                    ]
                );
            }
        }

        await conn.commit();
        return { YarnId: yarnId };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const updateYarn = async (
    invoiceData: any,
    products: any[],
    payments: any[]
) => {
    const conn = await db.getConnection();
    const yarnId = Number(invoiceData.YarnId);
    try {
        await conn.beginTransaction();

        await conn.query("DELETE FROM yarn_details WHERE YarnId = ?", [yarnId]);
        await conn.query("DELETE FROM yarn_payment_details WHERE YarnId = ?", [yarnId]);

        for (const p of products) {
            const qty = parseFloat(String(p.quantity || 0));
            const prc = parseFloat(String(p.price || 0));
            await conn.query(
                `INSERT INTO yarn_details (
                    YarnId, Count, Color, Varient, Bag, Quantity, Price, Total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    yarnId,
                    p.count || null,
                    p.color || null,
                    p.varient || null,
                    p.bag || null,
                    qty,
                    prc,
                    qty * prc
                ]
            );
        }

        for (const pay of payments) {
            if (pay.date && pay.amount) {
                await conn.query(
                    `INSERT INTO yarn_payment_details (
                        YarnId, Date, Amount, Type, ReceivedBy
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        yarnId,
                        pay.date ? new Date(pay.date) : null,
                        pay.amount || null,
                        pay.type || null,
                        pay.to || null
                    ]
                );
            }
        }

        await conn.query(
            `UPDATE yarns SET
                SupplierId = ?, InvoiceNumber = ?, InvoiceDate = ?, BeforeTax = ?, TaxPercentage = ?,
                Cgst = ?, Sgst = ?, Igst = ?, AfterTax = ?, BillType = ?, RoundOff = ?,
                InvoiceAmount = ?, PaidAmount = ?
             WHERE YarnId = ?`,
            [
                invoiceData.SupplierId || null,
                invoiceData.InvoiceNumber || null,
                invoiceData.InvoiceDate ? new Date(invoiceData.InvoiceDate) : null,
                invoiceData.BeforeTax || 0,
                invoiceData.TaxPercentage || 0,
                invoiceData.Cgst || 0,
                invoiceData.Sgst || 0,
                invoiceData.Igst || 0,
                invoiceData.AfterTax || 0,
                invoiceData.BillType || 'gst',
                invoiceData.RoundOff || null,
                invoiceData.InvoiceAmount || 0,
                invoiceData.PaidAmount || 0,
                yarnId
            ]
        );

        await conn.commit();
        return { YarnId: yarnId };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const updateYarnPaymentsRepo = async (yarnId: any, payments: any[]) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();
        const yId = Number(yarnId);

        await conn.query(
            "DELETE FROM yarn_payment_details WHERE YarnId = ?",
            [yId]
        );

        let totalPaid = 0;
        if (payments && payments.length > 0) {
            for (const item of payments) {
                if (item.date && item.date !== 'date') {
                    const amountNum = Number(item.amount || 0);
                    totalPaid += amountNum;
                    await conn.query(
                        `INSERT INTO yarn_payment_details (YarnId, Date, Amount, Type, ReceivedBy) VALUES (?, ?, ?, ?, ?)`,
                        [yId, item.date ? new Date(item.date) : null, amountNum, item.type || '', item.to || item.ReceivedBy || '']
                    );
                }
            }
        }

        await conn.query(
            "UPDATE yarns SET PaidAmount = ? WHERE YarnId = ?",
            [Number(totalPaid.toFixed(2)), yId]
        );

        await conn.commit();
        return true;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const processYarnLumpSumPaymentRepo = async (data: {
    supplierId: number;
    amount: number;
    paymentDate: string;
    paymentType: string;
    paymentTo: string;
    billType?: string | null;
}) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const supId = Number(data.supplierId);
        let lumpSumRemaining = Number(data.amount);
        const pDate = data.paymentDate;
        const pType = data.paymentType || 'Bank';
        const pTo = data.paymentTo || 'Prakash';

        if (isNaN(lumpSumRemaining) || lumpSumRemaining <= 0) {
            throw new Error("Invalid payment amount");
        }

        let query = `
            SELECT Y.YarnId, Y.InvoiceNumber, Y.InvoiceDate, Y.InvoiceAmount, Y.PaidAmount, Y.BillType
            FROM yarns Y
            WHERE Y.SupplierId = ?
              AND (Y.InvoiceAmount - Y.PaidAmount) > 0.01
        `;
        const params: any[] = [supId];

        if (data.billType) {
            query += ` AND Y.BillType = ?`;
            params.push(data.billType);
        }

        query += ` ORDER BY Y.InvoiceDate ASC, Y.YarnId ASC`;

        const [yarns]: any = await conn.query(query, params);

        if (!yarns || yarns.length === 0) {
            await conn.rollback();
            return {
                success: false,
                message: "No pending unpaid yarn bills found for this supplier."
            };
        }

        const allocatedYarns: any[] = [];
        let totalAllocated = 0;

        for (const yrn of yarns) {
            if (lumpSumRemaining <= 0.001) break;

            const invAmount = Number(yrn.InvoiceAmount || 0);
            const paidAmount = Number(yrn.PaidAmount || 0);
            const pendingBalance = Math.max(0, invAmount - paidAmount);

            if (pendingBalance <= 0.001) continue;

            const payForThisYrn = Math.min(lumpSumRemaining, pendingBalance);
            const newPaidTotal = Number((paidAmount + payForThisYrn).toFixed(2));

            await conn.query(
                `INSERT INTO yarn_payment_details (YarnId, Date, Amount, Type, ReceivedBy) VALUES (?, ?, ?, ?, ?)`,
                [yrn.YarnId, pDate ? new Date(pDate) : null, Number(payForThisYrn.toFixed(2)), pType, pTo]
            );

            await conn.query(
                `UPDATE yarns SET PaidAmount = ? WHERE YarnId = ?`,
                [newPaidTotal, yrn.YarnId]
            );

            lumpSumRemaining = Number((lumpSumRemaining - payForThisYrn).toFixed(2));
            totalAllocated += payForThisYrn;

            allocatedYarns.push({
                YarnId: yrn.YarnId,
                InvoiceNumber: yrn.InvoiceNumber,
                InvoiceDate: yrn.InvoiceDate,
                PaidAmount: Number(payForThisYrn.toFixed(2)),
                RemainingBalance: Number(Math.max(0, invAmount - newPaidTotal).toFixed(2))
            });
        }

        await conn.commit();

        return {
            success: true,
            totalAllocated: Number(totalAllocated.toFixed(2)),
            excessRemaining: Number(lumpSumRemaining.toFixed(2)),
            allocatedCount: allocatedYarns.length,
            allocatedInvoices: allocatedYarns
        };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

