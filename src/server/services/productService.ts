import * as repo from '../repositories/productRepositories';

export const getProducts = async (search: any, page: any, limit: any) => {
    return await repo.getProducts(search, page, limit);
};
export const getProductCount = async (search: any) => {
    return await repo.getProductCount(search);
};
export const getProductTotals = async (search: any, productId: any) => {
    console.log("productId - 1 - ", productId)
    return await repo.getProductTotals(search, productId);
};
export const productById = async (id: any) => {
    return await repo.getProductById(id);
};
export const createProduct = async (name: any, type: any, hsncode: any, image: any, tags: any, description: any, details: any, size: any, composition: any, washcare: any) => {
    return await repo.createProduct(name, type, hsncode, image, tags, description, details, size, composition, washcare);
};
export const updateProduct = async (id: any, name: any, type: any, hsncode: any, image: any, tags: any, description: any, details: any, size: any, composition: any, washcare: any) => {
    return await repo.updateProduct(id, name, type, hsncode, image, tags, description, details, size, composition, washcare);
};
export const deleteProduct = async (id: any) => {
    return await repo.deleteProduct(id);
};
