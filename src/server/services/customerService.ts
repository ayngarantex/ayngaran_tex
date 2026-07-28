import * as repo from '../repositories/customerRepositories';

export const getCustomers = async (search: any, page: any, limit: any, orderBy: any, startDate: any, endDate: any) => {
    return await repo.getCustomers(search, page, limit, orderBy, startDate, endDate);
};
export const customerPendingPayment = async (search: any, startDate: any, endDate: any) => {
    return await repo.customerPendingPayment(search, startDate, endDate);
};
export const customerProducts = async (CustomerId: any, ProductId: any, FoldType: any) => {
    return await repo.customerProducts(CustomerId, ProductId, FoldType);
};
export const getCustomerCount = async (search: any) => {
    return await repo.getCustomerCount(search);
};
export const customerById = async (id: any) => {
    return await repo.getCustomerById(id);
};
export const createCustomer = async (customerData: any) => {
    return await repo.createCustomer(customerData);
};
export const updateCustomer = async (customerData: any) => {
    return await repo.updateCustomer(customerData);
};
export const updateCustomerProduct = async (CustomerData: any) => {
    return await repo.updateCustomerProduct(CustomerData);
};
export const deleteCustomer = async (id: any) => {
    return await repo.deleteCustomer(id);
};
