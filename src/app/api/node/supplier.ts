"use server";

import { pageLimit } from "@/app/lib/utils";
import { getSuppliers, getSupplierCount, getSupplierById, createSupplier as createSupplierRepo, updateSupplier as updateSupplierRepo, deleteSupplier as deleteSupplierRepo } from "@/server/repositories/supplierRepositories";

export const fetchSuppliers = async (
    query: string,
    currentPage: number,
    orderBy: string = '',
    type: string = ''
) => {
    try {
        const rows = await getSuppliers(query || null, type || null, currentPage || 1, pageLimit, orderBy || null);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchSuppliers Error:", err);
        return [];
    }
};

export const fetchAllSuppliers = async (type: string = 'All') => {
    try {
        const rows = await getSuppliers(null, type || null, null, null, null);
        return JSON.parse(JSON.stringify(rows));
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
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (err) {
        console.error("fetchSupplierById Error:", err);
        return null;
    }
};

export const createSupplier = async (supplierData: any) => {
    const res = await createSupplierRepo(supplierData);
    return JSON.parse(JSON.stringify(res));
};

export const updateSupplier = async (supplierData: any) => {
    const res = await updateSupplierRepo(supplierData);
    return JSON.parse(JSON.stringify(res));
};

export const deleteSupplier = async (id: number) => {
    const res = await deleteSupplierRepo(id);
    return JSON.parse(JSON.stringify(res));
};