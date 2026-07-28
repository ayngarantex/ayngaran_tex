import * as paymentService from '../../services/paymentService';

export const paymentResolver = {
    Query: {
        payments: async (_: unknown, { search, page, limit, startDate, endDate }: any) => {
            return await paymentService.getPayments(search, page, limit, startDate, endDate);
        },
        paymentCount: async (_: unknown, { search, startDate, endDate }: any) => {
            return await paymentService.getPaymentCount(search, startDate, endDate);
        },
    },
};
