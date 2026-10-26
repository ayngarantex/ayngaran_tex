"use server";

import {
    getDesignSheets,
    getDesignSheetsCount,
    getDesignSheetById,
    getDesignSheetByNumber,
    createDesignSheet,
    updateDesignSheet,
    deleteDesignSheet
} from "@/server/repositories/designSheetRepositories";
import { pageLimit } from "@/app/lib/utils";
import type { DesignSheetItem, DesignSheet, DesignSheetPayload } from "@/app/lib/types";

// Helper to compute ends & color breakdown from items
function computeDesignSheetTotals(items: DesignSheetItem[]) {
    let totalEnds = 0;
    const colorSummary: Record<string, number> = {};

    for (const item of items) {
        const val = Number(item.value) || 0;
        const repeat = item.isGrouped && item.groupRepeat ? Number(item.groupRepeat) : 1;
        const rowTotal = val * repeat;

        totalEnds += rowTotal;
        const colorName = (item.color || 'Unspecified').trim();
        colorSummary[colorName] = (colorSummary[colorName] || 0) + rowTotal;
    }

    return { totalEnds, colorSummary };
}

export const fetchDesignSheets = async (
    search: string = "",
    page: number = 1,
    limit: number = pageLimit
) => {
    try {
        const rows = await getDesignSheets(search || "", page, limit);
        return JSON.parse(JSON.stringify(rows)) as DesignSheet[];
    } catch (err) {
        console.error("fetchDesignSheets Error:", err);
        return [];
    }
};

export const fetchDesignSheetsCount = async (search: string = "") => {
    try {
        const count = await getDesignSheetsCount(search || "");
        const total = Number(count) || 0;
        const totalPages = Math.ceil(total / pageLimit);
        return { count: total, totalPages };
    } catch (err) {
        console.error("fetchDesignSheetsCount Error:", err);
        return { count: 0, totalPages: 0 };
    }
};

export const fetchDesignSheetById = async (id: number) => {
    try {
        const row = await getDesignSheetById(id);
        return row ? (JSON.parse(JSON.stringify(row)) as DesignSheet) : null;
    } catch (err) {
        console.error("fetchDesignSheetById Error:", err);
        return null;
    }
};

export const saveDesignSheet = async (payload: DesignSheetPayload) => {
    try {
        const { totalEnds, colorSummary } = computeDesignSheetTotals(payload.Items || []);
        const id = await createDesignSheet({
            DesignNumber: payload.DesignNumber,
            DesignName: payload.DesignName,
            ItemWidth: payload.ItemWidth || '54"',
            TotalEnds: totalEnds,
            ColorSummary: colorSummary,
            Notes: payload.Notes || null,
            Items: payload.Items || []
        });

        return { success: true, id };
    } catch (err: any) {
        console.error("saveDesignSheet Error:", err);
        return { success: false, error: err.message || "Failed to create design sheet" };
    }
};

export const modifyDesignSheet = async (id: number, payload: DesignSheetPayload) => {
    try {
        const { totalEnds, colorSummary } = computeDesignSheetTotals(payload.Items || []);
        await updateDesignSheet(id, {
            DesignNumber: payload.DesignNumber,
            DesignName: payload.DesignName,
            ItemWidth: payload.ItemWidth || '54"',
            TotalEnds: totalEnds,
            ColorSummary: colorSummary,
            Notes: payload.Notes || null,
            Items: payload.Items || []
        });

        return { success: true };
    } catch (err: any) {
        console.error("modifyDesignSheet Error:", err);
        return { success: false, error: err.message || "Failed to update design sheet" };
    }
};

export const removeDesignSheet = async (id: number) => {
    try {
        await deleteDesignSheet(id);
        return { success: true };
    } catch (err: any) {
        console.error("removeDesignSheet Error:", err);
        return { success: false, error: err.message || "Failed to delete design sheet" };
    }
};

export const duplicateDesignSheet = async (
    id: number,
    customDesignNumber?: string,
    customDesignName?: string
) => {
    try {
        const original = await getDesignSheetById(id);
        if (!original) {
            return { success: false, error: "Original design sheet not found." };
        }

        // Determine unique design number
        let newDesignNo = customDesignNumber?.trim();
        if (!newDesignNo) {
            let candidate = `${original.DesignNumber}-COPY`;
            let counter = 1;
            while (await getDesignSheetByNumber(candidate)) {
                counter++;
                candidate = `${original.DesignNumber}-COPY-${counter}`;
            }
            newDesignNo = candidate;
        } else {
            const existing = await getDesignSheetByNumber(newDesignNo);
            if (existing) {
                return { success: false, error: `Design Number "${newDesignNo}" already exists. Please choose a different number.` };
            }
        }

        const newName = customDesignName?.trim() || `${original.DesignName} (Copy)`;

        // Clone items with unique row IDs and new group IDs
        const groupMapping: Record<string, string> = {};
        const clonedItems = (original.Items || []).map((it, idx) => {
            const newRowId = 'row_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4);
            let newGroupId: string | undefined = undefined;
            if (it.isGrouped && it.groupId) {
                if (!groupMapping[it.groupId]) {
                    groupMapping[it.groupId] = 'grp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                }
                newGroupId = groupMapping[it.groupId];
            }

            return {
                ...it,
                id: newRowId,
                groupId: newGroupId
            };
        });

        const newId = await createDesignSheet({
            DesignNumber: newDesignNo,
            DesignName: newName,
            ItemWidth: original.ItemWidth || '54"',
            TotalEnds: original.TotalEnds || 0,
            ColorSummary: original.ColorSummary || {},
            Notes: original.Notes || null,
            Items: clonedItems
        });

        return { success: true, id: newId, designNumber: newDesignNo };
    } catch (err: any) {
        console.error("duplicateDesignSheet Error:", err);
        return { success: false, error: err.message || "Failed to copy design sheet" };
    }
};

