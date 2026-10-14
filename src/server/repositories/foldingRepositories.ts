import db from '../config/db';

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

export const getFoldingEntries = async (
    search: string | null = null,
    page: number | null = 1,
    limit: number | null = 20
) => {

    let sql = `
        SELECT 
            FE.FoldingId,
            DATE_FORMAT(FE.Date, '%Y-%m-%d') AS Date,
            FE.DcNumber,
            FE.LoomId,
            FE.Type,
            COALESCE(L.LoomName, FE.Folder) AS Folder,
            FE.TotalCount,
            FE.Items,
            FE.Notes,
            FE.CreatedAt
        FROM folding_entries FE
        LEFT JOIN loom_details L ON FE.LoomId = L.LoomId
    `;
    const params: any[] = [];

    if (search && search.trim() !== '') {
        const searchEscaped = `%${search.trim().toLowerCase()}%`;
        sql += ` WHERE (LOWER(FE.DcNumber) LIKE ? OR LOWER(FE.Notes) LIKE ? OR LOWER(FE.Folder) LIKE ? OR LOWER(L.LoomName) LIKE ? OR LOWER(FE.Type) LIKE ? OR DATE_FORMAT(FE.Date, '%Y-%m-%d') LIKE ?)`;
        params.push(searchEscaped, searchEscaped, searchEscaped, searchEscaped, searchEscaped, searchEscaped);
    }

    sql += ` ORDER BY FE.Date DESC, FE.FoldingId DESC`;

    if (page && limit) {
        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), (Number(page) - 1) * Number(limit));
    }

    const [rows]: any = await db.query(sql, params);

    return rows.map((row: any) => {
        let parsedItems: Record<string, number> = {};
        if (typeof row.Items === 'string') {
            try {
                parsedItems = JSON.parse(row.Items);
            } catch (e) {
                parsedItems = {};
            }
        } else if (typeof row.Items === 'object' && row.Items !== null) {
            parsedItems = row.Items;
        }

        return {
            ...row,
            Items: parsedItems
        };
    });
};

export const getFoldingCount = async (search: string | null = null) => {

    let sql = `
        SELECT COUNT(*) AS count 
        FROM folding_entries FE
        LEFT JOIN loom_details L ON FE.LoomId = L.LoomId
    `;
    const params: any[] = [];

    if (search && search.trim() !== '') {
        const searchEscaped = `%${search.trim().toLowerCase()}%`;
        sql += ` WHERE (LOWER(FE.DcNumber) LIKE ? OR LOWER(FE.Notes) LIKE ? OR LOWER(FE.Folder) LIKE ? OR LOWER(L.LoomName) LIKE ? OR LOWER(FE.Type) LIKE ? OR DATE_FORMAT(FE.Date, '%Y-%m-%d') LIKE ?)`;
        params.push(searchEscaped, searchEscaped, searchEscaped, searchEscaped, searchEscaped, searchEscaped);
    }

    const [rows]: any = await db.query(sql, params);
    return rows[0]?.count || 0;
};

