export const loomSchema = `#graphql

type Loom {
  LoomId: ID
  LoomName: String
  Address: String
  ContactNumber: String
  Count: String
}

type Entries {
  LoomEntryId: ID
  Date:        String
  Type:        String
  LoomId:      Int
  Details:     String
  BabbinCount: Int
  Weight:      Float
}

type Query {
  looms(search: String, page: Int, limit: Int): [Loom]
  loomCount(search: String): Int
  loom(Id: ID!): Loom
  entry(Id: ID!): Entries
  loomEntries(LoomId: ID!): [Entries]
  sizingWarpDetails(LoomId: ID!): [SizingWarpGroup]
}

type SizingWarpGroup {
  sizingId: Int
  id: String
  Type: String
  LoomId: Int
  Date: String
  Details: String
  Weight: Float
  isSizingGroup: Boolean
}

input LoomInput {
  LoomId: ID
  LoomName: String
  Address: String
  ContactNumber: String
  Count: String
}

input EntryInput {
  LoomEntryId: ID
  Date:        String
  Type:        String
  LoomId:      Int
  Details:     String
  BabbinCount: Int
  Weight:      Float
}

type Mutation {
  createLoom(loomData: LoomInput!): String
  updateLoom(loomData: LoomInput!): String
  deleteLoom(Id: ID!): String
  createEntry(entryData: [EntryInput!]!): String
  updateEntry(entryData: EntryInput!): String
  deleteEntry(Id: ID!): String
}
`;
