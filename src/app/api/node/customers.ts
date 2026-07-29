"use server";

import { pageLimit } from "@/app/lib/utils";

export const fetchCustomers = async (
    query: string,
    currentPage: number,
    orderBy: string,
    startDate: string,
    endDate: string,
    limit?: number | null
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
                    query GetCustomers(
                        $search: String,
                        $orderBy: String,
                        $page: Int,
                        $limit: Int,
                        $startDate: String,
                        $endDate: String
                    ) {
                        customers(
                            search: $search,
                            orderBy: $orderBy,
                            page: $page,
                            limit: $limit,
                            startDate: $startDate,
                            endDate: $endDate
                        ) {
                            CustomerId
                            CustomerName
                            GstNumber
                            Address
                            Address2
                            State
                            Phone
                            Mobile
                            Agent
                            customer_product_code
                            pending
                            invoices {
                                InvoiceNumber
                                InvoiceDate
                                InvoiceAmount
                                ReceivedAmount
                            }
                        }
                    }
                `,
                variables: {
                    search: query,
                    orderBy: orderBy,
                    page: currentPage,
                    limit: limit === undefined ? pageLimit : limit,
                    startDate: startDate,
                    endDate: endDate
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.customers;
};

export const fetchTotalPending = async (
    query: string,
    startDate: string,
    endDate: string
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
                    query GetCustomerPendingPayment(
                        $search: String,
                        $startDate: String,
                        $endDate: String
                    ) {
                        customerPendingPayment(
                            search: $search,
                            startDate: $startDate,
                            endDate: $endDate
                        )
                    }
                `,
                variables: {
                    search: query,
                    startDate: startDate,
                    endDate: endDate
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.customerPendingPayment;
};

export const fetchCustomerCount = async (
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
                    query GetCustomerCount(
                        $search: String
                    ) {
                        customerCount(search: $search)
                    }
                `,
                variables: {
                    search: query
                }
            })
        }
    );

    const result = await response.json();

    return result.data.customerCount;
};

export const fetchCustomerById = async (id: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetCustomerById(
                        $CustomerId: ID!
                    ) {
                        customer(CustomerId: $CustomerId) {
                            CustomerId,
                            CustomerName,
                            GstNumber,
                            Address,
                            Address2,
                            State,
                            Phone,
                            Mobile,
                            Agent,
                            customer_product_code
                        }
                    }
                `,
                variables: {
                    CustomerId: id
                }
            })
        }
    );

    const result = await response.json();

    return result.data.customer;
};

export const createCustomer = async (customerData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation CreateCustomer($customerData: CustomerInput!) {
                        createCustomer(customerData: $customerData)
                    }
                `,
                variables: {
                    customerData
                }
            })
        }
    );

    const result = await response.json();

    return result;
};

export const updateCustomer = async (customerData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation UpdateCustomer($customerData: CustomerInput!) {
                        updateCustomer(customerData: $customerData)
                    }
                `,
                variables: {
                    customerData
                }
            })
        }
    );

    const result = await response.json();

    return result;
};

export const updateCustomerProduct = async (customerData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation UpdateCustomerProduct($customerData: CustomerProductInput!) {
                        updateCustomerProduct(customerData: $customerData)
                    }
                `,
                variables: {
                    customerData
                }
            })
        }
    );

    const result = await response.json();

    return result;
};

export const fetchProductsWithCode = async (id: any, productId?: any, foldType?: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetCustomerProducts($CustomerId: ID!, $productId: Int, $foldType: String) {
                        customerProducts(CustomerId: $CustomerId, productId: $productId, foldType: $foldType) {
                            Id
                            Name
                            HSNCode
                            ProductCode
                            ProductPrice
                            ProductSoldQuantity
                            PurchaseType
                            Type
                        }
                    }
                `,
                variables: {
                    CustomerId: id,
                    productId: productId,
                    foldType: foldType
                }
            })
        }
    );


    const result = await response.json();
    console.log("result", result)

    return result?.data?.customerProducts;
}

export const deleteCustomer = async (id: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation DeleteCustomer($CustomerId: ID!) {
                        deleteCustomer(CustomerId: $CustomerId)
                    }
                `,
                variables: {
                    CustomerId: id
                }
            })
        }
    );

    const result = await response.json();

    return result;
};