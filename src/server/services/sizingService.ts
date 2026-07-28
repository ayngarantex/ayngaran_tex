import * as repo from '../repositories/sizingRepositories';

export const getSizings = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    return await repo.getSizings(search, page, limit, startDate, endDate, billType, orderBy);
};

export const getSizingCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    return await repo.getSizingCount(search, startDate, endDate, billType);
};

export const getSizingTotal = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    return await repo.getSizingTotal(search, startDate, endDate, billType, orderBy);
};

export const getSizingById = async (id: number) => {
    return await repo.getSizingById(id);
};

export const deleteSizing = async (id: number) => {
    return await repo.deleteSizing(id);
};

export const createSizing = async (
    invoiceData: any,
    products: any[],
    payments: any[],
    sizingYarn: any[]
) => {
    return await repo.createSizing(invoiceData, products, payments, sizingYarn);
};

export const updateSizing = async (
    invoiceData: any,
    products: any[],
    payments: any[],
    sizingYarn: any[]
) => {
    return await repo.updateSizing(invoiceData, products, payments, sizingYarn);
};
