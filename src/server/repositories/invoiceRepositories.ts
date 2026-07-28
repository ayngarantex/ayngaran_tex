import db from '../config/db';

export const getInvoices = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null,
    page: number | null,
    limit: number | null
) => {
    let query = `
    SELECT I.*, C.*, C.Mobile AS CustomerMobile
    FROM invoice I
    LEFT JOIN customers C ON I.CustomerId = C.CustomerId
    WHERE 1=1
  `;

    if (search) {
        query += `
      AND (
        I.InvoiceNumber LIKE '%${search}%'
        OR C.CustomerName LIKE '%${search}%'
        OR C.GstNumber LIKE '%${search}%'
        OR I.InvoiceDate LIKE'%${search}%'
      )
    `;
    }

    if (startDate && endDate) {
        query += ` AND DATE(I.InvoiceDate) BETWEEN '${startDate}' AND '${endDate}' `;
    }

    if (billType) {
        query += ` AND I.BillType='${billType}' `;
    }

    if (orderBy === "pending") {
        query += ` ORDER BY 
            CASE WHEN (I.InvoiceAmount - I.ReceivedAmount) > 0 THEN 0 ELSE 1 END,
            I.InvoiceDate ASC`;
    } else if (orderBy === "InvoiceNumberASC") {
        query += ` ORDER BY I.InvoiceNumber ASC`;
    } else {
        query += ` ORDER BY I.InvoiceDate DESC, I.InvoiceId DESC`;
    }

    if (page && limit) {
        query += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
    }

    const [rows]: any = await db.query(query);
    const invoices: any[] = [];

    for (const row of rows) {
        let detQuery = `
            SELECT 
                ID.*,
                P.Id AS ProductId,
                P.Name AS ProductName
            FROM invoice_details ID
            LEFT JOIN products P ON ID.ItemId = P.Id
            WHERE ID.InvoiceId = ${row.InvoiceId}
        `;

        let detPayment = `
            SELECT PD.*
            FROM payment_details PD
            WHERE PD.InvoiceId = ${row.InvoiceId}
        `;

        const [details]: any = await db.query(detQuery);
        const [payments]: any = await db.query(detPayment);

        invoices.push({
            InvoiceId: row.InvoiceId,
            InvoiceNumber: row.InvoiceNumber,
            InvoiceDate: row.InvoiceDate,
            EwayBillNumber: row.EwayBillNumber,
            InvoiceAmount: row.InvoiceAmount,
            ReceivedAmount: row.ReceivedAmount,
            BalanceAmount: row.InvoiceAmount - row.ReceivedAmount,
            BillType: row.BillType,
            BeforeTax: row.BeforeTax,
            Cgst: row.Cgst,
            Sgst: row.Sgst,
            Igst: row.Igst,
            AfterTax: row.AfterTax,
            RoundOff: row.RoundOff,
            Discount: row.Discount,
            InvoiceType: row.InvoiceType,
            CustomerId: row.CustomerId,
            CustomerName: row.CustomerName,
            CustomerMobile: row.CustomerMobile,
            GstNumber: row.GstNumber,
            IsCancel: row.IsCancel,
            CancelReason: row.CancelReason,

            invoice_details: details.map((d: any) => ({
                InvoiceDetailId: d.InvoiceDetailId,
                ItemId: d.ItemId,
                ProductName: d.ProductName,
                Quantity: d.Quantity,
                Price: d.Price,
                Total: d.Total,
                Type: d.Type,

                products: {
                    Id: d.ProductId,
                    Name: d.ProductName,
                },
            })),

            invoice_payments: payments.map((p: any) => ({
                Id: p.Id,
                Date: p.Date,
                Amount: p.Amount,
                Type: p.Type,
                ReceivedBy: p.ReceivedBy,
            })),
        });
    }

    return invoices;
};

