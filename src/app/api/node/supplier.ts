"use server";

import { pageLimit } from "@/app/lib/utils";
import { getSuppliers, getSupplierCount, getSupplierById, createSupplier as createSupplierRepo, updateSupplier as updateSupplierRepo, deleteSupplier as deleteSupplierRepo } from "@/server/repositories/supplierRepositories";

export const fetchSuppliers = async (
    query: string,
    currentPage: number,
    type: string = '',
    orderBy: string = ''
) => {
    try {
        return await getSuppliers(query || null, type || null, currentPage || 1, pageLimit, orderBy || null);
    } catch (err) {
        console.error("fetchSuppliers Error:", err);
        return [];
    }
};

export const fetchAllSuppliers = async (type: string = 'All') => {
    try {
        return await getSuppliers(null, type || null, null, null, null);
    } catch (err) {
        console.error("fetchAllSuppliers Error:", err);
        return [];
    }
};

export const fetchSupplierPages = async (
    query: string = '',
    type: string = ''
) => {
    try {
        const count = await getSupplierCount(query || null, type || null);
        const totalPages = Math.ceil(Number(count) / pageLimit);
        return totalPages;
    } catch (err) {
        console.error("fetchSupplierPages Error:", err);
        return 0;
    }
};

export const fetchSupplierById = async (id: number) => {
    try {
        const data = await getSupplierById(id);
        return data ? [data] : [];
    } catch (err) {
        console.error("fetchSupplierById Error:", err);
        return [];
    }
};

export const createSupplier = async (supplierData: any) => {
    return await createSupplierRepo(supplierData);
};

export const updateSupplier = async (supplierData: any) => {
    return await updateSupplierRepo(supplierData);
};

export const deleteSupplier = async (id: number) => {
    return await deleteSupplierRepo(id);
};