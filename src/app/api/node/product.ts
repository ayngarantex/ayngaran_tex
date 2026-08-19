"use server";

import { pageLimit } from "@/app/lib/utils";
import { getProducts, getProductCount, getProductById, getProductTotals, createProduct as createProductRepo, updateProduct as updateProductRepo, deleteProduct as deleteProductRepo } from "@/server/repositories/productRepositories";

export const fetchProducts = async (
    query: string,
    currentPage: number
) => {
    try {
        const rows = await getProducts(query || null, currentPage || 1, pageLimit);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchProducts Error:", err);
        return [];
    }
};

export const fetchProductTotals = async (
    query: string,
    productId: string
) => {
    try {
        const totals = await getProductTotals(query || null, productId || null);
        return JSON.parse(JSON.stringify(totals));
    } catch (err) {
        console.error("fetchProductTotals Error:", err);
        return { TotalStock: 0, SoldCount: 0, AvailableStock: 0 };
    }
};

export const fetchProductCount = async (
    query: string
) => {
    try {
        const count = await getProductCount(query || null);
        return count || 0;
    } catch (err) {
        console.error("fetchProductCount Error:", err);
        return 0;
    }
};

export const fetchProductById = async (id: string) => {
    try {
        const data = await getProductById(id);
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (err) {
        console.error("fetchProductById Error:", err);
        return null;
    }
};

export const createProduct = async (productData: any) => {
    const res = await createProductRepo(
        productData.Name,
        productData.Type || null,
        productData.HSNCode || null,
        productData.Image || null,
        productData.Tags || null,
        productData.Description || null,
        productData.Details || null,
        productData.Size || null,
        productData.Composition || null,
        productData.WashCare || null
    );
    return JSON.parse(JSON.stringify(res));
};

export const updateProduct = async (productData: any) => {
    const res = await updateProductRepo(
        productData.Id,
        productData.Name,
        productData.Type || null,
        productData.HSNCode || null,
        productData.Image || null,
        productData.Tags || null,
        productData.Description || null,
        productData.Details || null,
        productData.Size || null,
        productData.Composition || null,
        productData.WashCare || null
    );
    return JSON.parse(JSON.stringify(res));
};

export const deleteProduct = async (
    Id: string
) => {
    const res = await deleteProductRepo(Id);
    return JSON.parse(JSON.stringify(res));
};