export const getInvoicesCount = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    let query = `
    SELECT COUNT(*) AS totalCount
    FROM invoice I
    LEFT JOIN customers C ON I.CustomerId = C.CustomerId
    WHERE 1=1
  `;

    if (search) {
        query += `
      AND (
        I.InvoiceNumber LIKE '%${search}%'
        OR C.CustomerName LIKE '%${search}%'
        OR C.GstNumber LIKE '%${search}%'
        OR I.InvoiceDate LIKE'%${search}%'
      )
    `;
    }

    if (startDate && endDate) {
        query += ` AND DATE(I.InvoiceDate) BETWEEN '${startDate}' AND '${endDate}' `;
    }

    if (billType) {
        query += ` AND I.BillType='${billType}' `;
    }
    const [rows]: any = await db.query(query);
    return rows[0].totalCount;
};

export const getInvoicesTotal = async (
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    billType: string | null,
    orderBy: string | null
) => {
    let query = `
    SELECT SUM(I.InvoiceAmount) AS TotalInvoiceAmount,
           SUM(I.ReceivedAmount) AS TotalReceivedAmount,
           SUM(I.InvoiceAmount - I.ReceivedAmount) AS TotalBalanceAmount,
           SUM(CASE WHEN I.IsCancel = 1 THEN I.InvoiceAmount ELSE 0 END) AS TotalCancelledAmount
    FROM invoice I
    LEFT JOIN customers C ON I.CustomerId = C.CustomerId
    WHERE 1=1
  `;

    if (search) {
        query += `
      AND (
        I.InvoiceNumber LIKE '%${search}%'
        OR C.CustomerName LIKE '%${search}%'
        OR C.GstNumber LIKE '%${search}%'
        OR I.InvoiceDate LIKE'%${search}%'
      )
    `;
    }

    if (startDate && endDate) {
        query += ` AND DATE(I.InvoiceDate) BETWEEN '${startDate}' AND '${endDate}' `;
    }

    if (billType) {
        query += ` AND I.BillType='${billType}' `;
    }
    const [rows]: any = await db.query(query);
    return rows[0];
};

export const getLastInvoiceNumber = async (billType: string | null) => {
    let query = `
    SELECT InvoiceNumber
    FROM invoice
  `;

    if (billType === "gst") {
        query += ` WHERE BillType = 'gst' `;
    } else {
        query += ` WHERE BillType != 'gst' `;
    }
    query += ` ORDER BY InvoiceDate DESC, InvoiceId DESC LIMIT 1`;

    const [rows]: any = await db.query(query);
    return rows[0]?.InvoiceNumber;
};

