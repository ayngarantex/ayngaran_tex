import * as invoiceRepo from '../repositories/invoiceRepositories';

export const getInvoices = async (search: any, startDate: any, endDate: any, billType: any, orderBy: any, page: any, limit: any) => {
    return await invoiceRepo.getInvoices(search, startDate, endDate, billType, orderBy, page, limit);
};
export const getInvoicesCount = async (search: any, startDate: any, endDate: any, billType: any, orderBy: any) => {
    return await invoiceRepo.getInvoicesCount(search, startDate, endDate, billType, orderBy);
};
export const getInvoice = async (id: any) => {
    return await invoiceRepo.getInvoice(id);
};
export const deleteInvoice = async (id: any) => {
    return await invoiceRepo.deleteInvoice(id);
};
export const createInvoice = async (invoiceData: any) => {
    return await invoiceRepo.createInvoice(invoiceData);
};
export const updateInvoice = async (invoiceData: any) => {
    return await invoiceRepo.updateInvoice(invoiceData);
};
export const getCustomerInvoices = async (CustomerId: any, startDate: any, endDate: any, billType: any) => {
    return await invoiceRepo.getCustomerInvoices(CustomerId, startDate, endDate, billType);
};
export const getCustomerPayments = async (CustomerId: any, startDate: any, endDate: any, billType: any) => {
    return await invoiceRepo.getCustomerPayments(CustomerId, startDate, endDate, billType);
};
export const getInvoicesTotal = async (search: any, startDate: any, endDate: any, billType: any, orderBy: any) => {
    return await invoiceRepo.getInvoicesTotal(search, startDate, endDate, billType, orderBy);
};
export const getLastInvoiceNumber = async (billType: any) => {
    return await invoiceRepo.getLastInvoiceNumber(billType);
};
