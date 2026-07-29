import db from '../config/db';

export const getCustomers = async (
    search: string,
    page: number | null,
    limit: number | null,
    orderBy: string | null,
    startDate: string | null,
    endDate: string | null
) => {
    let sql = "";
    let params: any[] = [];
    sql = `SELECT SUM(IF(I.IsCancel = 1, 0, I.InvoiceAmount) - I.ReceivedAmount) as pending, C.* FROM customers C
    LEFT JOIN invoice I ON I.CustomerId = C.CustomerId `;

    if (startDate && endDate) {
        sql += ` AND I.InvoiceDate >= ? AND I.InvoiceDate <= ? `;
        params.push(startDate, endDate);
    }

    if (search != "") {
        sql += `
        WHERE (
            LOWER(C.CustomerName) LIKE LOWER(?)
            OR LOWER(C.GstNumber) LIKE LOWER(?)
            OR LOWER(C.Agent) LIKE LOWER(?)
            OR LOWER(C.State) LIKE LOWER(?)
        )
    `;

        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }

    sql += ' GROUP BY C.CustomerId';
    if (orderBy !== "pending") {
        sql += " ORDER BY CustomerName ASC";
    } else {
        sql += " ORDER BY pending DESC";
    }

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const customerPendingPayment = async (
    search: string,
    startDate: string | null,
    endDate: string | null
) => {
    let sql = `SELECT SUM(IF(I.IsCancel = 1, 0, I.InvoiceAmount) - I.ReceivedAmount) as pending FROM customers C
                LEFT JOIN invoice I ON I.CustomerId = C.CustomerId `;
    let params: any[] = [];

    if (startDate && endDate) {
        sql += ` AND I.InvoiceDate >= ? AND I.InvoiceDate <= ? `;
        params.push(startDate, endDate);
    }

    if (search != "") {
        sql += `
        WHERE (
            LOWER(C.CustomerName) LIKE LOWER(?)
            OR LOWER(C.GstNumber) LIKE LOWER(?)
            OR LOWER(C.Agent) LIKE LOWER(?)
            OR LOWER(C.State) LIKE LOWER(?)
        )
    `;

        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0]?.pending;
};

export const customerProducts = async (CustomerId: any, ProductId: any, FoldType: any) => {
    const params: any[] = [];
    
    params.push(Number(CustomerId)); // For C.CustomerId = ?
    params.push(Number(CustomerId)); // For I.CustomerId = ? in LPP

    let foldTypeFilter = '';
    if (FoldType) {
        foldTypeFilter = 'AND ID.Type = ?';
        params.push(FoldType);
    }

    params.push(Number(CustomerId)); // For I.CustomerId = ? in IST

    let productIdFilter = '';
    if (ProductId) {
        productIdFilter = 'AND P.Id = ?';
        params.push(Number(ProductId));
    }

    const queryData = `SELECT 
        P.Id, 
        P.Name, 
        P.HSNCode, 
        P.Type,
        C.ProductCode,
        LPP.Price AS ProductPrice,
        LPP.Type as PurchaseType,
        IST.ProductSoldQuantity
    FROM products P
    LEFT JOIN customer_product_code C 
        ON P.Id = C.ProductId AND C.CustomerId = ?
    LEFT JOIN (
        SELECT ItemId, Type, Price
        FROM (
            SELECT ID.ItemId, ID.Type, ID.Price,
                   ROW_NUMBER() OVER (PARTITION BY ID.ItemId ORDER BY I.InvoiceDate DESC, I.InvoiceId DESC) as rn
            FROM invoice I 
            JOIN invoice_details ID ON I.InvoiceId = ID.InvoiceId
            WHERE I.CustomerId = ? AND (I.IsCancel = 0 OR I.IsCancel IS NULL) ${foldTypeFilter}
        ) t
        WHERE rn = 1
    ) LPP ON P.Id = LPP.ItemId

    LEFT JOIN (
        SELECT ItemId, SUM(Quantity) AS ProductSoldQuantity
        FROM invoice I 
        JOIN invoice_details ID ON I.InvoiceId = ID.InvoiceId
        WHERE I.CustomerId = ? AND (I.IsCancel = 0 OR I.IsCancel IS NULL)
        GROUP BY ID.ItemId
    ) IST ON P.Id = IST.ItemId
    WHERE 1=1 ${productIdFilter}
    ORDER BY ProductSoldQuantity DESC`;

    const [rows]: any = await db.query(queryData, params);
    return rows;
};

export const getCustomerCount = async (search: string) => {
    let sql = "SELECT COUNT(*) as total FROM customers";
    let params: any[] = [];

    if (search) {
        sql += " WHERE CustomerName LIKE ?";
        params.push(`%${search}%`);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0].total;
};

export const getCustomerById = async (id: any) => {
    const [rows]: any = await db.query(
        "SELECT * FROM customers WHERE CustomerId = ?",
        [id]
    );

    return rows[0];
};

export const createCustomer = async (customerData: any) => {
    const [result]: any = await db.query(
        "INSERT INTO customers (CustomerName, GstNumber, Address, Address2, State, Phone, Mobile, Agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [customerData.CustomerName, customerData.GstNumber, customerData.Address, customerData.Address2, customerData.State, customerData.Phone, customerData.Mobile, customerData.Agent]
    );

    return result;
};

export const updateCustomer = async (customerData: any) => {
    const [result]: any = await db.query(
        "UPDATE customers SET CustomerName=?, GstNumber=?, Address=?, Address2=?, State=?, Phone=?, Mobile=?, Agent=? WHERE CustomerId=?",
        [customerData.CustomerName, customerData.GstNumber, customerData.Address, customerData.Address2, customerData.State, customerData.Phone, customerData.Mobile, customerData.Agent, customerData.CustomerId]
    );

    return result;
};

export const updateCustomerProduct = async (CustomerData: any) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        await conn.query(
            "DELETE FROM customer_product_code WHERE CustomerId = ?",
            [CustomerData.CustomerId]
        );

        for (const item of CustomerData.Products) {
            await conn.query(
                "INSERT INTO customer_product_code (CustomerId, ProductId, ProductCode) VALUES (?, ?, ?)",
                [CustomerData.CustomerId, item.id, item.code]
            );
        }

        await conn.commit();
        return true;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const deleteCustomer = async (id: any) => {
    const [result]: any = await db.query(
        "DELETE FROM customers WHERE CustomerId=?",
        [id]
    );

    return result;
};
