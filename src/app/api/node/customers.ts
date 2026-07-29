"use server";

import { pageLimit } from "@/app/lib/utils";
import { getCustomers, customerPendingPayment, getCustomerCount, getCustomerById, customerProducts, createCustomer as createCustomerRepo, updateCustomer as updateCustomerRepo, updateCustomerProduct as updateCustomerProductRepo, deleteCustomer as deleteCustomerRepo } from "@/server/repositories/customerRepositories";

export const fetchCustomers = async (
    query: string,
    currentPage: number,
    orderBy: string,
    startDate: string,
    endDate: string,
    limit?: number | null
) => {
    try {
        const rows = await getCustomers(query || "", currentPage || 1, limit === undefined ? pageLimit : limit, orderBy || null, startDate || null, endDate || null);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchCustomers Error:", err);
        return [];
    }
};

export const fetchTotalPending = async (
    query: string,
    startDate: string,
    endDate: string
) => {
    try {
        const pending = await customerPendingPayment(query || "", startDate || null, endDate || null);
        return pending || 0;
    } catch (err) {
        console.error("fetchTotalPending Error:", err);
        return 0;
    }
};

export const fetchCustomerCount = async (
    query: string
) => {
    try {
        const count = await getCustomerCount(query || "");
        return count || 0;
    } catch (err) {
        console.error("fetchCustomerCount Error:", err);
        return 0;
    }
};

export const fetchCustomerById = async (id: string) => {
    try {
        const data = await getCustomerById(id);
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (err) {
        console.error("fetchCustomerById Error:", err);
        return null;
    }
};

export const createCustomer = async (customerData: any) => {
    const res = await createCustomerRepo(customerData);
    return JSON.parse(JSON.stringify(res));
};

export const updateCustomer = async (customerData: any) => {
    const res = await updateCustomerRepo(customerData);
    return JSON.parse(JSON.stringify(res));
};

export const updateCustomerProduct = async (customerData: any) => {
    const res = await updateCustomerProductRepo(customerData);
    return JSON.parse(JSON.stringify(res));
};

export const fetchProductsWithCode = async (id: any, productId?: any, foldType?: any) => {
    try {
        const rows = await customerProducts(id, productId, foldType);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchProductsWithCode Error:", err);
        return [];
    }
};

export const deleteCustomer = async (id: string) => {
    const res = await deleteCustomerRepo(id);
    return JSON.parse(JSON.stringify(res));
};