"use server";

import { pageLimit } from "@/app/lib/utils";
import { getYarns, getYarnCount, getYarnTotal, getYarnById, createYarn as createYarnRepo, updateYarn as updateYarnRepo, deleteYarn as deleteYarnRepo } from '@/server/repositories/yarnRepositories';

export const fetchYarns = async (
    query: string,
    currentPage: number,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
) => {
    try {
        const rows = await getYarns(query || null, currentPage || 1, pageLimit, startDate || null, endDate || null, billType || null, orderBy || null);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchYarns Error:", err);
        return [];
    }
};

export const fetchYarnPages = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string
) => {
    try {
        const count = await getYarnCount(query || null, startDate || null, endDate || null, billType || null);
        const totalPages = Math.ceil((count || 0) / pageLimit);
        return { count, totalPages };
    } catch (err) {
        console.error("fetchYarnPages Error:", err);
        return { count: 0, totalPages: 0 };
    }
};

export const fetchYarnsDetails = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
) => {
    try {
        const totals = await getYarnTotal(query || null, startDate || null, endDate || null, billType || null, orderBy || null);
        return {
            totalInvoiceAmount: totals?.totalInvoiceAmount || 0,
            totalPaid: totals?.totalPaidAmount || 0,
            balance: totals?.totalPendingAmount || 0
        };
    } catch (err) {
        console.error("fetchYarnsDetails Error:", err);
        return { totalInvoiceAmount: 0, totalPaid: 0, balance: 0 };
    }
};

export const fetchYarnById = async (id: number) => {
    try {
        const yarnData = await getYarnById(id);
        return yarnData ? JSON.parse(JSON.stringify(yarnData)) : null;
    } catch (err) {
        console.error("fetchYarnById Error:", err);
        return null;
    }
};

export const deleteYarn = async (id: number) => {
    const res = await deleteYarnRepo(id);
    return JSON.parse(JSON.stringify(res));
};

export const createYarn = async (payload: {
    invoiceData: any;
    products?: any[];
    yarnDetailsList?: any[];
    payments?: any[];
    paymentDetailsList?: any[];
}) => {
    const products = payload.products || payload.yarnDetailsList || [];
    const payments = payload.payments || payload.paymentDetailsList || [];
    const res = await createYarnRepo(payload.invoiceData, products, payments);
    return JSON.parse(JSON.stringify(res));
};

export const updateYarn = async (payload: {
    id?: number;
    invoiceData: any;
    products?: any[];
    yarnDetailsList?: any[];
    payments?: any[];
    paymentDetailsList?: any[];
}) => {
    const invoiceData = payload.invoiceData || {};
    if (payload.id && !invoiceData.YarnId) {
        invoiceData.YarnId = payload.id;
    }
    const products = payload.products || payload.yarnDetailsList || [];
    const payments = payload.payments || payload.paymentDetailsList || [];
    const res = await updateYarnRepo(invoiceData, products, payments);
    return JSON.parse(JSON.stringify(res));
};
