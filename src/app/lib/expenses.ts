import db from '@/server/config/db';

const ITEMS_PER_PAGE = 20;

export const fetchExpensesPage = async (query: string, startDate: string, endDate: string) => {
  try {
    let sql = `SELECT COUNT(*) AS count FROM expenses WHERE 1=1`;
    let params: any[] = [];

    if (startDate && endDate) {
      sql += ` AND Date >= ? AND Date <= ?`;
      params.push(startDate, endDate);
    }

    if (query) {
      sql += ` AND (LOWER(Reason) LIKE ? OR LOWER(Type) LIKE ?)`;
      params.push(`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`);
    }

    const [rows]: any = await db.query(sql, params);
    const count = Number(rows[0]?.count || 0);
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    return {
      count,
      totalPages
    };
  } catch (error) {
    return { count: 0, totalPages: 0 };
  }
};

export const fetchExpenses = async (query: string, currentPage: number, startDate: string, endDate: string) => {
  try {
    let whereSql = ` WHERE 1=1`;
    let params: any[] = [];

    if (startDate && endDate) {
      whereSql += ` AND Date >= ? AND Date <= ?`;
      params.push(startDate, endDate);
    }

    if (query) {
      whereSql += ` AND (LOWER(Reason) LIKE ? OR LOWER(Type) LIKE ?)`;
      params.push(`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`);
    }

    // Count & Total
    const [countRows]: any = await db.query(`SELECT COUNT(*) AS count, SUM(Amount) AS totalAmount FROM expenses${whereSql}`, params);
    const count = Number(countRows[0]?.count || 0);
    const totalAmount = Number(countRows[0]?.totalAmount || 0);
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    // Page items
    let dataSql = `SELECT * FROM expenses${whereSql} ORDER BY Date DESC, ExpenseId DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE];
    const [data]: any = await db.query(dataSql, dataParams);

    return {
      expenses: data || [],
      count,
      totalPages,
      totalAmount
    };
  } catch (error) {
    return { expenses: [], count: 0, totalPages: 0, totalAmount: 0 };
  }
};

export const fetchExpenseById = async (id: number) => {
  try {
    const [rows]: any = await db.query(`SELECT * FROM expenses WHERE ExpenseId = ?`, [id]);
    return rows || [];
  } catch (error) {
    return [];
  }
};