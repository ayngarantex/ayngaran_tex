import { fetchCustomerInvoices, fetchCustomerPayments } from '@/app/api/node/invoice';
import { fetchCustomerById, fetchCustomers } from '@/app/api/node/customers';
import Financialyear from '@/app/lib/financialyear';
import { formatCurrency, formatDateNew } from '@/app/lib/utils';
import Link from 'next/link';
import LedgerDetails from './ledger-details';
import CustomerLedgerSelect from './customer-ledger-select';

export default async function Page(props:
    {
        params: Promise<{ id: string }>
        searchParams?: Promise<{ startDate?: string; endDate?: string; billType?: string; }>
    }
) {
    const params = await props.params;
    const CustomerId = parseInt(params.id);
    const searchParams = await props.searchParams;
    const startDate: string = searchParams?.startDate || '';
    const endDate: string = searchParams?.endDate || '';
    const billType: string = searchParams?.billType || '';
    const customer = await fetchCustomerById(String(CustomerId));
    // const cusNew = await fetchCustomerById(CustomerId);
    const invoices = await fetchCustomerInvoices(CustomerId, startDate, endDate, billType);
    const paymentDetails = await fetchCustomerPayments(CustomerId, startDate, endDate, billType);
    const customers = await fetchCustomers('', 0, "", "", "");

    const grouped: Record<string, { newDate: string; Date: string; BillType: string; InvoiceNumber: (string | number)[]; Type: string, TotalPaid: number }> = {};

    paymentDetails.forEach((pay: any) => {
        const date = pay.Date; // yyyy-mm-dd
        const InvoiceNumber = pay.InvoiceNumber;
        const BillType = pay.BillType || "Unknown";

        const key = `${date}_${BillType}`;

        if (!grouped[key]) {
            grouped[key] = {
                newDate: formatDateNew(date),
                Date: date,
                Type: pay.Type,
                TotalPaid: 0,
                BillType,
                InvoiceNumber: [],
            };
        }

        // ✅ Add each invoice to its *own BillType group*
        if (!grouped[key].InvoiceNumber.includes(InvoiceNumber)) {
            grouped[key].InvoiceNumber.push(InvoiceNumber);
        }

        grouped[key].TotalPaid += pay.InvoiceType === 'Credit Note' ? 0 : Number(pay.Amount);
    });

    const payments = Object.values(grouped);

    return (
        <main>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/admin/customers"
                    className="flex h-10 items-center rounded-lg bg-blue-400 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-300"
                >
                    Back
                </Link>
            </div>
            <div className="flex w-full mb-2">
                <h1 className={`text-2xl self-center`}>Customer&nbsp;Details</h1>
                <div className='w-80 ml-8'>
                    <Financialyear
                        hidePage={true}
                        hideBillType={true}
                    />
                </div>
                {/* ({startDate ? `${startDate} - ${endDate}` : ''} - {billType}) */}
            </div>
            <div className="rounded-md bg-blue-50 p-4 md:p-6">
                <div className='flex flex-wrap mb-6'>
                    <div className="mb-4 w-1/4">
                        <label htmlFor="name" className="mb-2 block text-sm font-bold text-gray-700">
                            Customer Name
                        </label>
                        <div className="relative mt-2">
                            <CustomerLedgerSelect
                                customers={customers}
                                currentCustomerId={CustomerId}
                                currentCustomerName={customer?.CustomerName || ''}
                            />
                        </div>
                    </div>
                    <div className="mb-4 w-1/4 pl-8">
                        <label htmlFor="name" className="mb-2 text-sm font-bold">
                            GST Number
                        </label>
                        <div className="relative mt-2 tex-lg">
                            {customer?.GstNumber}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4 pl-8">
                        <label htmlFor="customer" className="mb-2 block text-sm font-bold">
                            State
                        </label>
                        <div className="relative mt-2 tex-lg">
                            {customer?.State}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4 pl-8">
                        <label htmlFor="customer" className="mb-2 block text-sm font-bold">
                            Mobile
                        </label>
                        <div className="relative mt-2 tex-lg">
                            {customer?.Mobile}
                        </div>
                    </div>
                </div>
                <div className='flex flex-wrap mb-6'>
                    <div className="mb-4 w-1/4">
                        <label htmlFor="mobile" className="mb-2 block f text-sm font-bold">
                            Total Purchased
                        </label>
                        <div className="relative mt-2 tex-2xl text-blue-600">
                            {formatCurrency(invoices.filter((invoice: any) => invoice.InvoiceType !== 'Credit Note').reduce((sum: number, item: any) => sum + (item?.InvoiceAmount || 0), 0))}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4">
                        <label htmlFor="mobile" className="mb-2 block f text-sm font-bold">
                            Total Paid
                        </label>
                        <div className="relative mt-2 tex-2xl text-blue-600">
                            {formatCurrency(payments.reduce((sum, item) => sum + item.TotalPaid, 0))}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4">
                        <label htmlFor="mobile" className="mb-2 block f text-sm font-bold">
                            Balance
                        </label>
                        <div className="relative mt-2 tex-2xl text-red-600">
                            {formatCurrency(invoices.filter((invoice: any) => invoice.InvoiceType !== 'Credit Note').reduce((sum: number, item: any) => sum + (item?.InvoiceAmount || 0), 0) - payments.reduce((sum: number, item: any) => sum + item.TotalPaid, 0))}
                        </div>
                    </div>
                </div>
            </div>
            <LedgerDetails customer={customer} invoices={invoices} payments={payments} startDate={startDate} endDate={endDate} />
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/admin/customers"
                    className="flex h-10 items-center rounded-lg bg-blue-400 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-300"
                >
                    Back
                </Link>
            </div>
        </main>
    );
}