import { updateEntry } from '@/server/repositories/loomRepositories';
import * as loomService from '../../services/loomService';

export const loomResolver = {
    Query: {
        looms: async (_: unknown, { search, page, limit }: any) => {
            return await loomService.getLooms(search, page, limit);
        },
        loomCount: async (_: unknown, { search }: any) => {
            return await loomService.getLoomCount(search);
        },
        loom: async (_: unknown, { Id }: any) => {
            return await loomService.getLoomById(Id);
        },
        entry: async (_: unknown, { Id }: any) => {
            return await loomService.getEntryById(Id);
        },
        loomEntries: async (_: unknown, { LoomId }: any) => {
            return await loomService.getLoomEntriesByLoomId(LoomId);
        },
        sizingWarpDetails: async (_: unknown, { LoomId }: any) => {
            return await loomService.getSizingWarpDetailsByLoomId(LoomId);
        },
    },
    Mutation: {
        createLoom: async (_: unknown, { loomData }: any) => {
            return await loomService.createLoom(loomData);
        },
        updateLoom: async (_: unknown, { loomData }: any) => {
            return await loomService.updateLoom(loomData);
        },
        deleteLoom: async (_: unknown, { Id }: any) => {
            return await loomService.deleteLoom(Id);
        },
        createEntry: async (_: unknown, { entryData }: any) => {
            return await loomService.createEntry(entryData);
        },
        updateEntry: async (_: unknown, { entryData }: any) => {
            return await loomService.updateEntry(entryData);
        },
        deleteEntry: async (_: unknown, { Id }: any) => {
            return await loomService.deleteEntry(Id);
        }
    },
};
