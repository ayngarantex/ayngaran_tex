import * as productService from '../../services/productService';

export const productResolver = {
    Query: {
        products: async (_: unknown, { search, page, limit }: any) => {
            return await productService.getProducts(search, page, limit);
        },
        product: async (_: unknown, { Id }: any) => {
            return await productService.productById(Id);
        },
        productCount: async (_: unknown, { search }: any) => {
            return await productService.getProductCount(search);
        },
        productTotals: async (_: unknown, { search, productId }: any) => {
            return await productService.getProductTotals(search, productId);
        },
    },
    Mutation: {
        createProduct: async (_: unknown, { productData }: any) => {
            try {
                await productService.createProduct(
                    productData.Name,
                    productData.Type,
                    productData.HSNCode,
                    productData.Image,
                    productData.Tags,
                    productData.Description,
                    productData.Details,
                    productData.Size,
                    productData.Composition,
                    productData.WashCare
                );
                return 'Product created';
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
        updateProduct: async (_: unknown, { productData }: any) => {
            const { Id, Name, HSNCode, Type, Image, Tags, Description, Details, Size, Composition, WashCare } = productData;
            const result = await productService.updateProduct(Id, Name, Type, HSNCode, Image, Tags, Description, Details, Size, Composition, WashCare);
            if (result.affectedRows > 0) return 'Product updated successfully';
            return 'Product not found';
        },
        deleteProduct: async (_: unknown, { Id }: any) => {
            const result = await productService.deleteProduct(Id);
            if (result.affectedRows > 0) return 'Product deleted successfully';
            return 'Product not found';
        },
    },
};
