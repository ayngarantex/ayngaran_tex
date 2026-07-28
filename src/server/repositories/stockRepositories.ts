import db from '../config/db';

export const getStockEntriesByProductId = async (productId: number) => {
    const [rows]: any = await db.query(
        `SELECT s.*, p.Name as ProductName
         FROM product_stocks s 
         LEFT JOIN products p ON s.ProductId = p.Id 
         WHERE s.ProductId = ? 
         ORDER BY s.EntryDate DESC, s.Id DESC`,
        [productId]
    );
    return rows;
};

export const getAllStockEntries = async () => {
    const [rows]: any = await db.query(
        `SELECT s.*, p.Name as ProductName 
         FROM product_stocks s 
         LEFT JOIN products p ON s.ProductId = p.Id 
         ORDER BY s.EntryDate DESC, s.Id DESC`
    );
    return rows;
};

export const getStockEntryById = async (id: number) => {
    const [rows]: any = await db.query(
        "SELECT * FROM product_stocks WHERE Id = ?",
        [id]
    );
    return rows[0];
};

export const createStockEntry = async (
    productId: number,
    quantity: number,
    entryDate: string,
    notes: string | null
) => {
    const [result]: any = await db.query(
        "INSERT INTO product_stocks (ProductId, Quantity, EntryDate, Notes) VALUES (?, ?, ?, ?)",
        [productId, quantity, entryDate, notes]
    );
    return result;
};

export const updateStockEntry = async (
    id: number,
    quantity: number,
    entryDate: string,
    notes: string | null
) => {
    const [result]: any = await db.query(
        "UPDATE product_stocks SET Quantity = ?, EntryDate = ?, Notes = ? WHERE Id = ?",
        [quantity, entryDate, notes, id]
    );
    return result;
};

export const deleteStockEntry = async (id: number) => {
    const [result]: any = await db.query(
        "DELETE FROM product_stocks WHERE Id = ?",
        [id]
    );
    return result;
};
