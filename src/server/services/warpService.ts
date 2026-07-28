import * as repo from '../repositories/warpRepositories';

export const getWarps = async (search: any, loomId: any, loomStatus: any, sizingId: any, page: any, limit: any) => {
    return await repo.getWarps(search, loomId, loomStatus, sizingId, page, limit);
};
export const getWarpCount = async (search: any, loomId: any, loomStatus: any, sizingId: any) => {
    return await repo.getWarpCount(search, loomId, loomStatus, sizingId);
};
export const getWarpSummary = async (search: any, loomId: any, sizingId: any) => {
    return await repo.getWarpSummary(search, loomId, sizingId);
};
export const getWarpById = async (id: any) => {
    return await repo.getWarpById(id);
};
export const getWarpSummaryById = async (loomId: any, sizingId: any) => {
    return await repo.getWarpSummaryById(loomId, sizingId);
};
export const updateWarp = async (warpData: any) => {
    return await repo.updateWarp(warpData);
};
export const updateWarpSummary = async (summaryData: any) => {
    return await repo.updateWarpSummary(summaryData);
};
