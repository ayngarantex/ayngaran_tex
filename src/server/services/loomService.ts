import * as repo from '../repositories/loomRepositories';

export const getLooms = async (search: string | null, page: number | null, limit: number | null) => {
    return await repo.getLooms(search, page, limit);
};

export const getLoomCount = async (search: string | null) => {
    return await repo.getLoomCount(search);
};

export const getLoomById = async (Id: any) => {
    return await repo.getLoomById(Id);
};

export const createLoom = async (loomData: any) => {
    return await repo.createLoom(loomData);
};

export const updateLoom = async (loomData: any) => {
    return await repo.updateLoom(loomData);
};

export const deleteLoom = async (Id: any) => {
    return await repo.deleteLoom(Id);
};

export const getEntryById = async (Id: any) => {
    return await repo.getEntryById(Id);
};

export const createEntry = async (entryData: any) => {
    return await repo.createEntry(entryData);
};

export const updateEntry = async (entryData: any) => {
    return await repo.updateEntry(entryData);
};

export const deleteEntry = async (Id: any) => {
    return await repo.deleteEntry(Id);
};

export const getLoomEntriesByLoomId = async (LoomId: any) => {
    return await repo.getLoomEntriesByLoomId(LoomId);
};

export const getSizingWarpDetailsByLoomId = async (LoomId: any) => {
    return await repo.getSizingWarpDetailsByLoomId(LoomId);
};
