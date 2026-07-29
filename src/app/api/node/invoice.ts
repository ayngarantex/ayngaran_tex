"use server";

import { pageLimit } from "@/app/lib/utils";
import { getInvoices, getInvoicesCount, getInvoicesTotal, getInvoice, getLastInvoiceNumber, createInvoice as createInvoiceRepo, updateInvoice as updateInvoiceRepo, deleteInvoice as deleteInvoiceRepo, getCustomerInvoices, getCustomerPayments } from "@/server/repositories/invoiceRepositories";

export const fetchInvoices = async (
    query: string,
    currentPage: number,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string,
    limit?: number | null
) => {
    try {
        const rows = await getInvoices(query || null, startDate || null, endDate || null, billType || null, orderBy || null, currentPage || 1, limit === undefined ? pageLimit : limit);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchInvoices Error:", err);
        return [];
    }
};

export const fetchInvoicesCount = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string = ''
) => {
    try {
        const count = await getInvoicesCount(query || null, startDate || null, endDate || null, billType || null, orderBy || null);
        return count || 0;
    } catch (err) {
        console.error("fetchInvoicesCount Error:", err);
        return 0;
    }
};

export const fetchInvoicePages = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string
) => {
    try {
        const count = await getInvoicesCount(query || null, startDate || null, endDate || null, billType || null, null);
        const totalPages = Math.ceil(Number(count) / pageLimit);
        return { count, totalPages };
    } catch (err) {
        console.error("fetchInvoicePages Error:", err);
        return { count: 0, totalPages: 0 };
    }
};

export const fetchInvoiceTotal = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string = ''
) => {
    try {
        const totals = await getInvoicesTotal(query || null, startDate || null, endDate || null, billType || null, orderBy || null);
        return JSON.parse(JSON.stringify(totals));
    } catch (err) {
        console.error("fetchInvoiceTotal Error:", err);
        return { TotalInvoiceAmount: 0, TotalReceivedAmount: 0, TotalBalanceAmount: 0, TotalCancelledAmount: 0 };
    }
};

export const fetchInvoicesDetails = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
) => {
    return await fetchInvoiceTotal(query, startDate, endDate, billType, orderBy);
};

export const fetchInvoiceById = async (id: number) => {
    try {
        const data = await getInvoice(id);
        return data ? JSON.parse(JSON.stringify([data])) : [];
    } catch (err) {
        console.error("fetchInvoiceById Error:", err);
        return [];
    }
};

export const fetchLastInvoiceNumber = async (billType: string) => {
    try {
        const lastNum = await getLastInvoiceNumber(billType || null);
        return lastNum || '';
    } catch (err) {
        console.error("fetchLastInvoiceNumber Error:", err);
        return '';
    }
};

export const createInvoice = async (invoiceData: any) => {
    const res = await createInvoiceRepo(invoiceData);
    return JSON.parse(JSON.stringify(res));
};

export const updateInvoice = async (invoiceData: any) => {
    const res = await updateInvoiceRepo(invoiceData);
    return JSON.parse(JSON.stringify(res));
};

export const deleteInvoice = async (id: number | string) => {
    const res = await deleteInvoiceRepo(Number(id));
    return JSON.parse(JSON.stringify(res));
};

export const fetchCustomerInvoices = async (id: any, startDate: string, endDate: string, billType: string) => {
    try {
        const rows = await getCustomerInvoices(id, startDate || null, endDate || null, billType || null);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchCustomerInvoices Error:", err);
        return [];
    }
};

export const fetchCustomerPayments = async (id: any, startDate: string, endDate: string, billType: string) => {
    try {
        const rows = await getCustomerPayments(id, startDate || null, endDate || null, billType || null);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchCustomerPayments Error:", err);
        return [];
    }
};