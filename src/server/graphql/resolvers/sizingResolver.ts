import * as sizingService from '../../services/sizingService';

export const sizingResolver = {
    Query: {
        sizings: async (_: unknown, { search, page, limit, startDate, endDate, billType, orderBy }: any) => {
            return await sizingService.getSizings(search, page, limit, startDate, endDate, billType, orderBy);
        },
        sizingCount: async (_: unknown, { search, startDate, endDate, billType }: any) => {
            return await sizingService.getSizingCount(search, startDate, endDate, billType);
        },
        sizingTotal: async (_: unknown, { search, startDate, endDate, billType, orderBy }: any) => {
            return await sizingService.getSizingTotal(search, startDate, endDate, billType, orderBy);
        },
        sizing: async (_: unknown, { Id }: any) => {
            return await sizingService.getSizingById(Number(Id));
        },
    },
    Mutation: {
        createSizing: async (_: unknown, { invoiceData, products, payments, sizingYarn }: any) => {
            return await sizingService.createSizing(invoiceData, products, payments, sizingYarn);
        },
        updateSizing: async (_: unknown, { invoiceData, products, payments, sizingYarn }: any) => {
            return await sizingService.updateSizing(invoiceData, products, payments, sizingYarn);
        },
        deleteSizing: async (_: unknown, { Id }: any) => {
            const result = await sizingService.deleteSizing(Number(Id));
            if (result.affectedRows > 0) return 'Sizing deleted successfully';
            return 'Sizing not found';
        },
    },
};

