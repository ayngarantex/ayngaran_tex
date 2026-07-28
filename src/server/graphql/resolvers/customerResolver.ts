import * as customerService from '../../services/customerService';

export const customerResolver = {
    Query: {
        customers: async (_: unknown, { search, page, limit, orderBy, startDate, endDate }: any) => {
            return await customerService.getCustomers(search, page, limit, orderBy, startDate, endDate);
        },
        customerPendingPayment: async (_: unknown, { search, startDate, endDate }: any) => {
            return await customerService.customerPendingPayment(search, startDate, endDate);
        },
        customerProducts: async (_: unknown, { CustomerId, productId, foldType }: any) => {
            console.log(CustomerId, productId, foldType)
            return await customerService.customerProducts(CustomerId, productId, foldType);
        },
        customer: async (_: unknown, { CustomerId }: any) => {
            return await customerService.customerById(CustomerId);
        },
        customerCount: async (_: unknown, { search }: any) => {
            return await customerService.getCustomerCount(search);
        },
    },
    Mutation: {
        createCustomer: async (_: unknown, { customerData }: any) => {
            try {
                await customerService.createCustomer(customerData);
                return 'Customer created';
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
        updateCustomer: async (_: unknown, { customerData }: any) => {
            const result = await customerService.updateCustomer(customerData);
            if (result.affectedRows > 0) return 'Customer updated successfully';
            return 'Customer not found';
        },
        updateCustomerProduct: async (_: unknown, { customerData }: any) => {
            const result = await customerService.updateCustomerProduct(customerData);
            if (result) return 'Customer Products updated successfully';
            return 'Customer Products not updated';
        },
        deleteCustomer: async (_: unknown, { CustomerId }: any) => {
            const result = await customerService.deleteCustomer(CustomerId);
            if (result.affectedRows > 0) return 'Customer deleted successfully';
            return 'Customer not found';
        },
    },
};
