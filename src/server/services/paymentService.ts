import * as repo from '../repositories/paymentRepositories';

export const getPayments = async (
    search: string | null,
    page: number | null,
    limit: number | null,
    startDate: string | null,
    endDate: string | null
) => {
    return await repo.getPayments(search, page, limit, startDate, endDate);
};

export const getPaymentCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null
) => {
    return await repo.getPaymentCount(search, startDate, endDate);
};
