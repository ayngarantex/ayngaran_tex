export const warpSchema = `#graphql

type Warp {
  WarpId: ID
  SizingId: ID
  Color: String
  Weight: Float
  Meters: Float
  LoomId: ID
  LoomName: String
  LoomNumber: String
  lastDcNumber: String
  lastCount: String
  lastDcDate: String
  StartDate: String
  CompletedDate: String
  DeliveredDate: String
  totalDhoties: Int
}

type WarpDcDetails {
  DcId: ID
  Dc: Int
  Color: String
  Date: String
  Piece: Int
  Count: String
  Weight: String
}

type WarpById {
  WarpId: ID
  SizingId: ID
  Color: String
  Weight: Float
  Meters: Float
  LoomId: ID
  LoomName: String
  LoomNumber: String
  StartDate: String
  CompletedDate: String
  DeliveredDate: String
  warp_dc_details: [WarpDcDetails]
}

type WarpSummary {
  InvoiceDate: String,
  InvoiceNumber: String,
  SizingId: Int,
  SupplierName: String,
  Color: String,
  TotalWarps: Int,
  TotalWeight: String,
  TotalMeters: String,
  LoomId: String,
  LoomName: String,
  ReceivedWeight: String,
  ReceivedDhoties: String,
  IsCompleted: Int
}

type WarpSummaryDcDetails {
  DcId: ID
  Dc: Int
  Date: String
  Piece: Int
  Count: String
  Weight: String
}

type WarpSumDetails {
  WarpId: ID
  SizingId: ID
  Color: String
  Weight: String
  Meters: String
}

type WarpSummaryDetails {
  InvoiceDate: String
  SizingId: Int
  Color: String
  TotalWarps: Int
  TotalWeight: String
  TotalMeters: String
  LoomId: Int
  LoomName: String
  IsCompleted: Int
  warp_detail: [WarpSumDetails]
  warp_summary_details: [WarpSummaryDcDetails]
}

type Query {
  warps(
    search: String
    page: Int
    limit: Int
    loomId: String
    loomStatus: String
    sizingId: String
  ): [Warp]

  warpCount(
    search: String
    loomId: String
    loomStatus: String
    sizingId: String
  ): Int

  warpSummary(
    search: String
    loomId: String
    sizingId: String
  ): [WarpSummary]

  warp(Id: ID!): WarpById

  warpSummaryById(
    loomId: String
    sizingId: String
  ): WarpSummaryDetails
}

input WarpDcUpdateDetails {
  dcId: ID
  dc: Int
  color: String
  date: String
  piece: Int
  count: String
  weight: String
}

input WarpInput {
  WarpId: String
  SizingId: String
  Color: String
  Weight: Float
  Meters: Float
  LoomId: String
  LoomNumber: String
  StartDate: String
  EndDate: String
  DeliveredDate: String
  warp_dc_details: [WarpDcUpdateDetails]
}

input WarpSummaryDcInput {
  DcId: ID
  Dc: Int
  Date: String
  Piece: Int
  Count: String
  Weight: String
}

input WarpSummaryUpdateInput {
  SizingId: Int!
  LoomId: Int!
  IsCompleted: Int
  warp_summary_details: [WarpSummaryDcInput]
}

type Mutation {
  updateWarp(warpData: WarpInput!): String
  updateWarpSummary(summaryData: WarpSummaryUpdateInput!): String
}
`;
