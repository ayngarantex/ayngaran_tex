import db from '../config/db';

// Helper function to calculate Sunday-to-Saturday week range
export const getWeekRange = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday... 6 = Saturday
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const weekStart = sunday.toISOString().split('T')[0];
    const weekEnd = saturday.toISOString().split('T')[0];
    return { weekStart, weekEnd };
};

// Save or Update default wage rate for a Loom
export const updateLoomDefaultWageRate = async (loomId: number, rate: number) => {
    await db.query(
        `UPDATE loom_details SET WageRate = ? WHERE LoomId = ?`,
        [Number(rate) || 0, Number(loomId)]
    );
    return true;
};

// Save or Update specific wage rate for a Sizing/Warp
export const updateSizingWarpWageRate = async (sizingId: number, rate: number) => {
    await db.query(
        `INSERT INTO warp_wage_rates (SizingId, WageRate) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE WageRate = VALUES(WageRate)`,
        [Number(sizingId), Number(rate) || 0]
    );
    return true;
};

// Save or Update opening balance before 2026-09-27 for a Loom
export const updateLoomOpeningBalance = async (loomId: number, balance: number) => {
    try {
        const [cols]: any = await db.query(`SHOW COLUMNS FROM loom_details LIKE 'OpeningBalance'`);
        if (cols.length === 0) {
            await db.query(`ALTER TABLE loom_details ADD COLUMN OpeningBalance DECIMAL(12,2) NOT NULL DEFAULT 0.00`);
        }
    } catch (e) { }

    await db.query(
        `UPDATE loom_details SET OpeningBalance = ? WHERE LoomId = ?`,
        [Number(balance) || 0, Number(loomId)]
    );
    return true;
};

