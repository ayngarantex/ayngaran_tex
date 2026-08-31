export const fetchPaymentDetails = async (
    query: string,
    currentPage: number,
    pageLimit: number,
    startDate: string,
    endDate: string,
    type: string = 'invoice'
) => {
    const queryName = type === 'sizing' ? 'sizingPayments' : type === 'yarn' ? 'yarnPayments' : 'payments';
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetPayments(
                        $search: String,
                        $page: Int,
                        $limit: Int,
                        $startDate: String,
                        $endDate: String
                    ) {
                        ${queryName}(
                            search: $search,
                            page: $page,
                            limit: $limit,
                            startDate: $startDate,
                            endDate: $endDate
                        ) {
                            InvoiceNumber
                            CustomerName
                            PaymentDate
                            PaymentAmount
                            BillType
                        }
                    }
                `,
                variables: {
                    search: query,
                    page: currentPage,
                    limit: 50,
                    startDate: startDate,
                    endDate: endDate
                }
            })
        }
    );

    const result = await response.json();

    console.log("result", result)

    return result?.data?.[queryName];
};

export const fetchPaymentCount = async (
    query: string,
    startDate: string,
    endDate: string,
    type: string = 'invoice'
) => {
    const queryName = type === 'sizing' ? 'sizingPaymentCount' : type === 'yarn' ? 'yarnPaymentCount' : 'paymentCount';
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetPaymentsCount(
                        $search: String,
                        $startDate: String,
                        $endDate: String
                    ) {
                        ${queryName}(
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

    return result?.data?.[queryName];
};