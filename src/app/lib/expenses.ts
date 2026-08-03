"use server";

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

export const createExpenses = async (expensesData: any[]) => {
  try {
    let count = 0;
    for (const exp of expensesData) {
      const [res]: any = await db.query(
        `INSERT INTO expenses (Date, Reason, Type, otherType, Amount) VALUES (?, ?, ?, ?, ?)`,
        [exp.date || null, exp.reason || null, exp.type || null, exp.otherType || null, exp.amount || 0]
      );
      if (res.affectedRows > 0) count++;
    }
    return { count };
  } catch (error) {
    console.error("createExpenses error:", error);
    return { count: 0 };
  }
};

export const updateExpense = async (id: number, data: any) => {
  try {
    const [res]: any = await db.query(
      `UPDATE expenses SET Date = ?, Reason = ?, Type = ?, otherType = ?, Amount = ? WHERE ExpenseId = ?`,
      [data.Date || null, data.Reason || null, data.Type || null, data.otherType || null, data.Amount || 0, id]
    );
    return { ExpenseId: id };
  } catch (error) {
    console.error("updateExpense error:", error);
    return null;
  }
};

export const deleteExpense = async (id: number) => {
  try {
    const [res]: any = await db.query(
      `DELETE FROM expenses WHERE ExpenseId = ?`,
      [id]
    );
    return { success: res.affectedRows > 0 };
  } catch (error) {
    console.error("deleteExpense error:", error);
    return { success: false };
  }
};