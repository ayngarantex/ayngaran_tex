import * as repo from '../repositories/dashboardRepositories';

export const getSalseDetails = async (startDate?: string, endDate?: string, billType?: string) => {
    return await repo.getSalseDetails(startDate ?? null, endDate ?? null, billType ?? null);
};

export const getYarnSalesDetails = async (startDate?: string, endDate?: string, billType?: string) => {
    return await repo.getYarnSalesDetails(startDate ?? null, endDate ?? null, billType ?? null);
};

export const getSalesChartDetails = async (startDate?: string, endDate?: string, billType?: string) => {
    return await repo.getSalesChartDetails(startDate ?? null, endDate ?? null, billType ?? null);
};

export const getYarnChartDetails = async (startDate?: string, endDate?: string, billType?: string) => {
    return await repo.getYarnChartDetails(startDate ?? null, endDate ?? null, billType ?? null);
};

