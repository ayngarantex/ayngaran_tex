import { pageLimit } from "@/app/lib/utils";
import { getSizings, getSizingCount, getSizingTotal, getSizingById, createSizing as createSizingRepo, updateSizing as updateSizingRepo, deleteSizing as deleteSizingRepo } from "@/server/repositories/sizingRepositories";

export const fetchSizing = async (
    query: string,
    currentPage: number,
    startDate: string = '',
    endDate: string = '',
    billType: string = '',
    orderBy: string = ''
) => {
    try {
        return await getSizings(query || null, currentPage || 1, pageLimit, startDate || null, endDate || null, billType || null, orderBy || null);
    } catch (err) {
        console.error("fetchSizing Error:", err);
        return [];
    }
};

export const fetchSizingPages = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string
) => {
    try {
        const count = await getSizingCount(query || null, startDate || null, endDate || null, billType || null);
        const totalPages = Math.ceil(Number(count) / pageLimit);
        return { count, totalPages };
    } catch (err) {
        console.error("fetchSizingPages Error:", err);
        return { count: 0, totalPages: 0 };
    }
};

export const fetchSizingTotal = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
) => {
    try {
        return await getSizingTotal(query || null, startDate || null, endDate || null, billType || null, orderBy || null);
    } catch (err) {
        console.error("fetchSizingTotal Error:", err);
        return { totalInvoiceAmount: 0, totalReceived: 0, balance: 0 };
    }
};

export const fetchSizingById = async (id: number) => {
    try {
        const sizingData = await getSizingById(id);
        return sizingData ? [sizingData] : [];
    } catch (err) {
        console.error("fetchSizingById Error:", err);
        return [];
    }
};

export const deleteSizing = async (id: number) => {
    return await deleteSizingRepo(id);
};

export const createSizing = async (payload: {
    invoiceData: any;
    products: any[];
    payments: any[];
    sizingYarn: any[];
}) => {
    return await createSizingRepo(payload.invoiceData, payload.products || [], payload.payments || [], payload.sizingYarn || []);
};

export const updateSizing = async (payload: {
    id?: number;
    invoiceData: any;
    products: any[];
    payments: any[];
    sizingYarn: any[];
}) => {
    const invoiceData = payload.invoiceData || {};
    if (payload.id && !invoiceData.SizingId) {
        invoiceData.SizingId = payload.id;
    }
    return await updateSizingRepo(invoiceData, payload.products || [], payload.payments || [], payload.sizingYarn || []);
};
