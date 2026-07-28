export const fetchStockEntries = async (productId?: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    query GetStockEntries($productId: ID) {
                        stockEntries(productId: $productId) {
                            Id
                            ProductId
                            Quantity
                            EntryDate
                            Notes
                            ProductName
                        }
                    }
                `,
                variables: {
                    productId: productId || null
                }
            })
        }
    );
    const result = await response.json();
    return result?.data?.stockEntries || [];
};

export const fetchStockEntryById = async (id: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    query GetStockEntryById($Id: ID!) {
                        stockEntry(Id: $Id) {
                            Id
                            ProductId
                            Quantity
                            EntryDate
                            Notes
                        }
                    }
                `,
                variables: {
                    Id: id
                }
            })
        }
    );
    const result = await response.json();
    return result?.data?.stockEntry;
};

export const createStockEntry = async (stockData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation CreateStockEntry(
                        $ProductId: Int!,
                        $Quantity: Int!,
                        $EntryDate: String!,
                        $Notes: String
                    ) {
                        createStockEntry(
                            stockData: {
                                ProductId: $ProductId,
                                Quantity: $Quantity,
                                EntryDate: $EntryDate,
                                Notes: $Notes
                            }
                        )
                    }
                `,
                variables: {
                    ProductId: stockData.ProductId,
                    Quantity: stockData.Quantity,
                    EntryDate: stockData.EntryDate,
                    Notes: stockData.Notes
                }
            })
        }
    );
    const result = await response.json();
    return result;
};

export const updateStockEntry = async (stockData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation UpdateStockEntry(
                        $Id: ID!,
                        $ProductId: Int!,
                        $Quantity: Int!,
                        $EntryDate: String!,
                        $Notes: String
                    ) {
                        updateStockEntry(
                            stockData: {
                                Id: $Id,
                                ProductId: $ProductId,
                                Quantity: $Quantity,
                                EntryDate: $EntryDate,
                                Notes: $Notes
                            }
                        )
                    }
                `,
                variables: {
                    Id: stockData.Id,
                    ProductId: stockData.ProductId,
                    Quantity: stockData.Quantity,
                    EntryDate: stockData.EntryDate,
                    Notes: stockData.Notes
                }
            })
        }
    );
    const result = await response.json();
    return result;
};

export const deleteStockEntry = async (id: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation DeleteStockEntry($Id: ID!) {
                        deleteStockEntry(Id: $Id)
                    }
                `,
                variables: {
                    Id: id
                }
            })
        }
    );
    const result = await response.json();
    return result;
};
