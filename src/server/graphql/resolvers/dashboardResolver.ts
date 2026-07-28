import * as dashboardService from '../../services/dashboardService';

export const dashboardResolver = {
    Query: {
        salse: async (
            _: unknown,
            { startDate, endDate, billType }: { startDate?: string; endDate?: string; billType?: string }
        ) => {
            return await dashboardService.getSalseDetails(startDate, endDate, billType);
        },
        yarnSales: async (
            _: unknown,
            { startDate, endDate, billType }: { startDate?: string; endDate?: string; billType?: string }
        ) => {
            return await dashboardService.getYarnSalesDetails(startDate, endDate, billType);
        },
        salesChart: async (
            _: unknown,
            { startDate, endDate, billType }: { startDate?: string; endDate?: string; billType?: string }
        ) => {
            return await dashboardService.getSalesChartDetails(startDate, endDate, billType);
        },
        yarnChart: async (
            _: unknown,
            { startDate, endDate, billType }: { startDate?: string; endDate?: string; billType?: string }
        ) => {
            return await dashboardService.getYarnChartDetails(startDate, endDate, billType);
        },
    },
};

