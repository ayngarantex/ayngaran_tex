import * as supplierService from '../../services/supplierService';

export const supplierResolver = {
    Query: {
        suppliers: async (_: unknown, { search, type, page, limit, orderBy }: any) => {
            return await supplierService.getSuppliers(search, type, page, limit, orderBy);
        },
        supplierCount: async (_: unknown, { search, type }: any) => {
            return await supplierService.getSupplierCount(search, type);
        },
        supplier: async (_: unknown, { Id }: any) => {
            return await supplierService.getSupplierById(Number(Id));
        },
    },
    Mutation: {
        createSupplier: async (_: unknown, { supplierData }: any) => {
            return await supplierService.createSupplier(supplierData);
        },
        updateSupplier: async (_: unknown, { supplierData }: any) => {
            return await supplierService.updateSupplier(supplierData);
        },
        deleteSupplier: async (_: unknown, { SupplierId }: any) => {
            const result = await supplierService.deleteSupplier(Number(SupplierId));
            if (result.affectedRows > 0) return 'Supplier deleted successfully';
            return 'Supplier not found';
        },
    },
};

