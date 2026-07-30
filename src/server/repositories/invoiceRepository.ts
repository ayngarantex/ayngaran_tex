// src/server/repositories/invoiceRepository.ts
import pool from '@/server/config/db';

export interface Invoice {
  InvoiceId: number;
  InvoiceNumber: string;
  InvoiceDate: Date;
  InvoiceAmount: number;
  ReceivedAmount: number;
  BillType: string;
  // add other fields as needed
}

/** Fetch paginated invoices with optional filters */
export const getInvoices = async (
  query: string | null,
  currentPage: number,
  startDate: string | null,
  endDate: string | null,
  billType: string | null,
  orderBy: string | null,
  itemsPerPage: number = 20
): Promise<Invoice[]> => {
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (startDate && endDate) {
    whereClauses.push('InvoiceDate BETWEEN ? AND ?');
    params.push(new Date(startDate), new Date(endDate));
  }

  if (billType) {
    whereClauses.push('BillType = ?');
    params.push(billType);
  }

  if (query) {
    const q = `%${query}%`;
    whereClauses.push('(LOWER(InvoiceNumber) LIKE ? OR LOWER(InvoiceType) LIKE ? OR LOWER(InvoiceAmount) LIKE ?)');
    params.push(q, q, q);
  }

  const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';
  const offset = (currentPage - 1) * itemsPerPage;

  const sql = `
    SELECT * FROM invoice
    ${whereSql}
    ORDER BY InvoiceDate DESC, InvoiceId DESC
    LIMIT ? OFFSET ?
  `;
  params.push(itemsPerPage, offset);

  const [rows]: any = await pool.query(sql, params);
  return rows as Invoice[];
};

/** Fetch a single invoice by id (including related data placeholders) */
export const getInvoiceById = async (id: number): Promise<any> => {
  const sql = `
    SELECT i.*, c.* FROM invoice i
    LEFT JOIN customers c ON i.CustomerId = c.CustomerId
    WHERE i.InvoiceId = ?
  `;
  const [rows]: any = await pool.query(sql, [id]);
  return rows[0] || null;
};

/** Count total invoices matching optional filters */
// export const countInvoices = async (
//   query: string | null,
//   startDate: string | null,
//   endDate: string | null,
//   billType: string | null 
// ): Promise<number> => {
//   const params: any[] = [];
//   const whereClauses: string[] = [];

//   if (startDate && endDate) {
//     whereClauses.push('InvoiceDate BETWEEN ? AND ?');
//     params.push(new Date(startDate), new Date(endDate));
//   }

//   if (billType) {
//     whereClauses.push('BillType = ?');
//     params.push(billType);
//   }

//   if (query) {
//     const q = `%${query}%`;
//     whereClauses.push('(InvoiceNumber LIKE ? OR InvoiceType LIKE ?)');
//     params.push(q, q);
//   }

//   const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';
//   const sql = `SELECT COUNT(*) as total FROM invoice ${whereSql}`;
//   const [rows]: any = await pool.query(sql, params);
//   return rows[0]?.total ?? 0;
// };

/** Aggregate totals for invoices */
export const getInvoiceTotals = async (
  query: string | null,
  startDate: string | null,
  endDate: string | null,
  billType: string | null
): Promise<{ totalInvoiceAmount: number; totalReceived: number; balance: number }> => {
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (startDate && endDate) {
    whereClauses.push('InvoiceDate BETWEEN ? AND ?');
    params.push(new Date(startDate), new Date(endDate));
  }

  if (billType) {
    whereClauses.push('BillType = ?');
    params.push(billType);
  }

  if (query) {
    const q = `%${query}%`;
    whereClauses.push('(LOWER(InvoiceNumber) LIKE ? OR LOWER(InvoiceType) LIKE ?)');
    params.push(q, q);
  }

  const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';
  const sql = `
    SELECT
      SUM(InvoiceAmount) as totalInvoiceAmount,
      SUM(ReceivedAmount) as totalReceived
    FROM invoice
    ${whereSql}
  `;
  const [rows]: any = await pool.query(sql, params);
  const totalInvoiceAmount = rows[0]?.totalInvoiceAmount ?? 0;
  const totalReceived = rows[0]?.totalReceived ?? 0;
  const balance = totalInvoiceAmount - totalReceived;
  return { totalInvoiceAmount, totalReceived, balance };
};
