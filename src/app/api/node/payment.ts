export const fetchPaymentDetails = async (
    query: string,
    currentPage: number,
    pageLimit: number,
    startDate: string,
    endDate: string,
    type: string = 'invoice'
) => {
    const isLoomOrFolding = type === 'loom' || type === 'folding' || type === 'loom-wage';
    const queryName =
        type === 'sizing'
            ? 'sizingPayments'
            : type === 'yarn'
            ? 'yarnPayments'
            : isLoomOrFolding
            ? 'loomPayments'
            : 'payments';

    const category =
        type === 'folding'
            ? 'Folding'
            : type === 'loom-wage'
            ? 'Loom Wage'
            : null;

    const queryStr = isLoomOrFolding
        ? `
            query GetPayments(
                $search: String,
                $page: Int,
                $limit: Int,
                $startDate: String,
                $endDate: String,
                $category: String
            ) {
                loomPayments(
                    search: $search,
                    page: $page,
                    limit: $limit,
                    startDate: $startDate,
                    endDate: $endDate,
                    category: $category
                ) {
                    InvoiceNumber
                    CustomerName
                    PaymentDate
                    PaymentAmount
                    BillType
                }
            }
        `
        : `
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
        `;

    const variables: any = {
        search: query,
        page: currentPage,
        limit: 50,
        startDate: startDate,
        endDate: endDate
    };

    if (isLoomOrFolding) {
        variables.category = category;
    }

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: queryStr,
                variables
            })
        }
    );

    const result = await response.json();

    return result?.data?.[queryName];
};

export const fetchPaymentCount = async (
    query: string,
    startDate: string,
    endDate: string,
    type: string = 'invoice'
) => {
    const isLoomOrFolding = type === 'loom' || type === 'folding' || type === 'loom-wage';
    const queryName =
        type === 'sizing'
            ? 'sizingPaymentCount'
            : type === 'yarn'
            ? 'yarnPaymentCount'
            : isLoomOrFolding
            ? 'loomPaymentCount'
            : 'paymentCount';

    const category =
        type === 'folding'
            ? 'Folding'
            : type === 'loom-wage'
            ? 'Loom Wage'
            : null;

    const queryStr = isLoomOrFolding
        ? `
            query GetPaymentsCount(
                $search: String,
                $startDate: String,
                $endDate: String,
                $category: String
            ) {
                loomPaymentCount(
                    search: $search,
                    startDate: $startDate,
                    endDate: $endDate,
                    category: $category
                )
            }
        `
        : `
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
        `;

    const variables: any = {
        search: query,
        startDate: startDate,
        endDate: endDate
    };

    if (isLoomOrFolding) {
        variables.category = category;
    }

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: queryStr,
                variables
            })
        }
    );

    const result = await response.json();

    return result?.data?.[queryName];
};
