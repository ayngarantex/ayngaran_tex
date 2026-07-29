"use server";

import { pageLimit } from "@/app/lib/utils";

export const fetchSuppliers = async (
    query: string,
    currentPage: number,
    orderBy: string,
    type: string = "All"
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
                    query GetSuppliers(
                        $search: String,
                        $type: String,
                        $page: Int,
                        $limit: Int,
                        $orderBy: String
                    ) {
                        suppliers(
                            search: $search,
                            type: $type,
                            page: $page,
                            limit: $limit,
                            orderBy: $orderBy
                        ) {
                            SupplierId
                            Name
                            GstNumber
                            Adress
                            State
                            Phone
                            Mobile
                            Agent
                            AccountNumber
                            Bank
                            IfscCode
                            Type
                            pendingAmount
                        }
                    }
                `,
                variables: {
                    search: query,
                    type: type,
                    page: currentPage,
                    limit: pageLimit,
                    orderBy: orderBy
                }
            })
        }
    );

    const result = await response.json();
    return result.data?.suppliers || [];
};

export const fetchSupplierPages = async (query: string, type: string = "All") => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    query GetSupplierPages($search: String, $type: String) {
                        supplierCount(search: $search, type: $type)
                    }
                `,
                variables: {
                    search: query,
                    type: type
                }
            })
        }
    );

    const result = await response.json();
    const count = result.data?.supplierCount || 0;
    return Math.ceil(count / pageLimit);
};

export const fetchSupplierById = async (id: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    query GetSupplierById($id: ID!) {
                        supplier(Id: $id) {
                            SupplierId
                            Name
                            GstNumber
                            Adress
                            State
                            Phone
                            Mobile
                            Agent
                            AccountNumber
                            Bank
                            IfscCode
                            Type
                        }
                    }
                `,
                variables: { id: String(id) }
            })
        }
    );

    const result = await response.json();
    const supplier = result.data?.supplier;
    return supplier ? [supplier] : [];
};

export const fetchAllSuppliers = async (type: string = "All") => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    query GetAllSuppliers($type: String) {
                        suppliers(type: $type) {
                            SupplierId
                            Name
                            Type
                        }
                    }
                `,
                variables: { type }
            })
        }
    );

    const result = await response.json();
    return result.data?.suppliers || [];
};

export const createSupplier = async (supplierData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation CreateSupplier($supplierData: SupplierInput!) {
                        createSupplier(supplierData: $supplierData) {
                            SupplierId
                            Name
                        }
                    }
                `,
                variables: { supplierData }
            })
        }
    );

    const result = await response.json();
    return result.data?.createSupplier;
};

export const updateSupplier = async (supplierData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation UpdateSupplier($supplierData: SupplierInput!) {
                        updateSupplier(supplierData: $supplierData) {
                            SupplierId
                            Name
                        }
                    }
                `,
                variables: { supplierData }
            })
        }
    );

    const result = await response.json();
    return result.data?.updateSupplier;
};

export const deleteSupplier = async (id: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation DeleteSupplier($id: ID!) {
                        deleteSupplier(SupplierId: $id)
                    }
                `,
                variables: { id: String(id) }
            })
        }
    );

    const result = await response.json();
    return result.data?.deleteSupplier;
};