import db from '../config/db';

export const getSalseDetails = async (
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `SELECT SUM(I.InvoiceAmount) AS totalInvoiceAmount, SUM(I.ReceivedAmount) AS totalPaidAmount, SUM(I.InvoiceAmount - I.ReceivedAmount) AS totalPendingAmount FROM invoice I WHERE (IsCancel = 0 OR IsCancel IS NULL)`;
    let params: any[] = [];

    if (startDate && endDate) {
        sql += ` AND I.InvoiceDate >= ? AND I.InvoiceDate <= ?`;
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += ` AND I.BillType = ?`;
        params.push(billType);
    }

    const [rows]: any = await db.query(sql, params);
    return rows?.[0] || [];
};

export const getYarnSalesDetails = async (
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `SELECT SUM(Y.InvoiceAmount) AS totalInvoiceAmount, SUM(Y.PaidAmount) AS totalPaidAmount, SUM(Y.InvoiceAmount - Y.PaidAmount) AS totalPendingAmount FROM Yarns Y WHERE 1=1`;
    let params: any[] = [];

    if (startDate && endDate) {
        sql += ` AND Y.InvoiceDate >= ? AND Y.InvoiceDate <= ?`;
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += ` AND Y.BillType = ?`;
        params.push(billType);
    }

    const [rows]: any = await db.query(sql, params);
    return rows?.[0] || [];
};

export const getSalesChartDetails = async (
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `SELECT 
    DATE_FORMAT(InvoiceDate, '%b%Y') AS month,
    DATE_FORMAT(InvoiceDate, '%Y-%m-1') AS date,
    COUNT(InvoiceId) AS totalCount,
    ROUND(COALESCE(SUM(InvoiceAmount), 0), 2) AS totalSales,
    ROUND(COALESCE(SUM(ReceivedAmount), 0), 2) AS totalReceived
    FROM invoice I
    WHERE (IsCancel = 0 OR IsCancel IS NULL)`;
    let params: any[] = [];

    if (startDate && endDate) {
        sql += ` AND I.InvoiceDate >= ? AND I.InvoiceDate <= ?`;
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += ` AND BillType = ?`;
        params.push(billType);
    }

    sql += ` GROUP BY DATE_FORMAT(InvoiceDate, '%b%Y'), DATE_FORMAT(InvoiceDate, '%Y-%m-1') ORDER BY date ASC`;

    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getYarnChartDetails = async (
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `SELECT 
    DATE_FORMAT(InvoiceDate, '%b%Y') AS month,
    DATE_FORMAT(InvoiceDate, '%Y-%m-1') AS date,
    COUNT(YarnId) AS totalCount,
    ROUND(COALESCE(SUM(InvoiceAmount), 0), 2) AS totalPurchase,
    ROUND(COALESCE(SUM(PaidAmount), 0), 2) AS totalPaid
    FROM Yarns Y
    WHERE 1=1`;
    let params: any[] = [];

    if (startDate && endDate) {
        sql += ` AND Y.InvoiceDate >= ? AND Y.InvoiceDate <= ?`;
        params.push(startDate, endDate);
    }

    if (billType) {
        sql += ` AND BillType = ?`;
        params.push(billType);
    }

    sql += ` GROUP BY DATE_FORMAT(InvoiceDate, '%b%Y'), DATE_FORMAT(InvoiceDate, '%Y-%m-1') ORDER BY date ASC`;

    const [rows]: any = await db.query(sql, params);
    return rows;
};

