import { pageLimit } from "@/app/lib/utils";
import { getWarps, getWarpsCount, getWarpById, updateWarpRepo, getWarpSummary, getWarpSummaryById, updateWarpSummaryRepo } from "@/server/repositories/warpRepositories";

export const fetchWarps = async (
    query: string,
    currentPage: number,
    loomId: string,
    loomStatus: string,
    sizingId: string
) => {
    try {
        return await getWarps(query || null, loomId || null, loomStatus || null, sizingId || null, currentPage || 1, pageLimit);
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
        return await getWarpsCount(query || null, loomId || null, loomStatus || null, sizingId || null);
    } catch (err) {
        console.error("fetchWarpsCount Error:", err);
        return 0;
    }
};

export const fetchWarpById = async (id: string) => {
    try {
        return await getWarpById(id);
    } catch (err) {
        console.error("fetchWarpById Error:", err);
        return null;
    }
};

export const updateWarp = async (warpData: any) => {
    return await updateWarpRepo(warpData);
};

export const fetchWarpSummary = async (
    query: string,
    loomId: string,
    sizingId: string
) => {
    try {
        return await getWarpSummary(query || null, loomId || null, sizingId || null);
    } catch (err) {
        console.error("fetchWarpSummary Error:", err);
        return [];
    }
};

export const fetchWarpSummaryById = async (sizingId: string, loomId: string) => {
    try {
        return await getWarpSummaryById(sizingId, loomId);
    } catch (err) {
        console.error("fetchWarpSummaryById Error:", err);
        return null;
    }
};

export const updateWarpSummary = async (summaryData: any) => {
    return await updateWarpSummaryRepo(summaryData);
};