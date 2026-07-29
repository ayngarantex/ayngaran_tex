"use server";

import { getSalseDetails, getYarnSalesDetails, getSalesChartDetails, getYarnChartDetails } from "@/server/repositories/dashboardRepositories";

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
