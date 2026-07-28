import { pageLimit } from "@/app/lib/utils";

export const fetchWarps = async (
    query: string,
    currentPage: number,
    loomId: string,
    loomStatus: string,
    sizingId: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetWarps(
                        $search: String,
                        $page: Int,
                        $limit: Int,
                        $loomId: String,
                        $loomStatus: String,
                        $sizingId: String
                    ) {
                        warps(
                            search: $search,
                            page: $page,
                            limit: $limit,
                            loomId: $loomId,
                            loomStatus: $loomStatus,
                            sizingId: $sizingId,
                        ) {
                            WarpId,
                            SizingId,
                            Color,
                            Weight,
                            Meters,
                            LoomId,
                            LoomName,
                            LoomNumber,
                            lastDcNumber,
                            lastCount,
                            lastDcDate,
                            totalDhoties,
                            StartDate,
                            CompletedDate,
                            DeliveredDate                            
                        }
                    }
                `,
                variables: {
                    search: query,
                    loomId: loomId,
                    loomStatus: loomStatus,
                    sizingId: sizingId,
                    page: currentPage,
                    limit: pageLimit,
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.warps || [];
};

export const fetchWarpsCount = async (
    query: string,
    loomId: string,
    loomStatus: string,
    sizingId: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetWarpsCount(
                        $search: String,
                        $loomId: String,
                        $loomStatus: String,
                        $sizingId: String
                    ) {
                        warpCount(
                            search: $search,
                            loomId: $loomId,
                            loomStatus: $loomStatus,
                            sizingId: $sizingId,
                        )
                    }
                `,
                variables: {
                    search: query,
                    loomId: loomId,
                    loomStatus: loomStatus,
                    sizingId: sizingId,
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.warpCount;
};

export const fetchWarpById = async (id: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetWarpById(
                        $Id: ID!
                    ) {
                        warp(Id: $Id) {
                            WarpId,
                            SizingId,
                            Color,
                            Weight,
                            Meters,
                            LoomId,
                            LoomName,
                            LoomNumber,
                            StartDate,
                            CompletedDate,
                            DeliveredDate,
                            warp_dc_details {
                                DcId,
                                Dc,
                                Color,
                                Date,
                                Piece,                                
                                Count,
                                Weight
                            }
                        }
                    }
                `,
                variables: {
                    Id: id
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.warp;
};

export const updateWarp = async (warpData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation UpdateWarp($warpData: WarpInput!) {
                        updateWarp(warpData: $warpData)
                    }
                `,
                variables: {
                    warpData
                }
            })
        }
    );

    const result = await response.json();

    return result;
};

export const fetchWarpSummary = async (
    query: string,
    loomId: string,
    sizingId: string
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetWarpSummary(
                        $search: String,
                        $loomId: String,
                        $sizingId: String
                    ) {
                        warpSummary(
                            search: $search,
                            loomId: $loomId,
                            sizingId: $sizingId
                        ) {
                            InvoiceDate,
                            InvoiceNumber,
                            SizingId,
                            SupplierName
                            Color
                            TotalWarps,
                            TotalWeight,
                            TotalMeters,
                            LoomId,
                            LoomName,
                            ReceivedWeight,
                            ReceivedDhoties
                            IsCompleted                        
                        }
                    }
                `,
                variables: {
                    search: query,
                    loomId: loomId,
                    sizingId: sizingId,
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.warpSummary || [];
};

export const fetchWarpSummaryById = async (sizingId: string, loomId: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetWarpSummaryById(
                        $sizingId: String
                        $loomId: String
                    ) {
                        warpSummaryById(sizingId: $sizingId, loomId: $loomId) {
                            InvoiceDate
                            SizingId
                            Color
                            TotalWarps
                            TotalWeight
                            TotalMeters
                            LoomId,
                            LoomName
                            IsCompleted
                            warp_detail {
                                WarpId
                                SizingId
                                Color
                                Weight
                                Meters
                            }
                            warp_summary_details {
                                DcId
                                Dc
                                Date
                                Piece
                                Count
                                Weight
                            }
                        }
                    }
                `,
                variables: {
                    sizingId: sizingId,
                    loomId: loomId
                }
            })
        }
    );

    const result = await response.json();

    return result?.data?.warpSummaryById;
};

export const updateWarpSummary = async (summaryData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation UpdateWarpSummary($summaryData: WarpSummaryUpdateInput!) {
                        updateWarpSummary(summaryData: $summaryData)
                    }
                `,
                variables: {
                    summaryData
                }
            })
        }
    );
    const result = await response.json();
    return result;
};