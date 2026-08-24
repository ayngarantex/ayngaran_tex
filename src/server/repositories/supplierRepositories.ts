import db from '../config/db';

export const getSuppliers = async (
    search: string | null,
    type: string | null,
    page: number | null,
    limit: number | null,
    orderBy: string | null
) => {
    let sql = `
        SELECT S.*, S.Address AS Adress,
               CASE 
                   WHEN S.Type = 'Sizing' THEN
                       COALESCE((
                           SELECT SUM(COALESCE(Siz.InvoiceAmount, 0) - COALESCE(Siz.ReceivedAmount, 0))
                           FROM sizing Siz
                           WHERE Siz.SupplierId = S.SupplierId
                       ), 0)
                   ELSE
                       COALESCE((
                           SELECT SUM(COALESCE(Y.InvoiceAmount, 0) - COALESCE(Y.PaidAmount, 0))
                           FROM yarns Y
                           WHERE Y.SupplierId = S.SupplierId
                       ), 0)
               END AS pendingAmount
        FROM suppliers S
        WHERE 1=1
    `;
    let params: any[] = [];

    if (search != null && search !== "") {
        sql += " AND (LOWER(S.Name) LIKE LOWER(?) OR LOWER(S.GstNumber) LIKE LOWER(?) OR LOWER(S.State) LIKE LOWER(?) OR LOWER(S.Agent) LIKE LOWER(?))";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type != null && type !== "" && type !== "All") {
        sql += " AND S.Type = ?";
        params.push(type);
    }

    if (orderBy === 'pending') {
        sql += " ORDER BY pendingAmount DESC, S.Name ASC";
    } else {
        sql += " ORDER BY S.Name ASC";
    }

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getSupplierCount = async (search: string | null, type: string | null) => {
    let sql = "SELECT COUNT(*) AS total FROM suppliers S WHERE 1=1";
    let params: any[] = [];

    if (search != null && search !== "") {
        sql += " AND (LOWER(S.Name) LIKE LOWER(?) OR LOWER(S.GstNumber) LIKE LOWER(?) OR LOWER(S.State) LIKE LOWER(?) OR LOWER(S.Agent) LIKE LOWER(?))";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type != null && type !== "" && type !== "All") {
        sql += " AND S.Type = ?";
        params.push(type);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0]?.total || 0;
};

export const getSupplierById = async (id: number) => {
    const sql = "SELECT *, Address AS Adress FROM suppliers WHERE SupplierId = ?";
    const [rows]: any = await db.query(sql, [id]);
    return rows[0] || null;
};

export const createSupplier = async (supplierData: any) => {
    const sql = `
        INSERT INTO suppliers (
            Name, Type, AccountNumber, Bank, IfscCode, State, Phone, Mobile, Address, GstNumber, Agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        supplierData.Name || null,
        supplierData.Type || null,
        supplierData.AccountNumber || null,
        supplierData.Bank || null,
        supplierData.IfscCode || null,
        supplierData.State || null,
        supplierData.Phone || null,
        supplierData.Mobile || null,
        supplierData.Address || null,
        supplierData.GstNumber || null,
        supplierData.Agent || null
    ];
    const [result]: any = await db.query(sql, params);
    const supplierId = result.insertId;
    return { SupplierId: supplierId, ...supplierData };
};

export const updateSupplier = async (supplierData: any) => {
    const sql = `
        UPDATE suppliers SET
            Name = ?,
            Type = ?,
            AccountNumber = ?,
            Bank = ?,
            IfscCode = ?,
            State = ?,
            Phone = ?,
            Mobile = ?,
            Address = ?,
            GstNumber = ?,
            Agent = ?
        WHERE SupplierId = ?
    `;
    const params = [
        supplierData.Name || null,
        supplierData.Type || null,
        supplierData.AccountNumber || null,
        supplierData.Bank || null,
        supplierData.IfscCode || null,
        supplierData.State || null,
        supplierData.Phone || null,
        supplierData.Mobile || null,
        supplierData.Address || null,
        supplierData.GstNumber || null,
        supplierData.Agent || null,
        Number(supplierData.SupplierId)
    ];
    await db.query(sql, params);
    return supplierData;
};

export const deleteSupplier = async (id: number) => {
    const sql = "DELETE FROM suppliers WHERE SupplierId = ?";
    const [result]: any = await db.query(sql, [id]);
    return result;
};

export const getYarnBySupplierId = async (
    supplierId: number,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = "SELECT * FROM yarns WHERE SupplierId = ?";
    const params: any[] = [supplierId];
    if (startDate && endDate) {
        sql += " AND DATE(InvoiceDate) BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }
    if (billType) {
        sql += " AND BillType = ?";
        params.push(billType);
    }
    sql += " ORDER BY InvoiceDate ASC, YarnId ASC";
    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getYarnPaymentsBySupplierId = async (
    supplierId: number,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `
        SELECT YPD.*, Y.InvoiceNumber, Y.BillType
        FROM yarn_payment_details YPD
        JOIN yarns Y ON YPD.YarnId = Y.YarnId
        WHERE Y.SupplierId = ?
    `;
    const params: any[] = [supplierId];
    if (startDate && endDate) {
        sql += " AND DATE(Y.InvoiceDate) BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }
    if (billType) {
        sql += " AND Y.BillType = ?";
        params.push(billType);
    }
    sql += " ORDER BY YPD.Date ASC";
    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getSizingBySupplierId = async (
    supplierId: number,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = "SELECT * FROM sizing WHERE SupplierId = ?";
    const params: any[] = [supplierId];
    if (startDate && endDate) {
        sql += " AND DATE(InvoiceDate) BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }
    if (billType) {
        sql += " AND BillType = ?";
        params.push(billType);
    }
    sql += " ORDER BY InvoiceDate ASC, SizingId ASC";
    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getSizingPaymentsBySupplierId = async (
    supplierId: number,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    let sql = `
        SELECT SPD.*, S.InvoiceNumber, S.BillType
        FROM sizing_payment_details SPD
        JOIN sizing S ON SPD.SizingId = S.SizingId
        WHERE S.SupplierId = ?
    `;
    const params: any[] = [supplierId];
    if (startDate && endDate) {
        sql += " AND DATE(S.InvoiceDate) BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }
    if (billType) {
        sql += " AND S.BillType = ?";
        params.push(billType);
    }
    sql += " ORDER BY SPD.Date ASC";
    const [rows]: any = await db.query(sql, params);
    return rows;
};

