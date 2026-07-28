import { fetchYarnBySupplierId, fetchPaymentBySupplierId, fetchSupplierById } from '@/app/lib/data';
import { formatCurrency, formatDate, formatDateToLocal } from '@/app/lib/utils';
import YarnStatus from '@/app/ui/yarns/status';
import Link from 'next/link';

export default async function Page(props:
    {
        params: Promise<{ id: string }>
        searchParams?: Promise<{ startDate?: string; endDate?: string; billType?: string; }>
    }
) {
    const params = await props.params;
    const SupplierId = parseInt(params.id);
    const searchParams = await props.searchParams;
    const startDate: string = searchParams?.startDate || '';
    const endDate: string = searchParams?.endDate || '';
    const billType: string = searchParams?.billType || '';
    const customer = await fetchSupplierById(SupplierId);
    const invoices = await fetchYarnBySupplierId(SupplierId, startDate, endDate, billType);
    const paymentDetails = await fetchPaymentBySupplierId(SupplierId, startDate, endDate, billType)

    const grouped: Record<string, { Date: string; Type: string, TotalPaid: number }> = {};

    paymentDetails.forEach((pay: any) => {
        const date = pay.Date.toISOString().split("T")[0]; // yyyy-mm-dd

        const key = `${date}`;

        if (!grouped[key]) {
            grouped[key] = {
                Date: date,
                Type: pay.Type,
                TotalPaid: 0,
            };
        }

        grouped[key].TotalPaid += Number(pay.Amount);
    });

    const payments = Object.values(grouped);

    return (
        <main>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/admin/suppliers"
                    className="flex h-10 items-center rounded-lg bg-blue-400 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-300"
                >
                    Back
                </Link>
            </div>
            <div className="flex w-full items-center justify-between">
                <h1 className={`text-2xl`}>Supplier Details ({startDate ? `${startDate} - ${endDate}` : ''} - {billType})</h1>
            </div>
            <div className="rounded-md bg-blue-50 p-4 md:p-6">
                <div className='flex flex-wrap mb-6'>
                    <div className="mb-4 w-1/4">
                        <label htmlFor="name" className="mb-2 text-sm font-bold">
                            Supplier Name
                        </label>
                        <div className="relative mt-2 tex-lg">
                            {customer?.[0].Name}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4 pl-8">
                        <label htmlFor="name" className="mb-2 text-sm font-bold">
                            GST Number
                        </label>
                        <div className="relative mt-2 tex-lg">
                            {customer?.[0].GstNumber}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4 pl-8">
                        <label htmlFor="customer" className="mb-2 block text-sm font-bold">
                            State
                        </label>
                        <div className="relative mt-2 tex-lg">
                            {customer?.[0].State}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4 pl-8">
                        <label htmlFor="customer" className="mb-2 block text-sm font-bold">
                            Mobile
                        </label>
                        <div className="relative mt-2 tex-lg">
                            {customer?.[0].Mobile}
                        </div>
                    </div>
                </div>
                <div className='flex flex-wrap mb-6'>
                    <div className="mb-4 w-1/4">
                        <label htmlFor="mobile" className="mb-2 block f text-sm font-bold">
                            Total Purchased
                        </label>
                        <div className="relative mt-2 tex-2xl text-blue-600">
                            {formatCurrency(invoices.reduce((sum: number, item: any) => sum + (item?.InvoiceAmount || 0), 0))}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4">
                        <label htmlFor="mobile" className="mb-2 block f text-sm font-bold">
                            Total Paid
                        </label>
                        <div className="relative mt-2 tex-2xl text-blue-600">
                            {formatCurrency(payments.reduce((sum: number, item: any) => sum + item.TotalPaid, 0))}
                        </div>
                    </div>
                    <div className="mb-4 w-1/4">
                        <label htmlFor="mobile" className="mb-2 block f text-sm font-bold">
                            Balance
                        </label>
                        <div className="relative mt-2 tex-2xl text-red-600">
                            {formatCurrency(invoices.reduce((sum: number, item: any) => sum + (item?.InvoiceAmount || 0), 0) - payments.reduce((sum: number, item: any) => sum + item.TotalPaid, 0))}
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex mt-6 p-6 justify-between'>
                <div className='w-1/2 pr-5'>
                    <div className="flex w-full items-center">
                        <h1 className={`text-2xl`}>Invoice Details</h1>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="inline-block min-w-full align-middle">
                            <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
                                <table className="hidden min-w-full text-gray-900 md:table">
                                    <thead className="rounded-lg text-left text-sm font-normal">
                                        <tr className='font-bold'>
                                            <th scope="col" className="px-4 py-5 font-bold sm:pl-6">
                                                Bill Number
                                            </th>
                                            <th scope="col" className="px-3 py-5 font-bold">
                                                Date
                                            </th>
                                            <th scope="col" className="px-3 py-5 font-bold">
                                                Amount
                                            </th>
                                            <th scope="col" className="px-3 py-5 font-bold">
                                                Received
                                            </th>
                                            <th scope="col" className="px-3 py-5 font-bold">
                                                Balance
                                            </th>
                                            <th scope="col" className="px-3 py-5 font-bold">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {invoices?.map((invoice: any) => (
                                            <tr
                                                key={`inv'${invoice.YarnId}`}
                                                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                            >
                                                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                                    <div className="flex items-center gap-3">
                                                        {invoice?.InvoiceNumber}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3">
                                                    {formatDateToLocal(invoice.InvoiceDate)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3 text-right">
                                                    {invoice?.InvoiceAmount ? formatCurrency(invoice.InvoiceAmount) : ""}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3 text-right">
                                                    {invoice?.Paid ? formatCurrency(invoice.Paid) : ""}
                                                </td>

                                                <td className={`whitespace-nowrap px-3 py-3 text-right ${invoice?.InvoiceAmount - invoice.PaidAmount > 0 ? 'text-red-600' : ''}`}>
                                                    {formatCurrency(invoice?.InvoiceAmount - invoice.PaidAmount)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3">
                                                    <YarnStatus
                                                        PaidAmount={invoice?.PaidAmount || 0}
                                                        InvoiceAmount={invoice?.InvoiceAmount || 0}
                                                        InvoiceDate={invoice?.InvoiceDate}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-1/2 pl-5'>
                    <div className="flex w-full items-center">
                        <h1 className={`text-2xl`}>Payment Details</h1>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="inline-block min-w-full align-middle">
                            <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
                                <table className="hidden min-w-full text-gray-900 md:table">
                                    <thead className="rounded-lg text-left text-lg font-medium">
                                        <tr className='font-bold'>
                                            <th scope="col" className="relative py-3 pl-6 pr-3">
                                                Date
                                            </th>
                                            <th scope="col" className="relative py-3 pl-6 pr-3">
                                                Type
                                            </th>
                                            <th scope="col" className="relative py-3 pl-6 pr-3">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {payments?.map((pay: any, index: number) => (
                                            <tr
                                                key={`inv-'${index}`}
                                                className="w-full border-b py-3 text-base last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                            >
                                                <td className="whitespace-nowrap px-3 py-3">
                                                    {formatDate(pay.Date)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3">
                                                    {pay?.Type}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3 text-right">
                                                    {pay?.TotalPaid ? formatCurrency(pay.TotalPaid) : ""}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/admin/suppliers"
                    className="flex h-10 items-center rounded-lg bg-blue-400 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-300"
                >
                    Back
                </Link>
            </div>
        </main>
    );
}