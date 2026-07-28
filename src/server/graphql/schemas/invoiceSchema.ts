export const invoiceSchema = `#graphql

type Customer {
  CustomerName: String
  GstNumber: String
}

type Product {
  Id: ID
  Name: String
  HSNCode: String
  Type: String
}

type InvoiceDetail {
  InvoiceDetailId: ID
  ItemId: ID
  ProductName: String
  Quantity: Float
  QuantityType: String
  Price: Float
  Total: Float
  Type: String
  FoldedType: String
  products: Product
}

type InvoiceReturnDetail {
  InvoiceReturnDetailId: ID
  ItemId: ID
  ProductName: String
  Quantity: Float
  QuantityType: String
  Price: Float
  Total: Float
  Type: String
  products: Product
}

type InvoicePayment {
  Id: ID
  Date: String
  Amount: Float
  Type: String
  ReceivedBy: String
}

type Invoice {
  InvoiceId: ID
  InvoiceNumber: String
  InvoiceDate: String
  BalanceAmount: Float
  BillType: String
  InvoiceType: String
  InvoiceAmount: Float
  ReceivedAmount: Float
  CustomerId: ID
  EwayBillNumber: String
  BeforeTax: Float
  TaxPercentage: Float
  Cgst: Float
  Sgst: Float
  Igst: Float
  AfterTax: Float
  RoundOff: String
  Discount: String
  CustomerName: String
  CustomerMobile: String
  GstNumber: String
  IsCancel: Int
  CancelReason: String
  invoice_details: [InvoiceDetail]
  invoice_return_details: [InvoiceReturnDetail]
  invoice_payments: [InvoicePayment]
}

type CustomerInvoice {
  InvoiceId: ID
  InvoiceNumber: String
  InvoiceDate: String
  BalanceAmount: Float
  BillType: String
  InvoiceType: String
  InvoiceAmount: Float
  ReceivedAmount: Float
  EwayBillNumber: String
  IsCancel: Int
  CancelReason: String
  invoice_details: [InvoiceDetail]
}

type CustomerPayments {
  Id: ID
  Date: String
  Amount: Float
  Type: String
  ReceivedBy: String
  InvoiceNumber: String
  BillType: String
}

type InvoiceById {
  InvoiceId: ID
  InvoiceNumber: String
  InvoiceDate: String
  BillType: String
  InvoiceType: String
  InvoiceAmount: Float
  ReceivedAmount: Float
  CustomerId: ID
  EwayBillNumber: String
  BeforeTax: Float
  TaxPercentage: Float
  Cgst: Float
  Sgst: Float
  Igst: Float
  AfterTax: Float
  RoundOff: String
  Discount: String
  IsCancel: Int
  CancelReason: String
  invoice_details: [InvoiceDetail]
  invoice_return_details: [InvoiceReturnDetail]
  invoice_payments: [InvoicePayment]
}

type InvoicesTotal {
  TotalInvoiceAmount: Float
  TotalReceivedAmount: Float
  TotalBalanceAmount: Float
  TotalCancelledAmount: Float
}

type Query {
  invoices(
    search: String
    startDate: String
    endDate: String
    billType: String
    orderBy: String
    page: Int
    limit: Int
  ): [Invoice]

  invoicesCount(
    search: String
    startDate: String
    endDate: String
    billType: String
    orderBy: String
  ): Int

  lastInvoiceNumber(billType: String): String

  invoicesTotal(
    search: String
    startDate: String
    endDate: String
    billType: String
    orderBy: String
  ): InvoicesTotal

  invoice(Id: ID!): Invoice

  customerInvoices(
    CustomerId: ID!
    startDate: String
    endDate: String
    billType: String
  ): [CustomerInvoice]

  customerPayments(
    CustomerId: ID!
    startDate: String
    endDate: String
    billType: String
  ): [CustomerPayments]
}

input InvoiceDetailInput {
  Pid: ID
  product: ID
  productName: String
  quantity: Float
  quantityType: String
  price: Float
  type: String
}

input InvoicePaymentInput {
  date: String
  amount: String
  type: String
  to: String
}

input InvoiceInput {
  InvoiceId: ID
  CustomerId: ID
  InvoiceNumber: String
  InvoiceType: String
  EwayBillNumber: String
  InvoiceDate: String
  BeforeTax: Float
  TaxPercentage: Float
  Cgst: Float
  Sgst: Float
  Igst: Float
  AfterTax: Float
  BillType: String
  RoundOff: String
  Discount: String
  InvoiceAmount: Float
  ReceivedAmount: Float
  IsCancel: Int
  CancelReason: String
  products: [InvoiceDetailInput]
  returnProducts: [InvoiceDetailInput]
  payments: [InvoicePaymentInput]
}

type Mutation {
  createInvoice(invoiceData: InvoiceInput!): String
  updateInvoice(invoiceData: InvoiceInput!): String
  deleteInvoice(Id: ID!): String
}
`;
