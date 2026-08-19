"use server";

import { getSalseDetails, getYarnSalesDetails, getSalesChartDetails, getYarnChartDetails, getSizingSalesDetails, getPurchasesDetails, getExpensesDetails, getInvestmentsDetails, getCashInHandDetails, updateCashInHandDetails } from "@/server/repositories/dashboardRepositories";

export const investmentsTotalData = async (
    startDate: string,
    endDate: string
) => {
    try {
        const res = await getInvestmentsDetails(startDate || null, endDate || null);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("investmentsTotalData Error:", err);
        return { totalAmount: 0 };
    }
};

export const salseData = async (
    startDate: string,
    endDate: string,
    billType?: string
) => {
    try {
        const res = await getSalseDetails(startDate || null, endDate || null, billType || null);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("salseData Error:", err);
        return { totalInvoiceAmount: 0, totalPaidAmount: 0, totalPendingAmount: 0 };
    }
};

export const sizingData = async (
    startDate: string,
    endDate: string,
    billType?: string
) => {
    try {
        const res = await getSizingSalesDetails(startDate || null, endDate || null, billType || null);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("sizingData Error:", err);
        return { totalInvoiceAmount: 0, totalPaidAmount: 0, totalPendingAmount: 0 };
    }
};

export const purchaseData = async (
    startDate: string,
    endDate: string,
    billType?: string
) => {
    try {
        const res = await getPurchasesDetails(startDate || null, endDate || null, billType || null);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("purchaseData Error:", err);
        return { totalInvoiceAmount: 0, totalPaidAmount: 0, totalPendingAmount: 0 };
    }
};

export const expensesTotalData = async (
    startDate: string,
    endDate: string
) => {
    try {
        const res = await getExpensesDetails(startDate || null, endDate || null);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("expensesTotalData Error:", err);
        return { totalAmount: 0 };
    }
};

export const yarnSalesData = async (
    startDate: string,
    endDate: string,
    billType?: string
) => {
    try {
        const res = await getYarnSalesDetails(startDate || null, endDate || null, billType || null);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("yarnSalesData Error:", err);
        return { totalInvoiceAmount: 0, totalPaidAmount: 0, totalPendingAmount: 0 };
    }
};

export const fetchSalesChartDetails = async (
    startDate: string,
    endDate: string,
    billType?: string
) => {
    try {
        const res = await getSalesChartDetails(startDate || null, endDate || null, billType || null);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("fetchSalesChartDetails Error:", err);
        return [];
    }
};

export const fetchYarnPurchaseDetails = async (
    startDate: string,
    endDate: string,
    billType?: string
) => {
    try {
        const res = await getYarnChartDetails(startDate || null, endDate || null, billType || null);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("fetchYarnPurchaseDetails Error:", err);
        return [];
    }
};

export const getCashInHand = async () => {
    try {
        const res = await getCashInHandDetails();
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("getCashInHand Error:", err);
        return {
            indusind: 0,
            hdfc: 0,
            canarabank: 0,
            check: 0,
            govinth: 0,
            denom500: 0,
            denom200: 0,
            denom100: 0,
            denom50: 0,
            denom20: 0,
            denom10: 0
        };
    }
};

export const saveCashInHand = async (data: any) => {
    try {
        const res = await updateCashInHandDetails(data);
        return JSON.parse(JSON.stringify(res));
    } catch (err) {
        console.error("saveCashInHand Error:", err);
        return { success: false };
    }
};
