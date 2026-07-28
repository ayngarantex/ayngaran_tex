import * as service from '../../services/warpService';

export const warpResolver = {
    Query: {
        warps: async (_: unknown, { search, loomId, loomStatus, sizingId, page, limit }: any) => {
            return await service.getWarps(search, loomId, loomStatus, sizingId, page, limit);
        },
        warpCount: async (_: unknown, { search, loomId, loomStatus, sizingId }: any) => {
            return await service.getWarpCount(search, loomId, loomStatus, sizingId);
        },
        warpSummary: async (_: unknown, { search, loomId, sizingId }: any) => {
            return await service.getWarpSummary(search, loomId, sizingId);
        },
        warp: async (_: unknown, { Id }: any) => {
            return await service.getWarpById(Id);
        },
        warpSummaryById: async (_: unknown, { loomId, sizingId }: any) => {
            return await service.getWarpSummaryById(loomId, sizingId);
        },
    },
    Mutation: {
        updateWarp: async (_: unknown, { warpData }: any) => {
            return await service.updateWarp(warpData);
        },
        updateWarpSummary: async (_: unknown, { summaryData }: any) => {
            return await service.updateWarpSummary(summaryData);
        },
    },
};
