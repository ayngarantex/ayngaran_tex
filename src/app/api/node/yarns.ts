import { pageLimit } from "@/app/lib/utils";
import { getYarns, getYarnsCount, getYarnsDetails, getYarnById, createYarnRepo, updateYarnRepo, deleteYarnRepo } from '@/server/repositories/yarnRepositories';

export const fetchYarns = async (
    query: string,
    currentPage: number,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
) => {
    try {
        return await getYarns(query || null, currentPage || 1, pageLimit, startDate || null, endDate || null, billType || null, orderBy || null);
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
        const count = await getYarnsCount(query || null, startDate || null, endDate || null, billType || null);
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
        return await getYarnsDetails(query || null, startDate || null, endDate || null, billType || null, orderBy || null);
    } catch (err) {
        console.error("fetchYarnsDetails Error:", err);
        return { totalInvoiceAmount: 0, totalPaid: 0, balance: 0 };
    }
};

export const fetchYarnById = async (id: number) => {
    try {
        const yarnData = await getYarnById(id);
        return yarnData ? [yarnData] : [];
    } catch (err) {
        console.error("fetchYarnById Error:", err);
        return [];
    }
};

export const deleteYarn = async (id: number) => {
    return await deleteYarnRepo(id);
};

export const createYarn = async (payload: {
    invoiceData: any;
    yarnDetailsList: any[];
    paymentDetailsList: any[];
}) => {
    return await createYarnRepo(payload.invoiceData, payload.yarnDetailsList, payload.paymentDetailsList);
};

export const updateYarn = async (payload: {
    id: number;
    invoiceData: any;
    yarnDetailsList: any[];
    paymentDetailsList: any[];
}) => {
    return await updateYarnRepo(payload.id, payload.invoiceData, payload.yarnDetailsList, payload.paymentDetailsList);
};