export const getFoldingById = async (id: number) => {

    const [rows]: any = await db.query(
        `SELECT 
            FE.FoldingId,
            DATE_FORMAT(FE.Date, '%Y-%m-%d') AS Date,
            FE.DcNumber,
            FE.LoomId,
            FE.Type,
            COALESCE(L.LoomName, FE.Folder) AS Folder,
            FE.TotalCount,
            FE.Items,
            FE.Notes,
            FE.CreatedAt
         FROM folding_entries FE
         LEFT JOIN loom_details L ON FE.LoomId = L.LoomId
         WHERE FE.FoldingId = ?`,
        [Number(id)]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    let parsedItems: Record<string, number> = {};
    if (typeof row.Items === 'string') {
        try {
            parsedItems = JSON.parse(row.Items);
        } catch (e) {
            parsedItems = {};
        }
    } else if (typeof row.Items === 'object' && row.Items !== null) {
        parsedItems = row.Items;
    }

    return {
        ...row,
        Items: parsedItems
    };
};

export const createFoldingEntry = async (data: {
    Date: string;
    DcNumber?: string;
    LoomId?: number;
    Type?: string;
    Folder?: string;
    Items: Record<string, number>;
    Notes?: string;
}) => {

    const { Date, DcNumber, LoomId, Type, Folder, Items, Notes } = data;
    const itemsJson = typeof Items === 'string' ? Items : JSON.stringify(Items || {});

    let totalCount = 0;
    if (Items && typeof Items === 'object') {
        for (const val of Object.values(Items)) {
            totalCount += Number(val) || 0;
        }
    }

    // Default LoomId to 30036 ("R Tex Folding") if folder is R Tex and no LoomId specified
    const finalLoomId = LoomId || (Folder === 'R Tex' || Folder === 'R Tex Folding' ? 30036 : null);

    const [result]: any = await db.query(
        `INSERT INTO folding_entries (Date, DcNumber, LoomId, Type, Folder, TotalCount, Items, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [Date, DcNumber || null, finalLoomId, Type || 'Given', Folder || null, totalCount, itemsJson, Notes || null]
    );

    return result;
};

export const updateFoldingEntry = async (
    id: number,
    data: {
        Date: string;
        DcNumber?: string;
        LoomId?: number;
        Type?: string;
        Folder?: string;
        Items: Record<string, number>;
        Notes?: string;
    }
) => {

    const { Date, DcNumber, LoomId, Type, Folder, Items, Notes } = data;
    const itemsJson = typeof Items === 'string' ? Items : JSON.stringify(Items || {});

    let totalCount = 0;
    if (Items && typeof Items === 'object') {
        for (const val of Object.values(Items)) {
            totalCount += Number(val) || 0;
        }
    }

    const finalLoomId = LoomId || (Folder === 'R Tex' || Folder === 'R Tex Folding' ? 30036 : null);

    const [result]: any = await db.query(
        `UPDATE folding_entries SET Date = ?, DcNumber = ?, LoomId = ?, Type = ?, Folder = ?, TotalCount = ?, Items = ?, Notes = ? WHERE FoldingId = ?`,
        [Date, DcNumber || null, finalLoomId, Type || 'Given', Folder || null, totalCount, itemsJson, Notes || null, Number(id)]
    );

    return result.affectedRows;
};

export const deleteFoldingEntry = async (id: number) => {

    const [result]: any = await db.query(
        `DELETE FROM folding_entries WHERE FoldingId = ?`,
        [Number(id)]
    );

    return result.affectedRows;
};

// ==========================================
// Weekly Consolidated Grouping & Payments
// ==========================================

export const getFoldingWagesConsolidated = async (
    search: string | null = null,
    loomId: string | number | null = null,
    startDate: string = '2026-09-27'
) => {

    // 1. Fetch loom default wage rates and opening balances
    const [loomsList]: any = await db.query(
        `SELECT LoomId, LoomName, COALESCE(WageRate, 0) AS WageRate, COALESCE(OpeningBalance, 0) AS OpeningBalance FROM loom_details`
    );
    const loomMap: Record<number, { LoomName: string; WageRate: number; OpeningBalance: number }> = {};
    for (const l of loomsList) {
        loomMap[l.LoomId] = {
            LoomName: l.LoomName,
            WageRate: parseFloat(l.WageRate) || 0,
            OpeningBalance: parseFloat(l.OpeningBalance) || 0
        };
    }

    // 2. Fetch folding entries (optionally filtered by startDate)
    let sql = `
        SELECT 
            FE.FoldingId,
            DATE_FORMAT(FE.Date, '%Y-%m-%d') AS Date,
            FE.DcNumber,
            COALESCE(FE.LoomId, 30036) AS LoomId,
            COALESCE(L.LoomName, FE.Folder, 'R Tex Folding') AS LoomName,
            COALESCE(FE.Type, 'Given') AS Type,
            FE.Folder,
            FE.TotalCount,
            FE.Items,
            FE.Notes,
            FE.CreatedAt
        FROM folding_entries FE
        LEFT JOIN loom_details L ON FE.LoomId = L.LoomId
        WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate) {
        sql += ` AND FE.Date >= ?`;
        params.push(startDate);
    }

    if (loomId) {
        sql += ` AND (FE.LoomId = ? OR (FE.LoomId IS NULL AND ? = 30036))`;
        params.push(Number(loomId), Number(loomId));
    }

    if (search && search.trim() !== '') {
        const searchEscaped = `%${search.trim().toLowerCase()}%`;
        sql += ` AND (LOWER(FE.DcNumber) LIKE ? OR LOWER(FE.Notes) LIKE ? OR LOWER(L.LoomName) LIKE ? OR LOWER(FE.Folder) LIKE ?)`;
        params.push(searchEscaped, searchEscaped, searchEscaped, searchEscaped);
    }

    sql += ` ORDER BY FE.Date DESC, FE.FoldingId DESC`;

    const [entries]: any = await db.query(sql, params);

    // Group folding entries by LoomId + WeekStartDate
    const weeklyGroupMap: Record<string, {
        LoomId: number;
        LoomName: string;
        WageRate: number;
        WeekStartDate: string;
        WeekEndDate: string;
        TotalGivenCount: number;
        TotalReturnCount: number;
        NetPieces: number;
        TotalCalculatedWages: number;
        ItemsSummary: Record<string, { given: number; return: number; net: number }>;
        Entries: any[];
    }> = {};

    for (const row of entries) {
        if (!row.Date) continue;

        let parsedItems: Record<string, number> = {};
        if (typeof row.Items === 'string') {
            try { parsedItems = JSON.parse(row.Items); } catch (e) { parsedItems = {}; }
        } else if (typeof row.Items === 'object' && row.Items !== null) {
            parsedItems = row.Items;
        }

        const effectiveLoomId = Number(row.LoomId) || 30036;
        const loomInfo = loomMap[effectiveLoomId] || { LoomName: row.LoomName || 'R Tex Folding', WageRate: 2.10, OpeningBalance: 0 };
        const { weekStart, weekEnd } = getWeekRange(row.Date);
        const weekKey = `${effectiveLoomId}_${weekStart}`;

        if (!weeklyGroupMap[weekKey]) {
            weeklyGroupMap[weekKey] = {
                LoomId: effectiveLoomId,
                LoomName: loomInfo.LoomName,
                WageRate: loomInfo.WageRate,
                WeekStartDate: weekStart,
                WeekEndDate: weekEnd,
                TotalGivenCount: 0,
                TotalReturnCount: 0,
                NetPieces: 0,
                TotalCalculatedWages: 0,
                ItemsSummary: {},
                Entries: []
            };
        }

        const group = weeklyGroupMap[weekKey];
        const count = Number(row.TotalCount) || 0;
        const isReturn = row.Type === 'Return';

        if (isReturn) {
            group.TotalReturnCount += count;
        } else {
            group.TotalGivenCount += count;
        }

        // Update item by item summary (Given adds, Return reduces)
        for (const [itemName, itemQty] of Object.entries(parsedItems)) {
            const qty = Number(itemQty) || 0;
            if (!group.ItemsSummary[itemName]) {
                group.ItemsSummary[itemName] = { given: 0, return: 0, net: 0 };
            }
            if (isReturn) {
                group.ItemsSummary[itemName].return += qty;
            } else {
                group.ItemsSummary[itemName].given += qty;
            }
            group.ItemsSummary[itemName].net = group.ItemsSummary[itemName].given - group.ItemsSummary[itemName].return;
        }

        group.Entries.push({
            ...row,
            Items: parsedItems
        });
    }

    // Calculate wages and net pieces for each group
    for (const group of Object.values(weeklyGroupMap)) {
        group.NetPieces = group.TotalGivenCount - group.TotalReturnCount;
        group.TotalCalculatedWages = Number((group.TotalReturnCount * group.WageRate).toFixed(2));
    }

    // 3. Fetch folding payments
    const [payments]: any = await db.query(`
        SELECT 
            PaymentId,
            LoomId,
            DATE_FORMAT(WeekStartDate, '%Y-%m-%d') AS WeekStartDate,
            DATE_FORMAT(PaymentDate, '%Y-%m-%d') AS PaymentDate,
            Amount,
            PaymentType,
            Note,
            CreatedAt
        FROM folding_payments
        ORDER BY PaymentDate DESC, PaymentId DESC
    `);

    const weeklyPaymentsMap: Record<string, any[]> = {};
    for (const p of payments) {
        const key = `${p.LoomId}_${p.WeekStartDate}`;
        if (!weeklyPaymentsMap[key]) {
            weeklyPaymentsMap[key] = [];
        }
        weeklyPaymentsMap[key].push({
            ...p,
            Amount: parseFloat(p.Amount) || 0
        });
    }

    // 4. Find earliest week for each loom to apply opening balance only once
    const loomEarliestWeekMap: Record<number, string> = {};
    for (const group of Object.values(weeklyGroupMap)) {
        if (!loomEarliestWeekMap[group.LoomId] || group.WeekStartDate < loomEarliestWeekMap[group.LoomId]) {
            loomEarliestWeekMap[group.LoomId] = group.WeekStartDate;
        }
    }

    // 5. Build final consolidated list
    const consolidatedList = Object.values(weeklyGroupMap).map(group => {
        const weekKey = `${group.LoomId}_${group.WeekStartDate}`;
        const itemPayments = weeklyPaymentsMap[weekKey] || [];
        const totalPaidAmount = itemPayments.reduce((sum, p) => sum + p.Amount, 0);

        const isEarliestWeek = loomEarliestWeekMap[group.LoomId] === group.WeekStartDate;
        const loomOpeningBalance = loomMap[group.LoomId]?.OpeningBalance || 0;
        const openingBalanceToAdd = isEarliestWeek ? loomOpeningBalance : 0;

        const balanceDue = Number((openingBalanceToAdd + group.TotalCalculatedWages - totalPaidAmount).toFixed(2));

        return {
            LoomId: group.LoomId,
            LoomName: group.LoomName,
            WageRate: group.WageRate,
            OpeningBalance: openingBalanceToAdd,
            WeekStartDate: group.WeekStartDate,
            WeekEndDate: group.WeekEndDate,
            TotalGivenCount: group.TotalGivenCount,
            TotalReturnCount: group.TotalReturnCount,
            NetPieces: group.NetPieces,
            TotalCalculatedWages: group.TotalCalculatedWages,
            TotalPaidAmount: Number(totalPaidAmount.toFixed(2)),
            BalanceDue: balanceDue,
            ItemsSummary: group.ItemsSummary,
            Entries: group.Entries,
            TotalDcsCount: group.Entries.length,
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

export const addFoldingPayment = async (data: {
    LoomId: number;
    WeekStartDate: string;
    PaymentDate: string;
    Amount: number;
    PaymentType: string;
    Note?: string;
}) => {
    const { LoomId, WeekStartDate, PaymentDate, Amount, PaymentType, Note } = data;
    const [result]: any = await db.query(
        `INSERT INTO folding_payments (LoomId, WeekStartDate, PaymentDate, Amount, PaymentType, Note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            Number(LoomId),
            WeekStartDate,
            PaymentDate,
            Number(Amount),
            PaymentType || 'Cash',
            Note || null
        ]
    );

    return result;
};

export const deleteFoldingPayment = async (paymentId: number) => {

    const [result]: any = await db.query(
        `DELETE FROM folding_payments WHERE PaymentId = ?`,
        [Number(paymentId)]
    );

    return result.affectedRows;
};

export const updateFoldingLoomWageRate = async (loomId: number, rate: number) => {
    await db.query(
        `UPDATE loom_details SET WageRate = ? WHERE LoomId = ?`,
        [Number(rate) || 0, Number(loomId)]
    );
    return true;
};

export const updateFoldingLoomOpeningBalance = async (loomId: number, balance: number) => {
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
