import * as paymentService from '../../services/paymentService';

export const paymentResolver = {
    Query: {
        payments: async (_: unknown, { search, page, limit, startDate, endDate }: any) => {
            return await paymentService.getPayments(search, page, limit, startDate, endDate);
        },
        paymentCount: async (_: unknown, { search, startDate, endDate }: any) => {
            return await paymentService.getPaymentCount(search, startDate, endDate);
        },
        sizingPayments: async (_: unknown, { search, page, limit, startDate, endDate }: any) => {
            return await paymentService.getSizingPayments(search, page, limit, startDate, endDate);
        },
        sizingPaymentCount: async (_: unknown, { search, startDate, endDate }: any) => {
            return await paymentService.getSizingPaymentCount(search, startDate, endDate);
        },
        yarnPayments: async (_: unknown, { search, page, limit, startDate, endDate }: any) => {
            return await paymentService.getYarnPayments(search, page, limit, startDate, endDate);
        },
        yarnPaymentCount: async (_: unknown, { search, startDate, endDate }: any) => {
            return await paymentService.getYarnPaymentCount(search, startDate, endDate);
        },
    },
};
