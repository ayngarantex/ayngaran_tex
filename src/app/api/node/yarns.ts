import { pageLimit } from "@/app/lib/utils";

export const fetchYarns = async (
    query: string,
    currentPage: number,
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
                    query GetYarns(
                        $search: String,
                        $page: Int,
                        $limit: Int,
                        $startDate: String,
                        $endDate: String,
                        $billType: String,
                        $orderBy: String
                    ) {
                        yarns(
                            search: $search,
                            page: $page,
                            limit: $limit,
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType,
                            orderBy: $orderBy
                        ) {
                            YarnId
                            SupplierId
                            InvoiceNumber
                            InvoiceDate
                            BeforeTax
                            TaxPercentage
                            Cgst
                            Sgst
                            Igst
                            AfterTax
                            BillType
                            RoundOff
                            InvoiceAmount
                            PaidAmount
                            suppliers {
                                SupplierId
                                Name
                                GstNumber
                            }
                            yarn_details {
                                YarnDetailId
                                YarnId
                                Count
                                Color
                                Varient
                                Bag
                                Quantity
                                Price
                                Total
                            }
                            yarn_payment_details {
                                Id
                                YarnId
                                Date
                                Amount
                                Type
                                ReceivedBy
                            }
                        }
                    }
                `,
                variables: {
                    search: query,
                    page: currentPage,
                    limit: pageLimit,
                    startDate: startDate || null,
                    endDate: endDate || null,
                    billType: billType || null,
                    orderBy: orderBy || null
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.yarns || [];
};

export const fetchYarnPages = async (
    query: string,
    startDate: string,
    endDate: string,
    billType: string
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
                    query GetYarnCount(
                        $search: String,
                        $startDate: String,
                        $endDate: String,
                        $billType: String
                    ) {
                        yarnCount(
                            search: $search,
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType
                        )
                    }
                `,
                variables: {
                    search: query,
                    startDate: startDate || null,
                    endDate: endDate || null,
                    billType: billType || null
                }
            })
        }
    );

    const result = await response.json();
    const count = result?.data?.yarnCount || 0;
    const totalPages = Math.ceil(Number(count) / pageLimit);
    return {
        count,
        totalPages
    };
};

export const fetchYarnsDetails = async (
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
                    query GetYarnTotal(
                        $search: String,
                        $startDate: String,
                        $endDate: String,
                        $billType: String,
                        $orderBy: String
                    ) {
                        yarnTotal(
                            search: $search,
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType,
                            orderBy: $orderBy
                        ) {
                            totalInvoiceAmount
                            totalPaidAmount
                            totalPendingAmount
                        }
                    }
                `,
                variables: {
                    search: query,
                    startDate: startDate || null,
                    endDate: endDate || null,
                    billType: billType || null,
                    orderBy: orderBy || null
                }
            })
        }
    );

    const result = await response.json();
    const total = result?.data?.yarnTotal;
    return {
        totalInvoiceAmount: total?.totalInvoiceAmount || 0,
        totalPaid: total?.totalPaidAmount || 0,
        balance: total?.totalPendingAmount || 0
    };
};

export const fetchYarnById = async (id: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    query GetYarnById($id: ID!) {
                        yarn(Id: $id) {
                            YarnId
                            SupplierId
                            InvoiceNumber
                            InvoiceDate
                            BeforeTax
                            TaxPercentage
                            Cgst
                            Sgst
                            Igst
                            AfterTax
                            BillType
                            RoundOff
                            InvoiceAmount
                            PaidAmount
                            suppliers {
                                SupplierId
                                Name
                                GstNumber
                                Address
                                State
                                Phone
                                Mobile
                                Agent
                                AccountNumber
                                Bank
                                IfscCode
                                Type
                            }
                            yarn_details {
                                YarnDetailId
                                YarnId
                                Count
                                Color
                                Varient
                                Bag
                                Quantity
                                Price
                                Total
                            }
                            yarn_payment_details {
                                Id
                                YarnId
                                Date
                                Amount
                                Type
                                ReceivedBy
                            }
                        }
                    }
                `,
                variables: {
                    id: String(id)
                }
            })
        }
    );

    const result = await response.json();
    const yarnData = result?.data?.yarn;
    return yarnData ? [yarnData] : [];
};

