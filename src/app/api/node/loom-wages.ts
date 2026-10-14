"use server";

import {
    getLoomWagesConsolidated,
    addLoomWagePayment,
    deleteLoomWagePayment,
    updateLoomDefaultWageRate,
    updateSizingWarpWageRate,
    updateLoomOpeningBalance
} from "@/server/repositories/loomWagesRepositories";

export const fetchLoomWagesConsolidated = async (
    search: string = "",
    loomId: string = "",
    startDate: string = "2026-09-27"
) => {
    try {
        const rows = await getLoomWagesConsolidated(
            search || null,
            loomId || null,
            startDate || "2026-09-27"
        );
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchLoomWagesConsolidated Error:", err);
        return [];
    }
};

export const saveLoomWagePayment = async (paymentData: {
    LoomId: number;
    WeekStartDate: string;
    Dc?: string;
    DcDate?: string;
    SizingId?: number;
    PaymentDate: string;
    Amount: number;
    PaymentType: string;
    Note: string;
}) => {
    try {
        const res = await addLoomWagePayment(paymentData);
        return { success: true, data: JSON.parse(JSON.stringify(res)) };
    } catch (err: any) {
        console.error("saveLoomWagePayment Error:", err);
        return { success: false, error: err.message || "Failed to save payment" };
    }
};

export const removeLoomWagePayment = async (paymentId: number) => {
    try {
        const res = await deleteLoomWagePayment(paymentId);
        return { success: true, count: res };
    } catch (err: any) {
        console.error("removeLoomWagePayment Error:", err);
        return { success: false, error: err.message || "Failed to delete payment" };
    }
};

export const saveLoomDefaultRate = async (loomId: number, rate: number) => {
    try {
        await updateLoomDefaultWageRate(loomId, rate);
        return { success: true };
    } catch (err: any) {
        console.error("saveLoomDefaultRate Error:", err);
        return { success: false, error: err.message || "Failed to save loom rate" };
    }
};

export const saveWarpCustomRate = async (sizingId: number, rate: number) => {
    try {
        await updateSizingWarpWageRate(sizingId, rate);
        return { success: true };
    } catch (err: any) {
        console.error("saveWarpCustomRate Error:", err);
        return { success: false, error: err.message || "Failed to save warp rate" };
    }
};

export const saveLoomOpeningBalance = async (loomId: number, balance: number) => {
    try {
        await updateLoomOpeningBalance(loomId, balance);
        return { success: true };
    } catch (err: any) {
        console.error("saveLoomOpeningBalance Error:", err);
        return { success: false, error: err.message || "Failed to save opening balance" };
    }
};
