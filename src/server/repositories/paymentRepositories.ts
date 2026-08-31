import db from '../config/db';

export const getPayments = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null
) => {
    let sql = "";
    let params: any[] = [];
    sql = `SELECT SUM(PD.Amount) as PaymentAmount, PD.Date as PaymentDate, C.CustomerName, GROUP_CONCAT(
            CASE WHEN I.BillType = 'gst' 
                THEN CONCAT(
                    CASE 
                        WHEN MONTH(I.InvoiceDate) >= 4 
                        THEN CONCAT(DATE_FORMAT(I.InvoiceDate, '%y'), '-', LPAD(MOD(YEAR(I.InvoiceDate) + 1, 100), 2, '0'))
                        ELSE CONCAT(LPAD(MOD(YEAR(I.InvoiceDate) - 1, 100), 2, '0'), '-', DATE_FORMAT(I.InvoiceDate, '%y'))
                    END,
                    ' /AT/ ',
                    I.InvoiceNumber
                )
                ELSE CONCAT('S-DC / ', I.InvoiceNumber)
            END 
            SEPARATOR ','
            ) as InvoiceNumber, I.BillType FROM payment_details PD
            JOIN invoice I ON PD.InvoiceId = I.InvoiceId
            JOIN customers C ON I.CustomerId = C.CustomerId`;
    if (search != null && search != "") {
        sql += `
        WHERE (
            LOWER(C.CustomerName) LIKE ?
            OR LOWER(C.GstNumber) LIKE ?
            OR LOWER(C.Agent) LIKE ?
            OR LOWER(C.State) LIKE ?
        )
    `;

        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }

    if (startDate && endDate) {
        sql += `
            AND PD.Date >= ? AND PD.Date <= ?
        `;

        params.push(startDate, endDate);
    }

    sql += ' GROUP BY PD.Date, C.CustomerId, I.BillType ORDER BY PD.Date DESC';

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getPaymentCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null
) => {
    let sql = `
        SELECT COUNT(*) as total
        FROM payment_details PD
        JOIN invoice I ON PD.InvoiceId = I.InvoiceId
        JOIN customers C ON I.CustomerId = C.CustomerId
    `;

    let params: any[] = [];
    let conditions: string[] = [];

    if (search != null && search != "") {
        conditions.push(`
            (
                LOWER(C.CustomerName) LIKE ?
                OR LOWER(C.GstNumber) LIKE ?
                OR LOWER(C.Agent) LIKE ?
                OR LOWER(C.State) LIKE ?
            )
        `);

        params.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        );
    }

    if (startDate && endDate) {
        conditions.push(`PD.Date BETWEEN ? AND ?`);
        params.push(startDate, endDate);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ' GROUP BY I.BillType, PD.Date, C.CustomerId ORDER BY PD.Date DESC';

    const [rows]: any = await db.query(sql, params);
    return rows.length;
};

export const getSizingPayments = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null
) => {
    let sql = `
        SELECT SPD.Date, SUM(SPD.Amount) as PaymentAmount, SPD.Date as PaymentDate, SU.Name as CustomerName, S.BillType, GROUP_CONCAT(S.InvoiceNumber SEPARATOR ', ') AS InvoiceNumber
        FROM sizing_payment_details SPD
        JOIN sizing S ON SPD.SizingId = S.SizingId
        JOIN suppliers SU ON S.SupplierId = SU.SupplierId
    `;
    let params: any[] = [];
    let conditions: string[] = [];

    if (search != null && search != "") {
        conditions.push(`(
            LOWER(SU.Name) LIKE ?
            OR LOWER(S.InvoiceNumber) LIKE ?
        )`);
        params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        conditions.push(`SPD.Date >= ? AND SPD.Date <= ?`);
        params.push(startDate, endDate);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ' GROUP BY SPD.Date, SU.SupplierId, S.BillType ORDER BY SPD.Date DESC';

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getSizingPaymentCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null
) => {
    let sql = `
        SELECT COUNT(*) as total
        FROM sizing_payment_details SPD
        JOIN sizing S ON SPD.SizingId = S.SizingId
        JOIN suppliers SU ON S.SupplierId = SU.SupplierId
    `;
    let params: any[] = [];
    let conditions: string[] = [];

    if (search != null && search != "") {
        conditions.push(`(
            LOWER(SU.Name) LIKE ?
            OR LOWER(S.InvoiceNumber) LIKE ?
        )`);
        params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        conditions.push(`SPD.Date >= ? AND SPD.Date <= ?`);
        params.push(startDate, endDate);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(" AND ");
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0]?.total || 0;
};

export const getYarnPayments = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null
) => {
    let sql = `
        SELECT YPD.Date, SUM(YPD.Amount) as PaymentAmount, YPD.Date as PaymentDate, GROUP_CONCAT(Y.InvoiceNumber SEPARATOR ', ') AS InvoiceNumber, SU.Name as CustomerName, Y.BillType 
        FROM yarn_payment_details YPD
        JOIN yarns Y ON YPD.YarnId = Y.YarnId
        JOIN suppliers SU ON Y.SupplierId = SU.SupplierId
    `;
    let params: any[] = [];
    let conditions: string[] = [];

    if (search != null && search != "") {
        conditions.push(`(
            LOWER(SU.Name) LIKE ?
            OR LOWER(Y.InvoiceNumber) LIKE ?
        )`);
        params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        conditions.push(`YPD.Date >= ? AND YPD.Date <= ?`);
        params.push(startDate, endDate);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ' GROUP BY YPD.Date, SU.SupplierId, Y.BillType ORDER BY YPD.Date DESC';

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getYarnPaymentCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null
) => {
    let sql = `
        SELECT COUNT(*) as total
        FROM yarn_payment_details YPD
        JOIN yarns Y ON YPD.YarnId = Y.YarnId
        JOIN suppliers SU ON Y.SupplierId = SU.SupplierId
    `;
    let params: any[] = [];
    let conditions: string[] = [];

    if (search != null && search != "") {
        conditions.push(`(
            LOWER(SU.Name) LIKE ?
            OR LOWER(Y.InvoiceNumber) LIKE ?
        )`);
        params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
        conditions.push(`YPD.Date >= ? AND YPD.Date <= ?`);
        params.push(startDate, endDate);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(" AND ");
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0]?.total || 0;
};
