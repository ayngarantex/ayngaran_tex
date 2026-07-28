export const yarnSchema = `#graphql

type YarnPaymentDetail {
  Id: ID
  YarnId: Int
  Date: String
  Amount: String
  Type: String
  ReceivedBy: String
}

type YarnDetail {
  YarnDetailId: ID
  YarnId: Int
  Count: String
  Color: String
  Varient: String
  Bag: String
  Quantity: Float
  Price: Float
  Total: Float
}

type YarnTotal {
  totalInvoiceAmount: Float
  totalPaidAmount: Float
  totalPendingAmount: Float
}

type Yarn {
  YarnId: ID
  SupplierId: Int
  InvoiceNumber: String
  InvoiceDate: String
  BeforeTax: Float
  TaxPercentage: Float
  Cgst: Float
  Sgst: Float
  Igst: Float
  AfterTax: Float
  BillType: String
  RoundOff: String
  InvoiceAmount: Float
  PaidAmount: Float
  suppliers: Supplier
  yarn_details: [YarnDetail]
  yarn_payment_details: [YarnPaymentDetail]
}

type Query {
  yarns(
    search: String
    page: Int
    limit: Int
    startDate: String
    endDate: String
    billType: String
    orderBy: String
  ): [Yarn]

  yarnCount(
    search: String
    startDate: String
    endDate: String
    billType: String
  ): Int

  yarnTotal(
    search: String
    startDate: String
    endDate: String
    billType: String
    orderBy: String
  ): YarnTotal

  yarn(Id: ID!): Yarn
}

input YarnDataInput {
  YarnId: ID
  SupplierId: Int
  InvoiceNumber: String
  InvoiceDate: String
  BeforeTax: Float
  TaxPercentage: Float
  Cgst: Float
  Sgst: Float
  Igst: Float
  AfterTax: Float
  BillType: String
  RoundOff: String
  InvoiceAmount: Float
  PaidAmount: Float
}

input YarnProductInput {
  count: String
  color: String
  varient: String
  bag: String
  quantity: Float
  price: Float
}

input YarnPaymentInput {
  date: String
  amount: String
  type: String
  to: String
}

type Mutation {
  createYarn(
    invoiceData: YarnDataInput!
    products: [YarnProductInput!]!
    payments: [YarnPaymentInput!]!
  ): Yarn

  updateYarn(
    invoiceData: YarnDataInput!
    products: [YarnProductInput!]!
    payments: [YarnPaymentInput!]!
  ): Yarn

  deleteYarn(Id: ID!): String
}
`;
