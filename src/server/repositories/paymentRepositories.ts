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
