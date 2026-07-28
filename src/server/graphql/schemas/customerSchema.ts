export const customerSchema = `#graphql

type Invoice {
  InvoiceNumber: String
  InvoiceDate: String
  InvoiceAmount: Float
  ReceivedAmount: Float
}

type Customer {
  CustomerId: ID
  CustomerName: String
  GstNumber: String
  Address: String
  Address2: String
  State: String
  Phone: String
  Mobile: String
  Agent: String
  customer_product_code: String
  pending: Float
  invoices: [Invoice]
}

type CustomerProduct {
  Id: ID
  Name: String
  HSNCode: String
  ProductCode: String
  ProductPrice: Float
  ProductSoldQuantity: Float
  PurchaseType: String
  Type: String
}

type CustomerPendingPayment {
  pending: Float
}

type Query {
  customers(search: String, orderBy: String, page: Int, limit: Int, startDate: String, endDate: String): [Customer]
  customerProducts(CustomerId: ID!, productId: Int, foldType: String): [CustomerProduct]
  customer(CustomerId: ID!): Customer
  customerCount(search: String): Int
  customerPendingPayment(search: String, startDate: String, endDate: String): Int
}

input CustomerInput {
  CustomerId: ID
  CustomerName: String!
  GstNumber: String
  Address: String
  Address2: String
  State: String
  Phone: String
  Mobile: String
  Agent: String
  customer_product_code: String
}

input ProductCodeInput {
  id: ID
  code: String
}

input CustomerProductInput {
  CustomerId: ID
  Products: [ProductCodeInput]
}

type Mutation {
  createCustomer(customerData: CustomerInput!): String
  updateCustomer(customerData: CustomerInput!): String
  updateCustomerProduct(customerData: CustomerProductInput!): String
  deleteCustomer(CustomerId: ID!): String
}
`;
