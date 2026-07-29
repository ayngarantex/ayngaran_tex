"use server";

import { pageLimit } from "@/app/lib/utils";

export const fetchInvoices = async (
    query: string,
    currentPage: number,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string,
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
                    query GetInvoices(
                        $search: String,
                        $page: Int,
                        $limit: Int,
                        $startDate: String,
                        $endDate: String,
                        $billType: String,
                        $orderBy: String
                    ) {
                        invoices(
                            search: $search,
                            page: $page,
                            limit: $limit,
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType,
                            orderBy: $orderBy,
                        ) {
                            InvoiceId,
                            InvoiceNumber,
                            InvoiceDate,
                            EwayBillNumber,
                            BillType,
                            InvoiceType,
                            BeforeTax,
                            Cgst,
                            Sgst,
                            Igst,
                            InvoiceAmount,
                            ReceivedAmount,
                            CustomerId
                            CustomerName,
                            CustomerMobile,
                            GstNumber,
                            BalanceAmount,
                            IsCancel,
                            CancelReason,
                            invoice_details {
                                InvoiceDetailId,
                                ProductName,
                                Quantity,
                                Price,
                                Total,
                                Type
                                products {
                                    Name,
                                    HSNCode,
                                    Type
                                }
                            }
                            invoice_payments {
                                Id,
                                Date,
                                Amount,
                                Type
                            }
                        }
                    }
                `,
                variables: {
                    search: query,
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType,
                    orderBy: orderBy,
                    page: currentPage,
                    limit: limit === undefined ? pageLimit : limit,
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.invoices || [];
};

export const fetchInvoicesCount = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
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
                    query GetInvoicesCount(
                        $search: String,
                        $startDate: String,
                        $endDate: String,
                        $billType: String,
                        $orderBy: String
                    ) {
                        invoicesCount(
                            search: $search,
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType,
                            orderBy: $orderBy,
                        )
                    }
                `,
                variables: {
                    search: query,
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType,
                    orderBy: orderBy,
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.invoicesCount;
};

export const fetchInvoiceTotal = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string,
    orderBy: string
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
                    query GetInvoicesTotal(
                        $search: String,
                        $startDate: String,
                        $endDate: String,
                        $billType: String,
                        $orderBy: String
                    ) {
                        invoicesTotal(
                            search: $search,
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType,
                            orderBy: $orderBy,
                        ) {
                            TotalInvoiceAmount,
                            TotalReceivedAmount,
                            TotalBalanceAmount,
                            TotalCancelledAmount
                        }
                    }
                `,
                variables: {
                    search: query,
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType,
                    orderBy: orderBy
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.invoicesTotal || [];
};

export const fetchInvoiceById = async (id: Number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetInvoiceById(
                        $Id: ID!
                    ) {
                        invoice(Id: $Id) {
                            InvoiceId,
                            InvoiceNumber,
                            InvoiceDate,
                            BillType,
                            InvoiceType,
                            InvoiceAmount,
                            ReceivedAmount,
                            CustomerId,
                            EwayBillNumber,
                            BeforeTax,
                            TaxPercentage,
                            Cgst,
                            Sgst,
                            Igst,
                            AfterTax,
                            RoundOff,
                            Discount,
                            IsCancel,
                            CancelReason,
                            invoice_details {
                                InvoiceDetailId,
                                ItemId,
                                ProductName,
                                Quantity,
                                QuantityType,
                                Price,
                                Total,
                                Type,
                                FoldedType
                                products {
                                    Name,
                                    HSNCode,
                                    Type
                                }
                            }
                            invoice_return_details {
                                InvoiceReturnDetailId,
                                ItemId,
                                ProductName,
                                Quantity,
                                QuantityType,
                                Price,
                                Total,
                                Type
                                products {
                                    Name,
                                    HSNCode,
                                    Type
                                }
                            }
                            invoice_payments {
                                Id,
                                Date,
                                Amount,
                                Type,
                                ReceivedBy,
                            }
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

    return result.data.invoice;
};

export const fetchLastInvoiceNumber = async (billType: String) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetLastInvoiceNumber($billType: String!) {
                        lastInvoiceNumber(billType: $billType)
                    }
                `,
                variables: {
                    billType: billType
                }
            })
        }
    );

    const result = await response.json();

    return result.data.lastInvoiceNumber;
}

export const createInvoice = async (invoiceData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation CreateInvoice($invoiceData: InvoiceInput!) {
                        createInvoice(invoiceData: $invoiceData)
                    }
                `,
                variables: {
                    invoiceData
                }
            })
        }
    );

    const result = await response.json();

    return result;
};

export const updateInvoice = async (invoiceData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation UpdateInvoice($invoiceData: InvoiceInput!) {
                        updateInvoice(invoiceData: $invoiceData)
                    }
                `,
                variables: {
                    invoiceData
                }
            })
        }
    );

    const result = await response.json();

    return result;
};

export const deleteInvoice = async (
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
                    mutation DeleteInvoice($Id: ID!) {
                        deleteInvoice(Id: $Id)
                    }
                `,
                variables: {
                    Id
                }
            })
        }
    );

    const result = await response.json();

    return result.data.deleteInvoice;
};

export const fetchCustomerInvoices = async (id: any, startDate: string, endDate: string, billType: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetCustomerInvoices($CustomerId: ID!, $startDate: String!, $endDate: String!, $billType: String!) {
                        customerInvoices(CustomerId: $CustomerId, startDate: $startDate, endDate: $endDate, billType: $billType) {
                            InvoiceId,
                            InvoiceNumber,
                            InvoiceDate,
                            BillType,
                            InvoiceType,
                            InvoiceAmount,
                            ReceivedAmount,
                            BalanceAmount,
                            EwayBillNumber,
                            IsCancel,
                            invoice_details {
                                InvoiceDetailId,
                                ProductName,
                                Quantity,
                                Price,
                                Total,
                                Type
                                products {
                                    Name,
                                    HSNCode,
                                    Type
                                }
                            }
                        }
                    }
                `,
                variables: {
                    CustomerId: id,
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType
                }
            })
        }
    );


    const result = await response.json();

    return result?.data?.customerInvoices;
}

export const fetchCustomerPayments = async (id: any, startDate: string, endDate: string, billType: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetCustomerPayments($CustomerId: ID!, $startDate: String!, $endDate: String!, $billType: String!) {
                        customerPayments(CustomerId: $CustomerId, startDate: $startDate, endDate: $endDate, billType: $billType) {
                            Id,
                            Date,
                            Amount,
                            Type,
                            ReceivedBy,
                            InvoiceNumber,
                            BillType
                        }
                    }
                `,
                variables: {
                    CustomerId: id,
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType
                }
            })
        }
    );


    const result = await response.json();

    return result?.data?.customerPayments;
}