export const deleteYarn = async (id: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation DeleteYarn($id: ID!) {
                        deleteYarn(Id: $id)
                    }
                `,
                variables: {
                    id: String(id)
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.deleteYarn;
};

export const createYarn = async (payload: {
    invoiceData: any;
    products: any[];
    payments: any[];
}) => {
    const products = (payload.products || []).map(p => ({
        count: p.count || null,
        color: p.color || null,
        varient: p.varient || null,
        bag: p.bag || null,
        quantity: p.quantity ? parseFloat(String(p.quantity)) : 0,
        price: p.price ? parseFloat(String(p.price)) : 0
    }));

    const invoiceData = {
        YarnId: payload.invoiceData.YarnId ? String(payload.invoiceData.YarnId) : null,
        SupplierId: payload.invoiceData.SupplierId ? parseInt(String(payload.invoiceData.SupplierId)) : null,
        InvoiceNumber: payload.invoiceData.InvoiceNumber || null,
        InvoiceDate: payload.invoiceData.InvoiceDate || null,
        BeforeTax: payload.invoiceData.BeforeTax ? parseFloat(String(payload.invoiceData.BeforeTax)) : 0,
        TaxPercentage: payload.invoiceData.TaxPercentage ? parseFloat(String(payload.invoiceData.TaxPercentage)) : 0,
        Cgst: payload.invoiceData.Cgst ? parseFloat(String(payload.invoiceData.Cgst)) : 0,
        Sgst: payload.invoiceData.Sgst ? parseFloat(String(payload.invoiceData.Sgst)) : 0,
        Igst: payload.invoiceData.Igst ? parseFloat(String(payload.invoiceData.Igst)) : 0,
        AfterTax: payload.invoiceData.AfterTax ? parseFloat(String(payload.invoiceData.AfterTax)) : 0,
        BillType: payload.invoiceData.BillType || 'gst',
        RoundOff: payload.invoiceData.RoundOff || null,
        InvoiceAmount: payload.invoiceData.InvoiceAmount ? parseFloat(String(payload.invoiceData.InvoiceAmount)) : 0,
        PaidAmount: payload.invoiceData.PaidAmount ? parseFloat(String(payload.invoiceData.PaidAmount)) : 0
    };

    const payments = (payload.payments || []).map(pay => ({
        date: pay.date || null,
        amount: pay.amount ? String(pay.amount) : null,
        type: pay.type || null,
        to: pay.to || null
    }));

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation CreateYarn(
                        $invoiceData: YarnDataInput!,
                        $products: [YarnProductInput!]!,
                        $payments: [YarnPaymentInput!]!
                    ) {
                        createYarn(
                            invoiceData: $invoiceData,
                            products: $products,
                            payments: $payments
                        ) {
                            YarnId
                        }
                    }
                `,
                variables: {
                    invoiceData,
                    products,
                    payments
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.createYarn;
};

export const updateYarn = async (payload: {
    invoiceData: any;
    products: any[];
    payments: any[];
}) => {
    const products = (payload.products || []).map(p => ({
        count: p.count || null,
        color: p.color || null,
        varient: p.varient || null,
        bag: p.bag || null,
        quantity: p.quantity ? parseFloat(String(p.quantity)) : 0,
        price: p.price ? parseFloat(String(p.price)) : 0
    }));

    const invoiceData = {
        YarnId: payload.invoiceData.YarnId ? String(payload.invoiceData.YarnId) : null,
        SupplierId: payload.invoiceData.SupplierId ? parseInt(String(payload.invoiceData.SupplierId)) : null,
        InvoiceNumber: payload.invoiceData.InvoiceNumber || null,
        InvoiceDate: payload.invoiceData.InvoiceDate || null,
        BeforeTax: payload.invoiceData.BeforeTax ? parseFloat(String(payload.invoiceData.BeforeTax)) : 0,
        TaxPercentage: payload.invoiceData.TaxPercentage ? parseFloat(String(payload.invoiceData.TaxPercentage)) : 0,
        Cgst: payload.invoiceData.Cgst ? parseFloat(String(payload.invoiceData.Cgst)) : 0,
        Sgst: payload.invoiceData.Sgst ? parseFloat(String(payload.invoiceData.Sgst)) : 0,
        Igst: payload.invoiceData.Igst ? parseFloat(String(payload.invoiceData.Igst)) : 0,
        AfterTax: payload.invoiceData.AfterTax ? parseFloat(String(payload.invoiceData.AfterTax)) : 0,
        BillType: payload.invoiceData.BillType || 'gst',
        RoundOff: payload.invoiceData.RoundOff || null,
        InvoiceAmount: payload.invoiceData.InvoiceAmount ? parseFloat(String(payload.invoiceData.InvoiceAmount)) : 0,
        PaidAmount: payload.invoiceData.PaidAmount ? parseFloat(String(payload.invoiceData.PaidAmount)) : 0
    };

    const payments = (payload.payments || []).map(pay => ({
        date: pay.date || null,
        amount: pay.amount ? String(pay.amount) : null,
        type: pay.type || null,
        to: pay.to || null
    }));

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation UpdateYarn(
                        $invoiceData: YarnDataInput!,
                        $products: [YarnProductInput!]!,
                        $payments: [YarnPaymentInput!]!
                    ) {
                        updateYarn(
                            invoiceData: $invoiceData,
                            products: $products,
                            payments: $payments
                        ) {
                            YarnId
                        }
                    }
                `,
                variables: {
                    invoiceData,
                    products,
                    payments
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.updateYarn;
};
