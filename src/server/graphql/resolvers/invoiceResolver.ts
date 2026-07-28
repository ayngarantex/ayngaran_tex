import * as service from '../../services/invoiceService';

export const invoiceResolver = {
    Query: {
        invoices: async (_: unknown, { search, startDate, endDate, billType, orderBy, page, limit }: any) => {
            return await service.getInvoices(search, startDate, endDate, billType, orderBy, page, limit);
        },
        invoice: async (_: unknown, { Id }: any) => {
            return await service.getInvoice(Id);
        },
        invoicesCount: async (_: unknown, { search, startDate, endDate, billType, orderBy }: any) => {
            return await service.getInvoicesCount(search, startDate, endDate, billType, orderBy);
        },
        invoicesTotal: async (_: unknown, { search, startDate, endDate, billType, orderBy }: any) => {
            return await service.getInvoicesTotal(search, startDate, endDate, billType, orderBy);
        },
        lastInvoiceNumber: async (_: unknown, { billType }: any) => {
            return await service.getLastInvoiceNumber(billType);
        },
        customerInvoices: async (_: unknown, { CustomerId, startDate, endDate, billType }: any) => {
            return await service.getCustomerInvoices(CustomerId, startDate, endDate, billType);
        },
        customerPayments: async (_: unknown, { CustomerId, startDate, endDate, billType }: any) => {
            return await service.getCustomerPayments(CustomerId, startDate, endDate, billType);
        },
    },
    Mutation: {
        createInvoice: async (_: unknown, { invoiceData }: any) => {
            try {
                await service.createInvoice(invoiceData);
                return 'Invoice created successfully';
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
        updateInvoice: async (_: unknown, { invoiceData }: any) => {
            try {
                await service.updateInvoice(invoiceData);
                return 'Invoice updated successfully';
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
        deleteInvoice: async (_: unknown, { Id }: any) => {
            const result = await service.deleteInvoice(Id);
            if (result.affectedRows > 0) return 'Invoice deleted successfully';
            return 'Invoice not found';
        },
    },
};
