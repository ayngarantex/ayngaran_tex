"use server";

import { pageLimit } from "@/app/lib/utils";
import { getWarps, getWarpCount, getWarpById, updateWarp as updateWarpRepo, getWarpSummary, getWarpSummaryById, updateWarpSummary as updateWarpSummaryRepo } from "@/server/repositories/warpRepositories";

export const fetchWarps = async (
    query: string,
    currentPage: number,
    loomId: string,
    loomStatus: string,
    sizingId: string
) => {
    try {
        const rows = await getWarps(query || null, loomId || null, loomStatus || null, sizingId || null, currentPage || 1, pageLimit);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchWarps Error:", err);
        return [];
    }
};

export const fetchWarpsCount = async (
    query: string,
    loomId: string,
    loomStatus: string,
    sizingId: string
) => {
    try {
        const count = await getWarpCount(query || null, loomId || null, loomStatus || null, sizingId || null);
        return count;
    } catch (err) {
        console.error("fetchWarpsCount Error:", err);
        return 0;
    }
};

export const fetchWarpById = async (id: string) => {
    try {
        const data = await getWarpById(id);
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (err) {
        console.error("fetchWarpById Error:", err);
        return null;
    }
};

export const updateWarp = async (warpData: any) => {
    const res = await updateWarpRepo(warpData);
    return JSON.parse(JSON.stringify(res));
};

export const fetchWarpSummary = async (
    query: string,
    loomId: string,
    sizingId: string
) => {
    try {
        const rows = await getWarpSummary(query || null, loomId || null, sizingId || null);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchWarpSummary Error:", err);
        return [];
    }
};

export const fetchWarpSummaryById = async (sizingId: string, loomId: string) => {
    try {
        const data = await getWarpSummaryById(sizingId, loomId);
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (err) {
        console.error("fetchWarpSummaryById Error:", err);
        return null;
    }
};

export const updateWarpSummary = async (summaryData: any) => {
    const res = await updateWarpSummaryRepo(summaryData);
    return JSON.parse(JSON.stringify(res));
};