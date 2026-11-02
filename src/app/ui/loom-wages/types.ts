export interface PaymentItem {
    PaymentId: number;
    PaymentDate: string;
    Amount: number;
    PaymentType: string;
    Note: string | null;
}

export interface WarpPieceEntry {
    DcId: number;
    Date: string;
    Piece: number;
    Count: number;
    Weight: number;
    WarpId?: number;
    SizingId?: number;
    Color: string;
    WageRate: number;
    HasCustomWarpRate: boolean;
    CalculatedWage: number;
}

export interface DcSummaryItem {
    Dc: string;
    DcDate: string;
    SizingId?: number;
    Color: string;
    TotalCount: number;
    TotalWeight: number;
    TotalCalculatedWages: number;
    Pieces: WarpPieceEntry[];
}

export interface WeeklyConsolidatedRecord {
    LoomId: number;
    LoomName: string;
    DefaultWageRate: number;
    OpeningBalance: number;
    WeekStartDate: string;
    WeekEndDate: string;
    TotalCount: number;
    TotalWeight: number;
    TotalCalculatedWages: number;
    TotalPaidAmount: number;
    BalanceDue: number;
    Dcs: DcSummaryItem[];
    TotalDcsCount: number;
    Payments: PaymentItem[];
}

