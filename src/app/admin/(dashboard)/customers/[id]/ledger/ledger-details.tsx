import LedgerInvoicePayment from './ledger-invoice-payment';

export default async function LedgerDetails({ customer, invoices, payments, startDate, endDate }: { customer: any, invoices: any[], payments: any[], startDate: string, endDate: string }) {
    return (
        <LedgerInvoicePayment
            customer={customer}
            invoices={invoices}
            payments={payments}
            startDate={startDate}
            endDate={endDate}
        />
    )
}