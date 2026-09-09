import db from '../config/db';

export const getPurchases = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    let sql = `
    SELECT P.*, Sup.Name AS SupplierName, Sup.GstNumber AS SupplierGstNumber,
           Sup.Address AS SupplierAddress, Sup.State AS SupplierState, Sup.Phone AS SupplierPhone,
           Sup.Mobile AS SupplierMobile, Sup.Agent AS SupplierAgent, Sup.AccountNumber AS SupplierAccountNumber,
           Sup.Bank AS SupplierBank, Sup.IfscCode AS SupplierIfscCode, Sup.Type AS SupplierType
    FROM purchases P
    LEFT JOIN suppliers Sup ON P.SupplierId = Sup.SupplierId
    WHERE 1=1
    `;
    let params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            LOWER(P.InvoiceNumber) LIKE LOWER(?)
            OR LOWER(Sup.Name) LIKE LOWER(?)
            OR LOWER(Sup.GstNumber) LIKE LOWER(?)
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(P.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND P.BillType = ? ";
        params.push(billType);
    }

    if (orderBy === 'pending') {
        sql += ` ORDER BY 
            CASE WHEN (COALESCE(P.InvoiceAmount, 0) - COALESCE(P.PaidAmount, 0)) > 0 THEN 0 ELSE 1 END,
            P.InvoiceDate ASC`;
    } else {
        sql += " ORDER BY P.InvoiceDate DESC, P.PurchaseId DESC";
    }

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    const purchases: any[] = [];

    for (const row of rows) {
        let detPayment = `
            SELECT PPD.*
            FROM purchase_payment_details PPD
            WHERE PPD.PurchaseId = ${row.PurchaseId}
        `;
        const [payments]: any = await db.query(detPayment);

        let detProd = `
            SELECT PD.*
            FROM purchase_details PD
            WHERE PD.PurchaseId = ${row.PurchaseId}
        `;
        const [details]: any = await db.query(detProd);

        purchases.push({
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
            purchase_payment_details: payments,
            purchase_details: details
        });
    }
    return purchases;
};

export const getPurchaseCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `
    SELECT COUNT(DISTINCT P.PurchaseId) AS total
    FROM purchases P
    LEFT JOIN suppliers Sup ON P.SupplierId = Sup.SupplierId
    WHERE 1=1
    `;
    const params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            LOWER(P.InvoiceNumber) LIKE LOWER(?)
            OR LOWER(Sup.Name) LIKE LOWER(?)
            OR LOWER(Sup.GstNumber) LIKE LOWER(?)
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(P.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND P.BillType = ? ";
        params.push(billType);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0]?.total ?? 0;
};

