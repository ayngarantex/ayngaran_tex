"use server";

import { getSalseDetails, getYarnSalesDetails, getSalesChartDetails, getYarnChartDetails, getSizingSalesDetails, getPurchasesDetails, getExpensesDetails, getInvestmentsDetails } from "@/server/repositories/dashboardRepositories";

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
