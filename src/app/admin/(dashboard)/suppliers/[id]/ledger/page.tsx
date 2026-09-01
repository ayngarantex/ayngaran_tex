import { fetchYarnBySupplierId, fetchPaymentBySupplierId, fetchSupplierById, fetchAllSuppliers } from '@/app/lib/data';
import Link from 'next/link';
import SupplierLedgerSelect from './supplier-ledger-select';
import SupplierLedgerInvoicePayment from './supplier-ledger-invoice-payment';
import Financialyear from '@/app/lib/financialyear';

export default async function Page(props: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ startDate?: string; endDate?: string; billType?: string; print?: string; filterType?: string; }>;
}) {
    const params = await props.params;
    const SupplierId = parseInt(params.id);
    const searchParams = await props.searchParams;
    const startDate: string = searchParams?.startDate || '';
    const endDate: string = searchParams?.endDate || '';
    const billType: string = searchParams?.billType || '';
    const isPrint = searchParams?.print === 'true';

    // Fetch details for the current supplier
    const supplier = await fetchSupplierById(SupplierId);
    const invoices = await fetchYarnBySupplierId(SupplierId, startDate, endDate, billType);
    const payments = await fetchPaymentBySupplierId(SupplierId, startDate, endDate, billType);

    // Fetch all suppliers for the dropdown
    const suppliers = await fetchAllSuppliers('All');

    const supData = Array.isArray(supplier) ? supplier[0] : supplier;

    return (
        <main className={isPrint ? "" : "p-4 md:p-6"}>
            {!isPrint && (
                <>
                    <div className="no-print mt-6 flex justify-end gap-4">
                        <Link
                            href="/admin/suppliers"
                            className="flex h-10 items-center rounded-lg bg-blue-400 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-300"
                        >
                            Back
                        </Link>
                    </div>
                    
                    <div className="no-print flex w-full items-center justify-between mb-4">
                        <div className='flex items-center gap-4'>
                            <h1 className="text-2xl font-bold text-gray-800">Supplier Ledger Account</h1>
                            <div className="w-[420px]">
                                <Financialyear />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md bg-blue-50 p-4 md:p-6 mb-6">
                        <div className='flex flex-wrap mb-6'>
                            <div className="mb-4 w-1/4">
                                <label htmlFor="name" className="mb-2 block text-sm font-bold text-gray-700">
                                    Supplier Name
                                </label>
                                <div className="relative mt-2">
                                    <SupplierLedgerSelect
                                        suppliers={suppliers}
                                        currentSupplierId={SupplierId}
                                        currentSupplierName={supData?.Name || ''}
                                    />
                                </div>
                            </div>
                            <div className="mb-4 w-1/4 pl-8">
                                <label htmlFor="gst" className="mb-2 block text-sm font-bold text-gray-700">
                                    GST Number
                                </label>
                                <div className="relative mt-2 text-lg text-gray-900 font-medium">
                                    {supData?.GstNumber || '-'}
                                </div>
                            </div>
                            <div className="mb-4 w-1/4 pl-8">
                                <label htmlFor="state" className="mb-2 block text-sm font-bold text-gray-700">
                                    State
                                </label>
                                <div className="relative mt-2 text-lg text-gray-900 font-medium">
                                    {supData?.State || '-'}
                                </div>
                            </div>
                            <div className="mb-4 w-1/4 pl-8">
                                <label htmlFor="mobile" className="mb-2 block text-sm font-bold text-gray-700">
                                    Mobile
                                </label>
                                <div className="relative mt-2 text-lg text-gray-900 font-medium">
                                    {supData?.Mobile || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <SupplierLedgerInvoicePayment
                supplier={supData}
                invoices={invoices}
                payments={payments}
                startDate={startDate}
                endDate={endDate}
            />
        </main>
    );
}