export const getPurchaseTotal = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    let sql = `
    SELECT SUM(P.InvoiceAmount) AS totalInvoiceAmount, SUM(P.PaidAmount) AS totalPaidAmount
    FROM purchases P
    LEFT JOIN suppliers Sup ON P.SupplierId = Sup.SupplierId
    WHERE 1=1
    `;
    const params: any[] = [];

    if (search != null && search !== "") {
        sql += ` AND (
            LOWER(P.InvoiceNumber) LIKE LOWER(?)
            OR LOWER(Sup.Name) LIKE LOWER(?)
            OR LOWER(Sup.GstNumber) LIKE LOWER(?)
        ) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        sql += " AND DATE(P.InvoiceDate) BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += " AND P.BillType = ? ";
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

export const getPurchaseById = async (id: number) => {
    let sql = `
    SELECT P.*, Sup.Name AS SupplierName, Sup.GstNumber AS SupplierGstNumber,
           Sup.Address AS SupplierAddress, Sup.State AS SupplierState, Sup.Phone AS SupplierPhone,
           Sup.Mobile AS SupplierMobile, Sup.Agent AS SupplierAgent, Sup.AccountNumber AS SupplierAccountNumber,
           Sup.Bank AS SupplierBank, Sup.IfscCode AS SupplierIfscCode, Sup.Type AS SupplierType
    FROM purchases P
    LEFT JOIN suppliers Sup ON P.SupplierId = Sup.SupplierId
    WHERE P.PurchaseId = ?
    `;
    const [rows]: any = await db.query(sql, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];

    const [products]: any = await db.query("SELECT * FROM purchase_details WHERE PurchaseId = ?", [id]);
    const [payments]: any = await db.query("SELECT * FROM purchase_payment_details WHERE PurchaseId = ?", [id]);

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
        purchase_details: products,
        purchase_payment_details: payments
    };
};

export const deletePurchase = async (id: number) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query("DELETE FROM purchase_details WHERE PurchaseId = ?", [id]);
        await conn.query("DELETE FROM purchase_payment_details WHERE PurchaseId = ?", [id]);
        const [result]: any = await conn.query("DELETE FROM purchases WHERE PurchaseId = ?", [id]);

        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const createPurchase = async (
    invoiceData: any,
    products: any[],
    payments: any[]
) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [purchaseRes]: any = await conn.query(
            `INSERT INTO purchases (
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

        const purchaseId = purchaseRes.insertId;

        for (const p of products) {
            const qty = parseFloat(String(p.quantity || p.Quantity || 0));
            const prc = parseFloat(String(p.price || p.Price || 0));
            await conn.query(
                `INSERT INTO purchase_details (
                    PurchaseId, ItemName, Price, Quantity, Total, QuantityType
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    purchaseId,
                    p.itemName || p.ItemName || null,
                    prc,
                    qty,
                    qty * prc,
                    p.quantityType || p.QuantityType || null
                ]
            );
        }

        for (const pay of payments) {
            if (pay.date && pay.amount) {
                await conn.query(
                    `INSERT INTO purchase_payment_details (
                        PurchaseId, Date, Amount, Type, ReceivedBy
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        purchaseId,
                        pay.date ? new Date(pay.date) : null,
                        pay.amount || null,
                        pay.type || null,
                        pay.to || pay.ReceivedBy || null
                    ]
                );
            }
        }

        await conn.commit();
        return { PurchaseId: purchaseId };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const updatePurchase = async (
    invoiceData: any,
    products: any[],
    payments: any[]
) => {
    const conn = await db.getConnection();
    const purchaseId = Number(invoiceData.PurchaseId);
    try {
        await conn.beginTransaction();

        await conn.query("DELETE FROM purchase_details WHERE PurchaseId = ?", [purchaseId]);
        await conn.query("DELETE FROM purchase_payment_details WHERE PurchaseId = ?", [purchaseId]);

        for (const p of products) {
            const qty = parseFloat(String(p.quantity || p.Quantity || 0));
            const prc = parseFloat(String(p.price || p.Price || 0));
            await conn.query(
                `INSERT INTO purchase_details (
                    PurchaseId, ItemName, Price, Quantity, Total, QuantityType
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    purchaseId,
                    p.itemName || p.ItemName || null,
                    prc,
                    qty,
                    qty * prc,
                    p.quantityType || p.QuantityType || null
                ]
            );
        }

        for (const pay of payments) {
            if (pay.date && pay.amount) {
                await conn.query(
                    `INSERT INTO purchase_payment_details (
                        PurchaseId, Date, Amount, Type, ReceivedBy
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        purchaseId,
                        pay.date ? new Date(pay.date) : null,
                        pay.amount || null,
                        pay.type || null,
                        pay.to || pay.ReceivedBy || null
                    ]
                );
            }
        }

        await conn.query(
            `UPDATE purchases SET
                SupplierId = ?, InvoiceNumber = ?, InvoiceDate = ?, BeforeTax = ?, TaxPercentage = ?,
                Cgst = ?, Sgst = ?, Igst = ?, AfterTax = ?, BillType = ?, RoundOff = ?,
                InvoiceAmount = ?, PaidAmount = ?
             WHERE PurchaseId = ?`,
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
                purchaseId
            ]
        );

        await conn.commit();
        return { PurchaseId: purchaseId };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const updatePurchasePaymentsRepo = async (purchaseId: any, payments: any[]) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();
        const purId = Number(purchaseId);

        await conn.query(
            "DELETE FROM purchase_payment_details WHERE PurchaseId = ?",
            [purId]
        );

        let totalPaid = 0;
        if (payments && payments.length > 0) {
            for (const item of payments) {
                if (item.date && item.date !== 'date') {
                    const amountNum = Number(item.amount || 0);
                    totalPaid += amountNum;
                    await conn.query(
                        `INSERT INTO purchase_payment_details (PurchaseId, Date, Amount, Type, ReceivedBy) VALUES (?, ?, ?, ?, ?)`,
                        [purId, item.date ? new Date(item.date) : null, amountNum, item.type || '', item.to || item.ReceivedBy || '']
                    );
                }
            }
        }

        await conn.query(
            "UPDATE purchases SET PaidAmount = ? WHERE PurchaseId = ?",
            [Number(totalPaid.toFixed(2)), purId]
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

export const processSupplierLumpSumPaymentRepo = async (data: {
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
            SELECT P.PurchaseId, P.InvoiceNumber, P.InvoiceDate, P.InvoiceAmount, P.PaidAmount, P.BillType
            FROM purchases P
            WHERE P.SupplierId = ?
              AND (P.InvoiceAmount - P.PaidAmount) > 0.01
        `;
        const params: any[] = [supId];

        if (data.billType) {
            query += ` AND P.BillType = ?`;
            params.push(data.billType);
        }

        query += ` ORDER BY P.InvoiceDate ASC, P.PurchaseId ASC`;

        const [purchases]: any = await conn.query(query, params);

        if (!purchases || purchases.length === 0) {
            await conn.rollback();
            return {
                success: false,
                message: "No pending unpaid purchase bills found for this supplier."
            };
        }

        const allocatedPurchases: any[] = [];
        let totalAllocated = 0;

        for (const pur of purchases) {
            if (lumpSumRemaining <= 0.001) break;

            const invAmount = Number(pur.InvoiceAmount || 0);
            const paidAmount = Number(pur.PaidAmount || 0);
            const pendingBalance = Math.max(0, invAmount - paidAmount);

            if (pendingBalance <= 0.001) continue;

            const payForThisPur = Math.min(lumpSumRemaining, pendingBalance);
            const newPaidTotal = Number((paidAmount + payForThisPur).toFixed(2));

            await conn.query(
                `INSERT INTO purchase_payment_details (PurchaseId, Date, Amount, Type, ReceivedBy) VALUES (?, ?, ?, ?, ?)`,
                [pur.PurchaseId, pDate ? new Date(pDate) : null, Number(payForThisPur.toFixed(2)), pType, pTo]
            );

            await conn.query(
                `UPDATE purchases SET PaidAmount = ? WHERE PurchaseId = ?`,
                [newPaidTotal, pur.PurchaseId]
            );

            lumpSumRemaining = Number((lumpSumRemaining - payForThisPur).toFixed(2));
            totalAllocated += payForThisPur;

            allocatedPurchases.push({
                PurchaseId: pur.PurchaseId,
                InvoiceNumber: pur.InvoiceNumber,
                InvoiceDate: pur.InvoiceDate,
                PaidAmount: Number(payForThisPur.toFixed(2)),
                RemainingBalance: Number(Math.max(0, invAmount - newPaidTotal).toFixed(2))
            });
        }

        await conn.commit();

        return {
            success: true,
            totalAllocated: Number(totalAllocated.toFixed(2)),
            excessRemaining: Number(lumpSumRemaining.toFixed(2)),
            allocatedCount: allocatedPurchases.length,
            allocatedInvoices: allocatedPurchases
        };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

