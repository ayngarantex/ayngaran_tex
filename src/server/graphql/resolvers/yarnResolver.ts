import * as yarnService from '../../services/yarnService';

export const yarnResolver = {
    Query: {
        yarns: async (_: unknown, { search, page, limit, startDate, endDate, billType, orderBy }: any) => {
            return await yarnService.getYarns(search, page, limit, startDate, endDate, billType, orderBy);
        },
        yarnCount: async (_: unknown, { search, startDate, endDate, billType }: any) => {
            return await yarnService.getYarnCount(search, startDate, endDate, billType);
        },
        yarnTotal: async (_: unknown, { search, startDate, endDate, billType, orderBy }: any) => {
            return await yarnService.getYarnTotal(search, startDate, endDate, billType, orderBy);
        },
        yarn: async (_: unknown, { Id }: any) => {
            return await yarnService.getYarnById(Number(Id));
        },
    },
    Mutation: {
        createYarn: async (_: unknown, { invoiceData, products, payments }: any) => {
            return await yarnService.createYarn(invoiceData, products, payments);
        },
        updateYarn: async (_: unknown, { invoiceData, products, payments }: any) => {
            return await yarnService.updateYarn(invoiceData, products, payments);
        },
        deleteYarn: async (_: unknown, { Id }: any) => {
            const result = await yarnService.deleteYarn(Number(Id));
            if (result.affectedRows > 0) return 'Yarn deleted successfully';
            return 'Yarn not found';
        },
    },
};
