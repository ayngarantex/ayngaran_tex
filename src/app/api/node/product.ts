import { pageLimit } from "@/app/lib/utils";

export const fetchNodeProducts = async (
    query: string,
    currentPage: number
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetProducts(
                        $search: String,
                        $page: Int,
                        $limit: Int
                    ) {
                        products(
                            search: $search,
                            page: $page,
                            limit: $limit
                        ) {
                            Id
                            Name
                            HSNCode
                            Type
                            Image
                            Tags
                            Description
                            Details
                            Size
                            Composition
                            WashCare
                            AvailableStock
                            TotalStock
                            SoldCount
                        }
                    }
                `,
                variables: {
                    search: query,
                    page: currentPage,
                    limit: pageLimit
                }
            })
        }
    );

    const result = await response.json();

    return result.data.products;
};

export const fetchNodeProductTotals = async (
    query: string,
    productId: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
          query GetProductTotals(
            $search: String,
            $productId: String
          ) {
            productTotals(search: $search, productId: $productId) {
              TotalStock
              SoldCount
              AvailableStock
            }
          }
        `,
                variables: {
                    search: query,
                    productId: productId
                }
            })
        }
    );

    const result = await response.json();
    console.log("result", result)

    return result.data.productTotals;
};

export const fetchNodeProductCount = async (
    query: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
          query GetProductCount(
            $search: String
          ) {
            productCount(search: $search)
          }
        `,
                variables: {
                    search: query
                }
            })
        }
    );

    const result = await response.json();

    return result.data.productCount;
};

export const fetchNodeProductById = async (id: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetProductById(
                        $Id: ID!
                    ) {
                        product(Id: $Id) {
                            Id,
                            Name,
                            Type,
                            HSNCode,
                            Image,
                            Tags,
                            Description,
                            Details,
                            Size,
                            Composition,
                            WashCare,
                            AvailableStock,
                            TotalStock,
                            SoldCount
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

    return result.data.product;
};

export const createNodeProduct = async (productData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation CreateProduct(
                        $Name: String!,
                        $HSNCode: String,
                        $Type: String,
                        $Image: String,
                        $Tags: String,
                        $Description: String,
                        $Details: String,
                        $Size: String,
                        $Composition: String,
                        $WashCare: String
                    ) {
                        createProduct(
                            productData:{
                                Name:$Name,
                                HSNCode:$HSNCode,
                                Type:$Type,
                                Image:$Image,
                                Tags:$Tags,
                                Description:$Description,
                                Details:$Details,
                                Size:$Size,
                                Composition:$Composition,
                                WashCare:$WashCare
                            }
                        )
                    }
                `,
                variables: {
                    Name: productData.Name,
                    HSNCode: productData.HSNCode,
                    Type: productData.Type,
                    Image: productData.Image,
                    Tags: productData.Tags,
                    Description: productData.Description,
                    Details: productData.Details,
                    Size: productData.Size,
                    Composition: productData.Composition,
                    WashCare: productData.WashCare
                }
            })
        }
    );

    const result = await response.json();

    return result;
};

export const updateProduct = async (productData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation UpdateProduct(
                        $Id: ID!,
                        $Name: String!,
                        $HSNCode: String,
                        $Type: String,
                        $Image: String,
                        $Tags: String,
                        $Description: String,
                        $Details: String,
                        $Size: String,
                        $Composition: String,
                        $WashCare: String
                    ) {
                        updateProduct(
                            productData:{
                                Id: $Id,
                                Name:$Name,
                                HSNCode:$HSNCode,
                                Type:$Type,
                                Image:$Image,
                                Tags:$Tags,
                                Description:$Description,
                                Details:$Details,
                                Size:$Size,
                                Composition:$Composition,
                                WashCare:$WashCare
                            }
                        )
                    }
                `,
                variables: {
                    Id: productData.Id,
                    Name: productData.Name,
                    HSNCode: productData.HSNCode,
                    Type: productData.Type,
                    Image: productData.Image,
                    Tags: productData.Tags,
                    Description: productData.Description,
                    Details: productData.Details,
                    Size: productData.Size,
                    Composition: productData.Composition,
                    WashCare: productData.WashCare
                }
            })
        }
    );

    const result = await response.json();

    return result;
};

export const deleteProduct = async (
    Id: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation DeleteProduct($Id: ID!) {
                        deleteProduct(Id: $Id)
                    }
                `,
                variables: {
                    Id
                }
            })
        }
    );

    const result = await response.json();

    return result.data.deleteProduct;
};