export const createInvoice = async (invoiceData: any) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [result]: any = await conn.query(
            "INSERT INTO invoice (InvoiceNumber, InvoiceDate, InvoiceType, CustomerId, EwayBillNumber, BillType, BeforeTax, TaxPercentage, Cgst, Sgst, Igst, AfterTax, RoundOff, Discount, InvoiceAmount, ReceivedAmount, IsCancel, CancelReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [invoiceData.InvoiceNumber, invoiceData.InvoiceDate, invoiceData.InvoiceType, invoiceData.CustomerId, invoiceData.EwayBillNumber, invoiceData.BillType, invoiceData.BeforeTax, invoiceData.TaxPercentage, invoiceData.Cgst, invoiceData.Sgst, invoiceData.Igst, invoiceData.AfterTax, invoiceData.RoundOff, invoiceData.Discount, invoiceData.InvoiceAmount, invoiceData.ReceivedAmount, invoiceData.IsCancel, invoiceData.CancelReason]
        );

        const invoiceId = result.insertId;

        if (invoiceData.products && invoiceData.products.length > 0) {
            for (const item of invoiceData.products) {
                await conn.query(
                    `INSERT INTO invoice_details (InvoiceId, ItemId, ProductName, Quantity, QuantityType, Price, Type, Total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [invoiceId, item.product, item.productName, item.quantity, item.quantityType, item.price, item.type, item.price * item.quantity]
                );
            }
        }

        if (invoiceData.retrunProducts && invoiceData.retrunProducts.length > 0) {
            for (const item of invoiceData.retrunProducts) {
                await conn.query(
                    `INSERT INTO invoice_return_details (InvoiceId, ItemId, ProductName, Quantity, Price) VALUES (?, ?, ?, ?, ?)`,
                    [invoiceId, item.product, item.productName, item.quantity, item.price]
                );
            }
        }

        if (invoiceData.payments && invoiceData.payments.length > 0) {
            for (const item of invoiceData.payments) {
                await conn.query(
                    `INSERT INTO payment_details (InvoiceId, Date, Amount, Type, ReceivedBy) VALUES (?, ?, ?, ?, ?)`,
                    [invoiceId, item.date, item.amount, item.type, item.to]
                );
            }
        }

        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const getInvoice = async (id: any) => {
    const conn = await db.getConnection();

    try {
        const query = `
            SELECT I.*
            FROM invoice I
            WHERE I.InvoiceId = ?
        `;

        const [rows]: any = await conn.query(query, [Number(id)]);

        let detailsQuery = `SELECT *, ID.Type AS Type FROM invoice_details ID 
            LEFT JOIN products P ON ID.ItemId = P.Id
            WHERE ID.InvoiceId = ?`;

        const [details]: any = await conn.query(detailsQuery, [Number(id)]);

        let payemntQuery = `SELECT * FROM payment_details PD 
            WHERE PD.InvoiceId = ?`;

        const [payments]: any = await conn.query(payemntQuery, [Number(id)]);

        let returnProductsQuery = `SELECT * FROM invoice_return_details IRD 
            LEFT JOIN products P ON IRD.ItemId = P.Id
            WHERE IRD.InvoiceId = ?`;

        const [returnProducts]: any = await conn.query(returnProductsQuery, [Number(id)]);

        let invoice = rows[0];
        if (invoice) {
            invoice.invoice_details = details;
            invoice.invoice_payments = payments;
            invoice.invoice_return_details = returnProducts;
        }

        return invoice;
    } finally {
        conn.release();
    }
};

export const updateInvoice = async (invoiceData: any) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        await conn.query(
            "UPDATE invoice SET InvoiceNumber = ?, InvoiceDate = ?, InvoiceType = ?, CustomerId = ?, EwayBillNumber = ?, BillType = ?, BeforeTax = ?, TaxPercentage = ?, Cgst = ?, Sgst = ?, Igst = ?, AfterTax = ?, RoundOff = ?, Discount = ?, InvoiceAmount = ?, ReceivedAmount = ?, IsCancel = ?, CancelReason = ? WHERE InvoiceId = ?",
            [invoiceData.InvoiceNumber, invoiceData.InvoiceDate, invoiceData.InvoiceType, invoiceData.CustomerId, invoiceData.EwayBillNumber, invoiceData.BillType, invoiceData.BeforeTax, invoiceData.TaxPercentage, invoiceData.Cgst, invoiceData.Sgst, invoiceData.Igst, invoiceData.AfterTax, invoiceData.RoundOff, invoiceData.Discount, invoiceData.InvoiceAmount, invoiceData.ReceivedAmount, invoiceData.IsCancel, invoiceData.CancelReason, invoiceData.InvoiceId]
        );

        await conn.query(
            "DELETE FROM invoice_details WHERE InvoiceId = ?",
            [invoiceData.InvoiceId]
        );

        await conn.query(
            "DELETE FROM payment_details WHERE InvoiceId = ?",
            [invoiceData.InvoiceId]
        );

        await conn.query(
            "DELETE FROM invoice_return_details WHERE InvoiceId = ?",
            [invoiceData.InvoiceId]
        );

        if (invoiceData.products && invoiceData.products.length > 0) {
            for (const item of invoiceData.products) {
                await conn.query(
                    `INSERT INTO invoice_details (InvoiceId, ItemId, ProductName, Quantity, QuantityType, Price, Type, Total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [invoiceData.InvoiceId, item.product, item.productName, item.quantity, item.quantityType, item.price, item.type, item.price * item.quantity]
                );
            }
        }

        if (invoiceData.returnProducts && invoiceData.returnProducts.length > 0) {
            for (const item of invoiceData.returnProducts) {
                await conn.query(
                    `INSERT INTO invoice_return_details (InvoiceId, ItemId, ProductName, Quantity, QuantityType, Price, Type, Total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [invoiceData.InvoiceId, item.product, item.productName, item.quantity, item.quantityType, item.price, item.type, item.price * item.quantity]
                );
            }
        }

        if (invoiceData.payments && invoiceData.payments.length > 0) {
            for (const item of invoiceData.payments) {
                await conn.query(
                    `INSERT INTO payment_details (InvoiceId, Date, Amount, Type, ReceivedBy) VALUES (?, ?, ?, ?, ?)`,
                    [invoiceData.InvoiceId, item.date, item.amount, item.type, item.to]
                );
            }
        }

        await conn.commit();
        return true;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const deleteInvoice = async (id: any) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        await conn.query(
            "DELETE FROM invoice_details WHERE InvoiceId = ?",
            [id]
        );

        await conn.query(
            "DELETE FROM payment_details WHERE InvoiceId = ?",
            [id]
        );

        await conn.query(
            "DELETE FROM invoice_return_details WHERE InvoiceId = ?",
            [id]
        );

        const [result]: any = await conn.query(
            "DELETE FROM invoice WHERE InvoiceId = ?",
            [id]
        );

        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const getCustomerInvoices = async (CustomerId: any, startDate: string | null, endDate: string | null, billType?: string | null) => {
    const conn = await db.getConnection();

    try {
        let query = `
            SELECT 
                I.*,
                CASE WHEN I.IsCancel = 1 THEN 0 ELSE I.InvoiceAmount END AS InvoiceAmount,  
                CASE WHEN I.IsCancel = 1 THEN 0 ELSE I.InvoiceAmount - I.ReceivedAmount END AS BalanceAmount
            FROM invoice I 
            WHERE I.CustomerId = ?
        `;

        const params: any[] = [Number(CustomerId)];

        if (startDate && endDate) {
            query += `
                AND I.InvoiceDate >= ?
                AND I.InvoiceDate <= ?
            `;

            params.push(startDate, endDate);
        }

        if (billType) {
            query += ` AND I.BillType = ?`;
            params.push(billType);
        }

        query += ` ORDER BY I.InvoiceDate ASC`;

        const [rows]: any = await conn.query(query, params);
        const invoices: any[] = [];

        for (const row of rows) {
            let detQuery = `
                SELECT 
                    ID.*,
                    P.Id AS ProductId,
                    P.Name AS ProductName
                FROM invoice_details ID
                LEFT JOIN products P ON ID.ItemId = P.Id
                WHERE ID.InvoiceId = ${row.InvoiceId}
            `;

            const [details]: any = await db.query(detQuery);

            invoices.push({
                ...row,
                invoice_details: details.map((d: any) => ({
                    InvoiceDetailId: d.InvoiceDetailId,
                    ItemId: d.ItemId,
                    ProductName: d.ProductName,
                    Quantity: d.Quantity,
                    Price: d.Price,
                    Total: d.Total,
                    Type: d.Type,

                    products: {
                        Id: d.ProductId,
                        Name: d.ProductName,
                    },
                })),
            });
        }
        return invoices;
    } finally {
        conn.release();
    }
};

export const getCustomerPayments = async (CustomerId: any, startDate: string | null, endDate: string | null, billType?: string | null) => {
    const conn = await db.getConnection();

    try {
        let query = `
            SELECT 
                PD.*, 
                I.InvoiceNumber,
                I.BillType
            FROM payment_details PD
            LEFT JOIN invoice I 
                ON PD.InvoiceId = I.InvoiceId
            WHERE I.CustomerId = ?
        `;

        const params: any[] = [Number(CustomerId)];

        if (startDate && endDate) {
            query += `
                AND I.InvoiceDate BETWEEN ? AND ?
            `;

            params.push(startDate, endDate);
        }

        if (billType) {
            query += ` AND I.BillType = ?`;
            params.push(billType);
        }

        query += ` ORDER BY I.InvoiceDate DESC`;

        const [rows]: any = await conn.query(query, params);
        return rows;
    } finally {
        conn.release();
    }
};
