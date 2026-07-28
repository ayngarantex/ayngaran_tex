export const dashboardSchema = `#graphql

type Sales {
  totalInvoiceAmount: Float
  totalPaidAmount: String
  totalPendingAmount: Float
}

type SalesChartDetails {
  totalCount: Int
  totalSales: Float
  totalReceived: Float
  month: String
}

type YarnChartDetails {
  totalCount: Int
  totalPurchase: Float
  totalPaid: Float
  month: String
}

type Query {
  salse(startDate: String, endDate: String, billType: String): Sales
  yarnSales(startDate: String, endDate: String, billType: String): Sales
  salesChart(startDate: String, endDate: String, billType: String): [SalesChartDetails]
  yarnChart(startDate: String, endDate: String, billType: String): [YarnChartDetails]
}
`;

