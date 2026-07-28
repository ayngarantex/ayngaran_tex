import * as repo from '../repositories/stockRepositories';

export const getStockEntriesByProductId = async (productId: number) => {
    return await repo.getStockEntriesByProductId(productId);
};

export const getAllStockEntries = async () => {
    return await repo.getAllStockEntries();
};

export const getStockEntryById = async (id: number) => {
    return await repo.getStockEntryById(id);
};

export const createStockEntry = async (
    productId: number,
    quantity: number,
    entryDate: string,
    notes: string | null
) => {
    return await repo.createStockEntry(productId, quantity, entryDate, notes);
};

export const updateStockEntry = async (
    id: number,
    quantity: number,
    entryDate: string,
    notes: string | null
) => {
    return await repo.updateStockEntry(id, quantity, entryDate, notes);
};

export const deleteStockEntry = async (id: number) => {
    return await repo.deleteStockEntry(id);
};
