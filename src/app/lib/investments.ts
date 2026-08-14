"use server";

import db from '@/server/config/db';

const ITEMS_PER_PAGE = 20;

export const fetchInvestmentsPage = async (query: string, startDate: string, endDate: string) => {
  try {
    let sql = `SELECT COUNT(*) AS count FROM investments WHERE 1=1`;
    let params: any[] = [];

    if (startDate && endDate) {
      sql += ` AND Date >= ? AND Date <= ?`;
      params.push(startDate, endDate);
    }

    if (query) {
      sql += ` AND (LOWER(InvestorName) LIKE ? OR LOWER(Type) LIKE ?)`;
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
    console.error("fetchInvestmentsPage error:", error);
    return { count: 0, totalPages: 0 };
  }
};

export const fetchInvestments = async (query: string, currentPage: number, startDate: string, endDate: string) => {
  try {
    let whereSql = ` WHERE 1=1`;
    let params: any[] = [];

    if (startDate && endDate) {
      whereSql += ` AND Date >= ? AND Date <= ?`;
      params.push(startDate, endDate);
    }

    if (query) {
      whereSql += ` AND (LOWER(InvestorName) LIKE ? OR LOWER(Type) LIKE ?)`;
      params.push(`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`);
    }

    // Count & Total
    const [countRows]: any = await db.query(`SELECT COUNT(*) AS count, SUM(Amount) AS totalAmount FROM investments${whereSql}`, params);
    const count = Number(countRows[0]?.count || 0);
    const totalAmount = Number(countRows[0]?.totalAmount || 0);
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    // Page items
    let dataSql = `SELECT * FROM investments${whereSql} ORDER BY Date DESC, InvestmentId DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE];
    const [data]: any = await db.query(dataSql, dataParams);

    return {
      investments: data || [],
      count,
      totalPages,
      totalAmount
    };
  } catch (error) {
    console.error("fetchInvestments error:", error);
    return { investments: [], count: 0, totalPages: 0, totalAmount: 0 };
  }
};

export const fetchInvestmentById = async (id: number) => {
  try {
    const [rows]: any = await db.query(`SELECT * FROM investments WHERE InvestmentId = ?`, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error("fetchInvestmentById error:", error);
    return null;
  }
};

export const createInvestment = async (data: any) => {
  try {
    const [res]: any = await db.query(
      `INSERT INTO investments (Date, InvestorName, Type, Amount, Notes) VALUES (?, ?, ?, ?, ?)`,
      [
        data.Date ? new Date(data.Date) : null,
        data.InvestorName || null,
        data.Type || null,
        Number(data.Amount) || 0,
        data.Notes || null
      ]
    );
    return { InvestmentId: res.insertId };
  } catch (error) {
    console.error("createInvestment error:", error);
    return null;
  }
};

export const updateInvestment = async (id: number, data: any) => {
  try {
    await db.query(
      `UPDATE investments SET Date = ?, InvestorName = ?, Type = ?, Amount = ?, Notes = ? WHERE InvestmentId = ?`,
      [
        data.Date ? new Date(data.Date) : null,
        data.InvestorName || null,
        data.Type || null,
        Number(data.Amount) || 0,
        data.Notes || null,
        id
      ]
    );
    return { InvestmentId: id };
  } catch (error) {
    console.error("updateInvestment error:", error);
    return null;
  }
};

export const deleteInvestment = async (id: number) => {
  try {
    const [res]: any = await db.query(
      `DELETE FROM investments WHERE InvestmentId = ?`,
      [id]
    );
    return { success: res.affectedRows > 0 };
  } catch (error) {
    console.error("deleteInvestment error:", error);
    return { success: false };
  }
};
