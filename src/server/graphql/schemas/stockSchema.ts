export const stockSchema = `#graphql

type StockEntry {
  Id: ID
  ProductId: Int
  Quantity: Int
  EntryDate: String
  Notes: String
  ProductName: String
}

input StockEntryInput {
  Id: ID
  ProductId: Int!
  Quantity: Int!
  EntryDate: String!
  Notes: String
}

extend type Query {
  stockEntries(productId: ID): [StockEntry]
  stockEntry(Id: ID!): StockEntry
}

extend type Mutation {
  createStockEntry(stockData: StockEntryInput!): String
  updateStockEntry(stockData: StockEntryInput!): String
  deleteStockEntry(Id: ID!): String
}
`;
