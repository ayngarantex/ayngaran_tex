export const supplierSchema = `#graphql

type Supplier {
  SupplierId: ID
  Name: String
  GstNumber: String
  Adress: String
  Address: String
  State: String
  Phone: String
  Mobile: String
  Agent: String
  AccountNumber: String
  Bank: String
  IfscCode: String
  Type: String
  pendingAmount: Float
}

type Query {
  suppliers(search: String, type: String, page: Int, limit: Int, orderBy: String): [Supplier]
  supplierCount(search: String, type: String): Int
  supplier(Id: ID!): Supplier
}

input SupplierInput {
  SupplierId: ID
  Name: String
  GstNumber: String
  Address: String
  State: String
  Phone: String
  Mobile: String
  Agent: String
  AccountNumber: String
  Bank: String
  IfscCode: String
  Type: String
}

type Mutation {
  createSupplier(supplierData: SupplierInput!): Supplier
  updateSupplier(supplierData: SupplierInput!): Supplier
  deleteSupplier(SupplierId: ID!): String
}
`;

