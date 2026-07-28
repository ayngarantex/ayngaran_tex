export const sizingSchema = `#graphql

type SizingPaymentDetail {
  Id: ID
  SizingId: Int
  Date: String
  Amount: String
  Type: String
  ReceivedBy: String
}

type SizingWarpDetail {
  WarpId: ID
  SizingId: Int
  Color: String
  Meters: Int
  Weight: Float
  Price: Float
  LoomId: Int
  LoomName: String
  LoomNumber: String
  StartDate: String
  CompletedDate: String
  DeliveredDate: String
}

type SizingYarnDetail {
  SizingyarnId: ID
  SizingId: Int
  Color: String
  YarnSent: Float
  YarnUsed: Float
  YarnBalance: Float
}

type SizingTotal {
  totalInvoiceAmount: Float
  totalReceived: Float
  balance: Float
}

type Sizing {
  SizingId: ID
  SizingName: String
  InvoiceNumber: String
  InvoiceDate: String
  WarpType: String
  SupplierId: Int
  YarnId: Int
  Color: String
  YarnSent: Float
  YarnUsed: Float
  YarnBalance: Float
  Meters: Float
  Price: String
  BeforeTax: Float
  BillType: String
  TaxPercentage: Float
  Cgst: Float
  Sgst: Float
  Igst: Float
  AfterTax: Float
  RoundOff: String
  InvoiceAmount: Float
  ReceivedAmount: Int
  TotalWarp: Int
  suppliers: Supplier
  sizing_payment_details: [SizingPaymentDetail]
  sizing_warp_details: [SizingWarpDetail]
  sizing_yarn_details: [SizingYarnDetail]
}

type Query {
  sizings(
    search: String
    page: Int
    limit: Int
    startDate: String
    endDate: String
    billType: String
    orderBy: String
  ): [Sizing]
  
  sizingCount(
    search: String
    startDate: String
    endDate: String
    billType: String
  ): Int

  sizingTotal(
    search: String
    startDate: String
    endDate: String
    billType: String
    orderBy: String
  ): SizingTotal

  sizing(Id: ID!): Sizing
}

input SizingDataInput {
  SizingId: ID
  SupplierId: Int
  InvoiceNumber: String
  InvoiceDate: String
  WarpType: String
  Color: String
  Meters: Float
  YarnId: Int
  YarnSent: Float
  YarnUsed: Float
  YarnBalance: Float
  Price: String
  BeforeTax: Float
  TaxPercentage: Float
  Cgst: Float
  Sgst: Float
  Igst: Float
  AfterTax: Float
  RoundOff: String
  InvoiceAmount: Float
  ReceivedAmount: Int
  BillType: String
  PaidAmount: Float
}

input SizingWarpInput {
  warpId: ID
  meters: Float
  color: String
  date: String
  price: Float
  weight: Float
  loomId: Int
  pId: Int
}

input SizingPaymentInput {
  date: String
  amount: String
  type: String
  to: String
}

input SizingYarnInput {
  color: String
  yarnSent: Float
  yarnUsed: Float
  yarnBalance: Float
  pId: Int
}

type Mutation {
  createSizing(
    invoiceData: SizingDataInput!
    products: [SizingWarpInput!]!
    payments: [SizingPaymentInput!]!
    sizingYarn: [SizingYarnInput!]!
  ): Sizing
  
  updateSizing(
    invoiceData: SizingDataInput!
    products: [SizingWarpInput!]!
    payments: [SizingPaymentInput!]!
    sizingYarn: [SizingYarnInput!]!
  ): Sizing

  deleteSizing(Id: ID!): String
}
`;

