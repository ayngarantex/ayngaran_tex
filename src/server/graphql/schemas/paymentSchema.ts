export const paymentSchema = `#graphql

type Payment {
  InvoiceNumber: String
  CustomerName: String
  PaymentDate: String
  PaymentAmount: Float
  BillType: String
}

type Query {
  payments(search: String, page: Int, limit: Int, startDate: String, endDate: String): [Payment]
  paymentCount(search: String, startDate: String, endDate: String): Int

  sizingPayments(search: String, page: Int, limit: Int, startDate: String, endDate: String): [Payment]
  sizingPaymentCount(search: String, startDate: String, endDate: String): Int

  yarnPayments(search: String, page: Int, limit: Int, startDate: String, endDate: String): [Payment]
  yarnPaymentCount(search: String, startDate: String, endDate: String): Int
}
`;
