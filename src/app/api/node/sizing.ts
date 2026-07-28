import { pageLimit } from "@/app/lib/utils";

// export const fetchSizing = async (
//     query: string,
//     currentPage: number
// ) => {
//     const response = await fetch(
//         `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },

//             body: JSON.stringify({
//                 query: `
//                     query GetSizing(
//                         $search: String,
//                         $page: Int,
//                         $limit: Int
//                     ) {
//                         sizings(
//                             search: $search,
//                             page: $page,
//                             limit: $limit
//                         ) {
//                             SizingId
//                             SizingName
//                             InvoiceNumber
//                             InvoiceDate
//                             WarpType
//                             SupplierId
//                             YarnId
//                             Color
//                             YarnSent
//                             YarnUsed
//                             YarnBalance
//                             Meters
//                             Price
//                             BeforeTax
//                             BillType
//                             TaxPercentage
//                             Cgst
//                             Sgst
//                             Igst
//                             AfterTax
//                             RoundOff
//                             InvoiceAmount
//                             ReceivedAmount
//                             TotalWarp
//                         }
//                     }
//                 `,
//                 variables: {
//                     search: query,
//                     page: currentPage,
//                     limit: pageLimit
//                 }
//             })
//         }
//     );

//     const result = await response.json();

//     return result.data.sizings;
// };

