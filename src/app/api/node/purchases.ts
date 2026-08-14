"use server";

import { pageLimit } from "@/app/lib/utils";
import {
    getPurchases,
    getPurchaseCount,
    getPurchaseTotal,
    getPurchaseById,
    createPurchase as createPurchaseRepo,
    updatePurchase as updatePurchaseRepo,
    deletePurchase as deletePurchaseRepo
} from '@/server/repositories/purchaseRepositories';

export const fetchPurchases = async (
    query: string,
    currentPage: number,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
) => {
    try {
        const rows = await getPurchases(query || null, currentPage || 1, pageLimit, startDate || null, endDate || null, billType || null, orderBy || null);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchPurchases Error:", err);
        return [];
    }
};

export const fetchPurchasePages = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string
) => {
    try {
        const count = await getPurchaseCount(query || null, startDate || null, endDate || null, billType || null);
        const totalPages = Math.ceil((count || 0) / pageLimit);
        return { count, totalPages };
    } catch (err) {
        console.error("fetchPurchasePages Error:", err);
        return { count: 0, totalPages: 0 };
    }
};

export const fetchPurchasesDetails = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
) => {
    try {
        const totals = await getPurchaseTotal(query || null, startDate || null, endDate || null, billType || null, orderBy || null);
        return {
            totalInvoiceAmount: totals?.totalInvoiceAmount || 0,
            totalPaid: totals?.totalPaidAmount || 0,
            balance: totals?.totalPendingAmount || 0
        };
    } catch (err) {
        console.error("fetchPurchasesDetails Error:", err);
        return { totalInvoiceAmount: 0, totalPaid: 0, balance: 0 };
    }
};

export const fetchPurchaseById = async (id: number) => {
    try {
        const data = await getPurchaseById(id);
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (err) {
        console.error("fetchPurchaseById Error:", err);
        return null;
    }
};

export const deletePurchase = async (id: number) => {
    const res = await deletePurchaseRepo(id);
    return JSON.parse(JSON.stringify(res));
};

export const createPurchase = async (payload: {
    invoiceData: any;
    products?: any[];
    purchaseDetailsList?: any[];
    payments?: any[];
    paymentDetailsList?: any[];
}) => {
    const products = payload.products || payload.purchaseDetailsList || [];
    const payments = payload.payments || payload.paymentDetailsList || [];
    const res = await createPurchaseRepo(payload.invoiceData, products, payments);
    return JSON.parse(JSON.stringify(res));
};

export const updatePurchase = async (payload: {
    id?: number;
    invoiceData: any;
    products?: any[];
    purchaseDetailsList?: any[];
    payments?: any[];
    paymentDetailsList?: any[];
}) => {
    const invoiceData = payload.invoiceData || {};
    if (payload.id && !invoiceData.PurchaseId) {
        invoiceData.PurchaseId = payload.id;
    }
    const products = payload.products || payload.purchaseDetailsList || [];
    const payments = payload.payments || payload.paymentDetailsList || [];
    const res = await updatePurchaseRepo(invoiceData, products, payments);
    return JSON.parse(JSON.stringify(res));
};
