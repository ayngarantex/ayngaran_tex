import * as repo from '../repositories/yarnRepositories';

export const getYarns = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    return await repo.getYarns(search, page, limit, startDate, endDate, billType, orderBy);
};

export const getYarnCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null
) => {
    return await repo.getYarnCount(search, startDate, endDate, billType);
};

export const getYarnTotal = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    return await repo.getYarnTotal(search, startDate, endDate, billType, orderBy);
};

export const getYarnById = async (id: number) => {
    return await repo.getYarnById(id);
};

export const deleteYarn = async (id: number) => {
    return await repo.deleteYarn(id);
};

export const createYarn = async (
    invoiceData: any,
    products: any[],
    payments: any[]
) => {
    return await repo.createYarn(invoiceData, products, payments);
};

export const updateYarn = async (
    invoiceData: any,
    products: any[],
    payments: any[]
) => {
    return await repo.updateYarn(invoiceData, products, payments);
};