export const fetchSizing = async (
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
                    query GetSizing(
                        $search: String,
                        $page: Int,
                        $limit: Int,
                        $startDate: String,
                        $endDate: String,
                        $billType: String,
                        $orderBy: String
                    ) {
                        sizings(
                            search: $search,
                            page: $page,
                            limit: $limit,
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType,
                            orderBy: $orderBy
                        ) {
                            SizingId
                            SizingName
                            InvoiceNumber
                            InvoiceDate
                            WarpType
                            SupplierId
                            YarnId
                            Color
                            YarnSent
                            YarnUsed
                            YarnBalance
                            Meters
                            Price
                            BeforeTax
                            BillType
                            TaxPercentage
                            Cgst
                            Sgst
                            Igst
                            AfterTax
                            RoundOff
                            InvoiceAmount
                            ReceivedAmount
                            TotalWarp
                            suppliers {
                                SupplierId
                                Name
                                GstNumber
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
    return result?.data?.sizings || [];
};

export const fetchSizingPages = async (
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
                    query GetSizingCount(
                        $search: String,
                        $startDate: String,
                        $endDate: String,
                        $billType: String
                    ) {
                        sizingCount(
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
    const count = result?.data?.sizingCount || 0;
    const totalPages = Math.ceil(Number(count) / pageLimit);
    return {
        count,
        totalPages
    };
};

export const fetchSizingTotal = async (
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
                    query GetSizingTotal(
                        $search: String,
                        $startDate: String,
                        $endDate: String,
                        $billType: String,
                        $orderBy: String
                    ) {
                        sizingTotal(
                            search: $search,
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType,
                            orderBy: $orderBy
                        ) {
                            totalInvoiceAmount
                            totalReceived
                            balance
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
    return result?.data?.sizingTotal || { totalInvoiceAmount: 0, totalReceived: 0, balance: 0 };
};

export const fetchSizingById = async (id: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    query GetSizingById($id: ID!) {
                        sizing(Id: $id) {
                            SizingId
                            SizingName
                            InvoiceNumber
                            InvoiceDate
                            WarpType
                            SupplierId
                            YarnId
                            Color
                            YarnSent
                            YarnUsed
                            YarnBalance
                            Meters
                            Price
                            BeforeTax
                            BillType
                            TaxPercentage
                            Cgst
                            Sgst
                            Igst
                            AfterTax
                            RoundOff
                            InvoiceAmount
                            ReceivedAmount
                            TotalWarp
                            suppliers {
                                SupplierId
                                Name
                                GstNumber
                                State
                            }
                            sizing_payment_details {
                                Id
                                SizingId
                                Date
                                Amount
                                Type
                                ReceivedBy
                            }
                            sizing_warp_details {
                                WarpId
                                SizingId
                                Color
                                Meters
                                Weight
                                Price
                                LoomId
                                LoomName
                                LoomNumber
                                StartDate
                                CompletedDate
                                DeliveredDate
                            }
                            sizing_yarn_details {
                                SizingyarnId
                                SizingId
                                Color
                                YarnSent
                                YarnUsed
                                YarnBalance
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
    const sizingData = result?.data?.sizing;
    return sizingData ? [sizingData] : [];
};

export const deleteSizing = async (id: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation DeleteSizing($id: ID!) {
                        deleteSizing(Id: $id)
                    }
                `,
                variables: {
                    id: String(id)
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.deleteSizing;
};

export const createSizing = async (payload: {
    invoiceData: any;
    products: any[];
    payments: any[];
    sizingYarn: any[];
}) => {
    // Sanitize products (warp details)
    const products = (payload.products || []).map(p => ({
        warpId: p.warpId ? String(p.warpId) : null,
        meters: p.meters ? parseFloat(String(p.meters)) : 0,
        color: p.color || null,
        date: p.date || null,
        price: p.price ? parseFloat(String(p.price)) : null,
        weight: p.weight ? parseFloat(String(p.weight)) : null,
        loomId: p.loomId ? parseInt(String(p.loomId)) : null,
        pId: p.pId !== undefined ? parseInt(String(p.pId)) : null
    }));

    // Sanitize invoiceData
    const invoiceData = {
        SizingId: payload.invoiceData.SizingId ? String(payload.invoiceData.SizingId) : null,
        SupplierId: payload.invoiceData.SupplierId ? parseInt(String(payload.invoiceData.SupplierId)) : null,
        InvoiceNumber: payload.invoiceData.InvoiceNumber || null,
        InvoiceDate: payload.invoiceData.InvoiceDate || null,
        WarpType: payload.invoiceData.WarpType || null,
        Color: payload.invoiceData.Color || null,
        Meters: payload.invoiceData.Meters ? parseFloat(String(payload.invoiceData.Meters)) : 0,
        YarnId: payload.invoiceData.YarnId ? parseInt(String(payload.invoiceData.YarnId)) : null,
        YarnSent: payload.invoiceData.YarnSent ? parseFloat(String(payload.invoiceData.YarnSent)) : 0,
        YarnUsed: payload.invoiceData.YarnUsed ? parseFloat(String(payload.invoiceData.YarnUsed)) : 0,
        YarnBalance: payload.invoiceData.YarnBalance ? parseFloat(String(payload.invoiceData.YarnBalance)) : 0,
        Price: payload.invoiceData.Price || null,
        BeforeTax: payload.invoiceData.BeforeTax ? parseFloat(String(payload.invoiceData.BeforeTax)) : 0,
        TaxPercentage: payload.invoiceData.TaxPercentage ? parseFloat(String(payload.invoiceData.TaxPercentage)) : 0,
        Cgst: payload.invoiceData.Cgst ? parseFloat(String(payload.invoiceData.Cgst)) : 0,
        Sgst: payload.invoiceData.Sgst ? parseFloat(String(payload.invoiceData.Sgst)) : 0,
        Igst: payload.invoiceData.Igst ? parseFloat(String(payload.invoiceData.Igst)) : 0,
        AfterTax: payload.invoiceData.AfterTax ? parseFloat(String(payload.invoiceData.AfterTax)) : 0,
        RoundOff: payload.invoiceData.RoundOff || null,
        InvoiceAmount: payload.invoiceData.InvoiceAmount ? parseFloat(String(payload.invoiceData.InvoiceAmount)) : 0,
        ReceivedAmount: payload.invoiceData.ReceivedAmount ? parseInt(String(payload.invoiceData.ReceivedAmount)) : 0,
        BillType: payload.invoiceData.BillType || null,
        PaidAmount: payload.invoiceData.PaidAmount ? parseFloat(String(payload.invoiceData.PaidAmount)) : 0
    };

    // Sanitize sizingYarn
    const sizingYarn = (payload.sizingYarn || []).map(sy => ({
        color: sy.color || null,
        yarnSent: sy.yarnSent ? parseFloat(String(sy.yarnSent)) : 0,
        yarnUsed: sy.yarnUsed ? parseFloat(String(sy.yarnUsed)) : 0,
        yarnBalance: sy.yarnBalance ? parseFloat(String(sy.yarnBalance)) : 0,
        pId: sy.pId !== undefined ? parseInt(String(sy.pId)) : null
    }));

    // Sanitize payments
    const payments = (payload.payments || []).map(pay => ({
        date: pay.date || null,
        amount: pay.amount || null,
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
                    mutation CreateSizing(
                        $invoiceData: SizingDataInput!,
                        $products: [SizingWarpInput!]!,
                        $payments: [SizingPaymentInput!]!,
                        $sizingYarn: [SizingYarnInput!]!
                    ) {
                        createSizing(
                            invoiceData: $invoiceData,
                            products: $products,
                            payments: $payments,
                            sizingYarn: $sizingYarn
                        ) {
                            SizingId
                        }
                    }
                `,
                variables: {
                    invoiceData,
                    products,
                    payments,
                    sizingYarn
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.createSizing;
};

export const updateSizing = async (payload: {
    invoiceData: any;
    products: any[];
    payments: any[];
    sizingYarn: any[];
}) => {
    // Sanitize products (warp details)
    const products = (payload.products || []).map(p => ({
        warpId: p.warpId ? String(p.warpId) : null,
        meters: p.meters ? parseFloat(String(p.meters)) : 0,
        color: p.color || null,
        date: p.date || null,
        price: p.price ? parseFloat(String(p.price)) : null,
        weight: p.weight ? parseFloat(String(p.weight)) : null,
        loomId: p.loomId ? parseInt(String(p.loomId)) : null,
        pId: p.pId !== undefined ? parseInt(String(p.pId)) : null
    }));

    // Sanitize invoiceData
    const invoiceData = {
        SizingId: payload.invoiceData.SizingId ? String(payload.invoiceData.SizingId) : null,
        SupplierId: payload.invoiceData.SupplierId ? parseInt(String(payload.invoiceData.SupplierId)) : null,
        InvoiceNumber: payload.invoiceData.InvoiceNumber || null,
        InvoiceDate: payload.invoiceData.InvoiceDate || null,
        WarpType: payload.invoiceData.WarpType || null,
        Color: payload.invoiceData.Color || null,
        Meters: payload.invoiceData.Meters ? parseFloat(String(payload.invoiceData.Meters)) : 0,
        YarnId: payload.invoiceData.YarnId ? parseInt(String(payload.invoiceData.YarnId)) : null,
        YarnSent: payload.invoiceData.YarnSent ? parseFloat(String(payload.invoiceData.YarnSent)) : 0,
        YarnUsed: payload.invoiceData.YarnUsed ? parseFloat(String(payload.invoiceData.YarnUsed)) : 0,
        YarnBalance: payload.invoiceData.YarnBalance ? parseFloat(String(payload.invoiceData.YarnBalance)) : 0,
        Price: payload.invoiceData.Price || null,
        BeforeTax: payload.invoiceData.BeforeTax ? parseFloat(String(payload.invoiceData.BeforeTax)) : 0,
        TaxPercentage: payload.invoiceData.TaxPercentage ? parseFloat(String(payload.invoiceData.TaxPercentage)) : 0,
        Cgst: payload.invoiceData.Cgst ? parseFloat(String(payload.invoiceData.Cgst)) : 0,
        Sgst: payload.invoiceData.Sgst ? parseFloat(String(payload.invoiceData.Sgst)) : 0,
        Igst: payload.invoiceData.Igst ? parseFloat(String(payload.invoiceData.Igst)) : 0,
        AfterTax: payload.invoiceData.AfterTax ? parseFloat(String(payload.invoiceData.AfterTax)) : 0,
        RoundOff: payload.invoiceData.RoundOff || null,
        InvoiceAmount: payload.invoiceData.InvoiceAmount ? parseFloat(String(payload.invoiceData.InvoiceAmount)) : 0,
        ReceivedAmount: payload.invoiceData.ReceivedAmount ? parseInt(String(payload.invoiceData.ReceivedAmount)) : 0,
        BillType: payload.invoiceData.BillType || null,
        PaidAmount: payload.invoiceData.PaidAmount ? parseFloat(String(payload.invoiceData.PaidAmount)) : 0
    };

    // Sanitize sizingYarn
    const sizingYarn = (payload.sizingYarn || []).map(sy => ({
        color: sy.color || null,
        yarnSent: sy.yarnSent ? parseFloat(String(sy.yarnSent)) : 0,
        yarnUsed: sy.yarnUsed ? parseFloat(String(sy.yarnUsed)) : 0,
        yarnBalance: sy.yarnBalance ? parseFloat(String(sy.yarnBalance)) : 0,
        pId: sy.pId !== undefined ? parseInt(String(sy.pId)) : null
    }));

    // Sanitize payments
    const payments = (payload.payments || []).map(pay => ({
        date: pay.date || null,
        amount: pay.amount || null,
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
                    mutation UpdateSizing(
                        $invoiceData: SizingDataInput!,
                        $products: [SizingWarpInput!]!,
                        $payments: [SizingPaymentInput!]!,
                        $sizingYarn: [SizingYarnInput!]!
                    ) {
                        updateSizing(
                            invoiceData: $invoiceData,
                            products: $products,
                            payments: $payments,
                            sizingYarn: $sizingYarn
                        ) {
                            SizingId
                        }
                    }
                `,
                variables: {
                    invoiceData,
                    products,
                    payments,
                    sizingYarn
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.updateSizing;
};