export const getLoomWagesConsolidated = async (
    search: string | null = null,
    loomId: any = null,
    startDate: string = '2026-09-27'
) => {
    // Safely check if OpeningBalance column exists in loom_details
    try {
        const [cols]: any = await db.query(`SHOW COLUMNS FROM loom_details LIKE 'OpeningBalance'`);
        if (cols.length === 0) {
            await db.query(`ALTER TABLE loom_details ADD COLUMN OpeningBalance DECIMAL(12,2) NOT NULL DEFAULT 0.00`);
        }
    } catch (e) { }

    // Fetch loom default wage rates & opening balances
    const [loomsList]: any = await db.query(`SELECT LoomId, LoomName, COALESCE(WageRate, 0) AS DefaultWageRate, COALESCE(OpeningBalance, 0) AS OpeningBalance FROM loom_details`);
    const loomDefaultWageMap: Record<number, number> = {};
    const loomOpeningBalanceMap: Record<number, number> = {};
    for (const l of loomsList) {
        loomDefaultWageMap[l.LoomId] = parseFloat(l.DefaultWageRate) || 0;
        loomOpeningBalanceMap[l.LoomId] = parseFloat(l.OpeningBalance) || 0;
    }

    // Safely check if WageRate column exists in sizing_warp_details
    let hasWarpWageRateCol = false;
    try {
        const [cols]: any = await db.query(`SHOW COLUMNS FROM sizing_warp_details LIKE 'WageRate'`);
        hasWarpWageRateCol = cols.length > 0;
    } catch (e) { }

    // Fetch custom warp wage rates from warp_wage_rates and sizing_warp_details without duplicating rows
    const warpRateQueries = [
        `SELECT SizingId, WageRate FROM warp_wage_rates WHERE WageRate > 0`
    ];
    if (hasWarpWageRateCol) {
        warpRateQueries.push(`SELECT SizingId, WageRate FROM sizing_warp_details WHERE WageRate > 0`);
    }

    const [warpRatesList]: any = await db.query(
        `SELECT SizingId, MAX(WageRate) AS WageRate FROM (
            ${warpRateQueries.join(' UNION ALL ')}
         ) combined GROUP BY SizingId`
    );
    const warpWageMap: Record<number, number> = {};
    for (const w of warpRatesList) {
        if (w.SizingId) {
            warpWageMap[w.SizingId] = parseFloat(w.WageRate) || 0;
        }
    }

    // Direct 1:1 SELECT on sizing_summary_details (No Cartesian product joins!)
    let sql = `
        SELECT 
            SSD.DcId,
            SSD.LoomId,
            L.LoomName,
            SSD.Dc,
            DATE_FORMAT(SSD.Date, '%Y-%m-%d') AS Date,
            SSD.SizingId,
            S.Color,
            SSD.WarpId,
            COALESCE(CAST(SSD.Piece AS UNSIGNED), 0) AS Piece,
            COALESCE(CAST(SSD.Count AS UNSIGNED), 0) AS Count,
            ROUND(COALESCE(CAST(SSD.Weight AS DECIMAL(10,2)), 0), 2) AS Weight
        FROM sizing_summary_details SSD
        LEFT JOIN loom_details L ON SSD.LoomId = L.LoomId
        LEFT JOIN sizing S ON SSD.SizingId = S.SizingId
        WHERE SSD.Date >= ?
    `;

    const params: any[] = [startDate];

    if (loomId) {
        sql += ` AND SSD.LoomId = ?`;
        params.push(Number(loomId));
    }

    if (search && search.trim() !== '') {
        const searchEscaped = `%${search.trim().toLowerCase()}%`;
        sql += ` AND (LOWER(L.LoomName) LIKE ? OR LOWER(SSD.Dc) LIKE ? OR LOWER(S.Color) LIKE ?)`;
        params.push(searchEscaped, searchEscaped, searchEscaped);
    }

    sql += ` ORDER BY SSD.Date DESC, SSD.Dc DESC, SSD.DcId ASC`;

    const [detailRows]: any = await db.query(sql, params);

    // Group rows by LoomId + WeekStartDate
    const weeklyGroupMap: Record<string, {
        LoomId: number;
        LoomName: string;
        DefaultWageRate: number;
        WeekStartDate: string;
        WeekEndDate: string;
        TotalCount: number;
        TotalWeight: number;
        TotalCalculatedWages: number;
        DcMap: Record<string, {
            Dc: string;
            DcDate: string;
            SizingId?: number;
            Color: string;
            TotalCount: number;
            TotalWeight: number;
            TotalCalculatedWages: number;
            Pieces: any[];
        }>;
    }> = {};

    for (const row of detailRows) {
        if (!row.Date) continue;

        const { weekStart, weekEnd } = getWeekRange(row.Date);
        const weekKey = `${row.LoomId}_${weekStart}`;
        const loomDefaultRate = loomDefaultWageMap[row.LoomId] || 0;

        const customRate = row.SizingId ? warpWageMap[row.SizingId] : undefined;

        const effectiveWageRate = (customRate !== undefined && customRate > 0)
            ? customRate
            : loomDefaultRate;

        const pieceCount = Number(row.Count) || 0;
        const pieceCalculatedWage = pieceCount * effectiveWageRate;

        if (!weeklyGroupMap[weekKey]) {
            weeklyGroupMap[weekKey] = {
                LoomId: row.LoomId,
                LoomName: row.LoomName || 'Unassigned',
                DefaultWageRate: loomDefaultRate,
                WeekStartDate: weekStart,
                WeekEndDate: weekEnd,
                TotalCount: 0,
                TotalWeight: 0,
                TotalCalculatedWages: 0,
                DcMap: {}
            };
        }

        const weekGroup = weeklyGroupMap[weekKey];
        weekGroup.TotalCount += pieceCount;
        weekGroup.TotalWeight += Number(row.Weight) || 0;
        weekGroup.TotalCalculatedWages += pieceCalculatedWage;

        // Group DCs inside this week
        const dcKey = row.Dc || 'NO_DC';
        if (!weekGroup.DcMap[dcKey]) {
            weekGroup.DcMap[dcKey] = {
                Dc: row.Dc || '-',
                DcDate: row.Date,
                SizingId: row.SizingId,
                Color: row.Color || '-',
                TotalCount: 0,
                TotalWeight: 0,
                TotalCalculatedWages: 0,
                Pieces: []
            };
        }

        const dcGroup = weekGroup.DcMap[dcKey];
        dcGroup.TotalCount += pieceCount;
        dcGroup.TotalWeight += Number(row.Weight) || 0;
        dcGroup.TotalCalculatedWages += pieceCalculatedWage;

        dcGroup.Pieces.push({
            DcId: row.DcId,
            Date: row.Date,
            Piece: row.Piece,
            Count: pieceCount,
            Weight: Number(row.Weight) || 0,
            WarpId: row.WarpId,
            SizingId: row.SizingId,
            Color: row.Color || '-',
            WageRate: effectiveWageRate,
            HasCustomWarpRate: customRate !== undefined && customRate > 0,
            CalculatedWage: Number(pieceCalculatedWage.toFixed(2))
        });
    }

    // Fetch payments
    const [payments]: any = await db.query(
        `SELECT 
            PaymentId,
            LoomId,
            DATE_FORMAT(WeekStartDate, '%Y-%m-%d') AS WeekStartDate,
            Dc,
            DATE_FORMAT(DcDate, '%Y-%m-%d') AS DcDate,
            SizingId,
            DATE_FORMAT(PaymentDate, '%Y-%m-%d') AS PaymentDate,
            Amount,
            PaymentType,
            Note,
            CreatedAt
         FROM loom_wages_payments
         ORDER BY PaymentDate DESC, PaymentId DESC`
    );

    const weeklyPaymentsMap: Record<string, any[]> = {};
    for (const p of payments) {
        let key = '';
        if (p.WeekStartDate) {
            key = `${p.LoomId}_${p.WeekStartDate}`;
        } else if (p.DcDate) {
            const { weekStart } = getWeekRange(p.DcDate);
            key = `${p.LoomId}_${weekStart}`;
        }

        if (key) {
            if (!weeklyPaymentsMap[key]) {
                weeklyPaymentsMap[key] = [];
            }
            weeklyPaymentsMap[key].push({
                ...p,
                Amount: parseFloat(p.Amount) || 0
            });
        }
    }

    // Format consolidated list
    // Find earliest week for each LoomId in weeklyGroupMap to add OpeningBalance only once
    const loomEarliestWeekMap: Record<number, string> = {};
    for (const group of Object.values(weeklyGroupMap)) {
        if (!loomEarliestWeekMap[group.LoomId] || group.WeekStartDate < loomEarliestWeekMap[group.LoomId]) {
            loomEarliestWeekMap[group.LoomId] = group.WeekStartDate;
        }
    }

    const consolidatedList = Object.values(weeklyGroupMap).map(group => {
        const weekKey = `${group.LoomId}_${group.WeekStartDate}`;
        const itemPayments = weeklyPaymentsMap[weekKey] || [];
        const totalPaidAmount = itemPayments.reduce((sum, p) => sum + p.Amount, 0);
        const totalCalculatedWages = Number(group.TotalCalculatedWages.toFixed(2));

        // Add opening balance ONLY ONCE per loom (applied to its earliest week row)
        const isEarliestWeekForLoom = loomEarliestWeekMap[group.LoomId] === group.WeekStartDate;
        const loomOpeningBalance = Number((loomOpeningBalanceMap[group.LoomId] || 0).toFixed(2));
        const openingBalanceToAdd = isEarliestWeekForLoom ? loomOpeningBalance : 0;

        const balanceDue = Number((openingBalanceToAdd + totalCalculatedWages - totalPaidAmount).toFixed(2));

        const dcsList = Object.values(group.DcMap).map(dc => ({
            ...dc,
            TotalWeight: Number(dc.TotalWeight.toFixed(2)),
            TotalCalculatedWages: Number(dc.TotalCalculatedWages.toFixed(2))
        }));

        return {
            LoomId: group.LoomId,
            LoomName: group.LoomName,
            DefaultWageRate: group.DefaultWageRate,
            OpeningBalance: openingBalanceToAdd,
            WeekStartDate: group.WeekStartDate,
            WeekEndDate: group.WeekEndDate,
            TotalCount: group.TotalCount,
            TotalWeight: Number(group.TotalWeight.toFixed(2)),
            TotalCalculatedWages: totalCalculatedWages,
            TotalPaidAmount: Number(totalPaidAmount.toFixed(2)),
            BalanceDue: balanceDue,
            Dcs: dcsList,
            TotalDcsCount: dcsList.length,
            Payments: itemPayments
        };
    });

    consolidatedList.sort((a, b) => {
        if (b.WeekStartDate !== a.WeekStartDate) {
            return b.WeekStartDate.localeCompare(a.WeekStartDate);
        }
        return a.LoomName.localeCompare(b.LoomName);
    });

    return consolidatedList;
};

export const addLoomWagePayment = async (data: {
    LoomId: number;
    WeekStartDate: string;
    Dc?: string;
    DcDate?: string;
    SizingId?: number;
    PaymentDate: string;
    Amount: number;
    PaymentType: string;
    Note: string;
}) => {

    const { LoomId, WeekStartDate, Dc, DcDate, SizingId, PaymentDate, Amount, PaymentType, Note } = data;
    const [result]: any = await db.query(
        `INSERT INTO loom_wages_payments 
         (LoomId, WeekStartDate, Dc, DcDate, SizingId, PaymentDate, Amount, PaymentType, Note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            Number(LoomId),
            WeekStartDate || null,
            Dc || '',
            DcDate || null,
            SizingId ? Number(SizingId) : null,
            PaymentDate,
            Number(Amount),
            PaymentType || 'Cash',
            Note || null
        ]
    );

    return result;
};

export const deleteLoomWagePayment = async (paymentId: number) => {

    const [result]: any = await db.query(
        `DELETE FROM loom_wages_payments WHERE PaymentId = ?`,
        [Number(paymentId)]
    );

    return result.affectedRows;
};
