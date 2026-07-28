import * as stockService from '../../services/stockService';

export const stockResolver = {
    Query: {
        stockEntries: async (_: unknown, { productId }: any) => {
            try {
                if (productId) {
                    return await stockService.getStockEntriesByProductId(Number(productId));
                } else {
                    return await stockService.getAllStockEntries();
                }
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
        stockEntry: async (_: unknown, { Id }: any) => {
            try {
                return await stockService.getStockEntryById(Number(Id));
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
    },
    Mutation: {
        createStockEntry: async (_: unknown, { stockData }: any) => {
            try {
                await stockService.createStockEntry(
                    Number(stockData.ProductId),
                    Number(stockData.Quantity),
                    stockData.EntryDate,
                    stockData.Notes
                );
                return 'Stock entry created';
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
        updateStockEntry: async (_: unknown, { stockData }: any) => {
            try {
                const result = await stockService.updateStockEntry(
                    Number(stockData.Id),
                    Number(stockData.Quantity),
                    stockData.EntryDate,
                    stockData.Notes
                );
                if (result.affectedRows > 0) return 'Stock entry updated successfully';
                return 'Stock entry not found';
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
        deleteStockEntry: async (_: unknown, { Id }: any) => {
            try {
                const result = await stockService.deleteStockEntry(Number(Id));
                if (result.affectedRows > 0) return 'Stock entry deleted successfully';
                return 'Stock entry not found';
            } catch (error: any) {
                throw new Error(error.message);
            }
        },
    },
};
