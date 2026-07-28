export const productSchema = `#graphql

type Product {
  Id: ID
  Name: String
  Type: String
  HSNCode: String
  Image: String
  Tags: String
  Description: String
  Details: String
  Size: String
  Composition: String
  WashCare: String
  AvailableStock: Int
  TotalStock: Int
  SoldCount: Int
}

type ProductTotals {
  TotalStock: Int
  SoldCount: Int
  AvailableStock: Int
}

type Query {
  products(search: String, page: Int, limit: Int): [Product]
  product(Id: ID!): Product
  productCount(search: String): Int
  productTotals(search: String, productId: String): ProductTotals
}

input ProductInput {
  Id: ID
  Name: String!
  HSNCode: String
  Type: String
  Image: String
  Tags: String
  Description: String
  Details: String
  Size: String
  Composition: String
  WashCare: String
}

type Mutation {
  createProduct(productData: ProductInput!): String
  updateProduct(productData: ProductInput!): String
  deleteProduct(Id: ID!): String
}
`;
