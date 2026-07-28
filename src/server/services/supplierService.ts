import * as repo from '../repositories/supplierRepositories';

export const getSuppliers = async (search: any, type: any, page: any, limit: any, orderBy: any) => {
    return await repo.getSuppliers(search, type, page, limit, orderBy);
};

export const getSupplierCount = async (search: any, type: any) => {
    return await repo.getSupplierCount(search, type);
};

export const getSupplierById = async (id: number) => {
    return await repo.getSupplierById(id);
};

export const createSupplier = async (supplierData: any) => {
    return await repo.createSupplier(supplierData);
};

export const updateSupplier = async (supplierData: any) => {
    return await repo.updateSupplier(supplierData);
};

export const deleteSupplier = async (id: number) => {
    return await repo.deleteSupplier(id);
};

