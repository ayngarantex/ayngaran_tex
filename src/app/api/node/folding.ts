"use server";

import {
    getFoldingEntries,
    getFoldingCount,
    getFoldingById,
    createFoldingEntry,
    updateFoldingEntry,
    deleteFoldingEntry,
    getFoldingWagesConsolidated,
    addFoldingPayment,
    deleteFoldingPayment,
    updateFoldingLoomWageRate,
    updateFoldingLoomOpeningBalance
} from "@/server/repositories/foldingRepositories";
import { pageLimit } from "@/app/lib/utils";

export const fetchFoldingEntries = async (
    search: string = "",
    page: number = 1,
    limit: number = pageLimit
) => {
    try {
        const rows = await getFoldingEntries(search || null, page, limit);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchFoldingEntries Error:", err);
        return [];
    }
};

export const fetchFoldingCount = async (search: string = "") => {
    try {
        const count = await getFoldingCount(search || null);
        return Number(count) || 0;
    } catch (err) {
        console.error("fetchFoldingCount Error:", err);
        return 0;
    }
};

export const fetchFoldingById = async (id: number) => {
    try {
        const row = await getFoldingById(id);
        return row ? JSON.parse(JSON.stringify(row)) : null;
    } catch (err) {
        console.error("fetchFoldingById Error:", err);
        return null;
    }
};

export interface FoldingData {
    Date: string;
    DcNumber?: string;
    LoomId?: number;
    Type?: string;
    Folder?: string;
    FoldedStatus?: string;
    Items: Record<string, number>;
    Notes?: string;
}

export const saveFoldingEntry = async (data: FoldingData) => {
    try {
        const res = await createFoldingEntry(data);
        return { success: true, data: JSON.parse(JSON.stringify(res)) };
    } catch (err: any) {
        console.error("saveFoldingEntry Error:", err);
        return { success: false, error: err.message || "Failed to save folding entry" };
    }
};

export const modifyFoldingEntry = async (
    id: number,
    data: FoldingData
) => {
    try {
        const res = await updateFoldingEntry(id, data);
        return { success: true, count: res };
    } catch (err: any) {
        console.error("modifyFoldingEntry Error:", err);
        return { success: false, error: err.message || "Failed to update folding entry" };
    }
};

export const removeFoldingEntry = async (id: number) => {
    try {
        const res = await deleteFoldingEntry(id);
        return { success: true, count: res };
    } catch (err: any) {
        console.error("removeFoldingEntry Error:", err);
        return { success: false, error: err.message || "Failed to delete folding entry" };
    }
};

// ==========================================
// Weekly Reconciliation & Payment Actions
// ==========================================

export const fetchFoldingWagesConsolidated = async (
    search: string = "",
    loomId: string = "",
    startDate: string = "2026-09-27"
) => {
    try {
        const rows = await getFoldingWagesConsolidated(
            search || null,
            loomId || null,
            startDate || "2026-09-27"
        );
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchFoldingWagesConsolidated Error:", err);
        return [];
    }
};

export const saveFoldingPayment = async (paymentData: {
    LoomId: number;
    WeekStartDate: string;
    PaymentDate: string;
    Amount: number;
    PaymentType: string;
    Note?: string;
}) => {
    try {
        const res = await addFoldingPayment(paymentData);
        return { success: true, data: JSON.parse(JSON.stringify(res)) };
    } catch (err: any) {
        console.error("saveFoldingPayment Error:", err);
        return { success: false, error: err.message || "Failed to save payment" };
    }
};

export const removeFoldingPayment = async (paymentId: number) => {
    try {
        const res = await deleteFoldingPayment(paymentId);
        return { success: true, count: res };
    } catch (err: any) {
        console.error("removeFoldingPayment Error:", err);
        return { success: false, error: err.message || "Failed to delete payment" };
    }
};

export const saveFoldingWageRate = async (loomId: number, rate: number) => {
    try {
        await updateFoldingLoomWageRate(loomId, rate);
        return { success: true };
    } catch (err: any) {
        console.error("saveFoldingWageRate Error:", err);
        return { success: false, error: err.message || "Failed to save wage rate" };
    }
};

export const saveFoldingOpeningBalance = async (loomId: number, balance: number) => {
    try {
        await updateFoldingLoomOpeningBalance(loomId, balance);
        return { success: true };
    } catch (err: any) {
        console.error("saveFoldingOpeningBalance Error:", err);
        return { success: false, error: err.message || "Failed to save opening balance" };
    }
};
