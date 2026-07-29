import db from '../config/db';

// AND I.InvoiceNumber LIKE '%ref%'
export const getProducts = async (search: string | null, page: number | null, limit: number | null) => {
    let sql = `
        SELECT P.*, 
               CAST(COALESCE(SUM(S.Quantity), 0) AS SIGNED) AS TotalStock,
               COALESCE((
                   SELECT CAST(COALESCE(SUM(ID.Quantity), 0) AS SIGNED)
                   FROM invoice_details ID
                   JOIN invoice I ON ID.InvoiceId = I.InvoiceId AND I.InvoiceNumber NOT LIKE '%ref%'
                   WHERE ID.ItemId = P.Id AND (I.IsCancel IS NULL OR I.IsCancel = 0)
               ), 0) AS SoldCount,
               CAST(COALESCE(SUM(S.Quantity), 0) AS SIGNED) - COALESCE((
                   SELECT CAST(COALESCE(SUM(ID.Quantity), 0) AS SIGNED)
                   FROM invoice_details ID
                   JOIN invoice I ON ID.InvoiceId = I.InvoiceId AND I.InvoiceNumber NOT LIKE '%ref%'
                   WHERE ID.ItemId = P.Id AND (I.IsCancel IS NULL OR I.IsCancel = 0)
               ), 0) AS AvailableStock
        FROM products P 
        LEFT JOIN product_stocks S ON P.Id = S.ProductId
    `;
    let params: any[] = [];

    if (search != null && search != "") {
        sql += ` WHERE P.Name LIKE ? OR P.Type LIKE ? OR P.HSNCode LIKE ? OR P.Tags LIKE ? OR P.Description LIKE ? OR P.Details LIKE ? OR P.Size LIKE ? OR P.Composition LIKE ? OR P.WashCare LIKE ?`;
        for (let i = 0; i < 9; i++) {
            params.push(`%${search}%`);
        }
    }

    sql += " GROUP BY P.Id ORDER BY AvailableStock DESC";

    if (page && limit) {
        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push((page - 1) * limit);
    }

    const [rows]: any = await db.query(sql, params);
    return rows;
};

export const getProductCount = async (search: string | null) => {
    let sql = "SELECT COUNT(*) as total FROM products";
    let params: any[] = [];

    if (search) {
        sql += " WHERE Name LIKE ?";
        params.push(`%${search}%`);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0].total;
};

export const getProductById = async (id: any) => {
    const [rows]: any = await db.query(
        `SELECT P.*, 
                CAST(COALESCE(SUM(S.Quantity), 0) AS SIGNED) AS TotalStock,
                COALESCE((
                    SELECT CAST(COALESCE(SUM(ID.Quantity), 0) AS SIGNED)
                    FROM invoice_details ID
                    JOIN invoice I ON ID.InvoiceId = I.InvoiceId AND I.InvoiceNumber NOT LIKE '%ref%'
                    WHERE ID.ItemId = P.Id AND (I.IsCancel IS NULL OR I.IsCancel = 0)
                ), 0) AS SoldCount,
                CAST(COALESCE(SUM(S.Quantity), 0) AS SIGNED) - COALESCE((
                    SELECT CAST(COALESCE(SUM(ID.Quantity), 0) AS SIGNED)
                    FROM invoice_details ID
                    JOIN invoice I ON ID.InvoiceId = I.InvoiceId AND I.InvoiceNumber NOT LIKE '%ref%'
                    WHERE ID.ItemId = P.Id AND (I.IsCancel IS NULL OR I.IsCancel = 0)
                ), 0) AS AvailableStock
         FROM products P 
         LEFT JOIN product_stocks S ON P.Id = S.ProductId 
         WHERE P.Id = ? 
         GROUP BY P.Id`,
        [id]
    );

    return rows[0];
};

export const createProduct = async (
    name: string,
    type: string | null,
    hsncode: string | null,
    image: string | null,
    tags: string | null,
    description: string | null,
    details: string | null,
    size: string | null,
    composition: string | null,
    washcare: string | null
) => {
    const [result]: any = await db.query(
        "INSERT INTO products (Name, Type, HSNCode, Image, Tags, Description, Details, Size, Composition, WashCare) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, type, hsncode, image, tags, description, details, size, composition, washcare]
    );

    return result;
};

export const updateProduct = async (
    id: any,
    name: string,
    type: string | null,
    hsncode: string | null,
    image: string | null,
    tags: string | null,
    description: string | null,
    details: string | null,
    size: string | null,
    composition: string | null,
    washcare: string | null
) => {
    const [result]: any = await db.query(
        "UPDATE products SET Name=?, Type=?, HSNCode=?, Image=?, Tags=?, Description=?, Details=?, Size=?, Composition=?, WashCare=? WHERE Id=?",
        [name, type, hsncode, image, tags, description, details, size, composition, washcare, id]
    );

    return result;
};

export const deleteProduct = async (id: any) => {
    const [result]: any = await db.query(
        "DELETE FROM products WHERE Id=?",
        [id]
    );

    return result;
};

export const getProductTotals = async (search: string | null, productId: string | null) => {

    let sql = `
        SELECT 
            CAST(COALESCE(SUM(TotalStock), 0) AS SIGNED) AS TotalStock,
            CAST(COALESCE(SUM(SoldCount), 0) AS SIGNED) AS SoldCount,
            CAST(COALESCE(SUM(AvailableStock), 0) AS SIGNED) AS AvailableStock
        FROM (
            SELECT P.Id,
                   CAST(COALESCE(SUM(S.Quantity), 0) AS SIGNED) AS TotalStock,
                   COALESCE((
                       SELECT CAST(COALESCE(SUM(ID.Quantity), 0) AS SIGNED)
                       FROM invoice_details ID
                       JOIN invoice I ON ID.InvoiceId = I.InvoiceId AND I.InvoiceNumber NOT LIKE '%ref%'
                       WHERE ID.ItemId = P.Id AND (I.IsCancel IS NULL OR I.IsCancel = 0)
                   ), 0) AS SoldCount,
                   CAST(COALESCE(SUM(S.Quantity), 0) AS SIGNED) - COALESCE((
                       SELECT CAST(COALESCE(SUM(ID.Quantity), 0) AS SIGNED)
                       FROM invoice_details ID
                       JOIN invoice I ON ID.InvoiceId = I.InvoiceId AND I.InvoiceNumber NOT LIKE '%ref%'
                       WHERE ID.ItemId = P.Id AND (I.IsCancel IS NULL OR I.IsCancel = 0)
                   ), 0) AS AvailableStock
            FROM products P 
            LEFT JOIN product_stocks S ON P.Id = S.ProductId      
            WHERE (P.HSNCode IS NULL OR P.HSNCode != '5206')
    `;
    let params: any[] = [];
    if (productId != "" && productId != null) {
        sql += ` AND P.Id = ?`;
        params.push(productId);
    }
    if (search != null && search != "") {
        sql += ` AND (P.Name LIKE ? OR P.Type LIKE ? OR P.HSNCode LIKE ? OR P.Tags LIKE ? OR P.Description LIKE ? OR P.Details LIKE ? OR P.Size LIKE ? OR P.Composition LIKE ? OR P.WashCare LIKE ?)`;
        for (let i = 0; i < 9; i++) {
            params.push(`%${search}%`);
        }
    }
    sql += " GROUP BY P.Id) AS ProductStats";

    const [rows]: any = await db.query(sql, params);
    return rows[0] || { TotalStock: 0, SoldCount: 0, AvailableStock: 0 };
};
