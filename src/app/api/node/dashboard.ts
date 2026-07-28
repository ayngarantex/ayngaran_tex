export const salseData = async (
    startDate: string,
    endDate: string,
    billType?: string
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
                    query GetSalse(
                        $startDate: String,
                        $endDate: String,
                        $billType: String
                    ) {
                        salse(
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType
                        ) {
                            totalInvoiceAmount
                            totalPaidAmount
                            totalPendingAmount
                        }
                    }
                `,
                variables: {
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType,
                }
            })
        }
    );

    const result = await response.json();

    return result.data.salse;
};

export const yarnSalesData = async (
    startDate: string,
    endDate: string,
    billType?: string
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
                    query GetYarnSales(
                        $startDate: String,
                        $endDate: String,
                        $billType: String
                    ) {
                        yarnSales(
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType
                        ) {
                            totalInvoiceAmount
                            totalPaidAmount
                            totalPendingAmount
                        }
                    }
                `,
                variables: {
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType,
                }
            })
        }
    );

    const result = await response.json();

    return result.data.yarnSales;
};

export const fetchSalesChartDetails = async (
    startDate: string,
    endDate: string,
    billType?: string
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
                    query GetSalesChart(
                        $startDate: String,
                        $endDate: String,
                        $billType: String
                    ) {
                        salesChart(
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType
                        ) {
                            totalCount
                            totalSales
                            totalReceived
                            month
                        }
                    }
                `,
                variables: {
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType,
                }
            })
        }
    );

    const result = await response.json();

    return result.data.salesChart;
};

export const fetchYarnPurchaseDetails = async (
    startDate: string,
    endDate: string,
    billType?: string
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
                    query GetYarnChart(
                        $startDate: String,
                        $endDate: String,
                        $billType: String
                    ) {
                        yarnChart(
                            startDate: $startDate,
                            endDate: $endDate,
                            billType: $billType
                        ) {
                            totalCount
                            totalPurchase
                            totalPaid
                            month
                        }
                    }
                `,
                variables: {
                    startDate: startDate,
                    endDate: endDate,
                    billType: billType,
                }
            })
        }
    );

    const result = await response.json();

    return result.data.yarnChart;
};
