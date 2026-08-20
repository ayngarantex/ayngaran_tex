import Pagination from '@/app/lib/pagination';
import Search from '@/app/ui/search';
import { CreateInvoice, PrintInvoices, PrintInvoiceSelector, ExportInvoices, ExportGstr1 } from '@/app/ui/invoices/buttons';
import Table from '@/app/ui/invoices/table';
import Financialyear from '@/app/lib/financialyear';
import InvoiceFilterModal from '@/app/ui/invoices/filter-modal';
import { formatCurrency, pageLimit, formatDateNew } from '@/app/lib/utils';
import { fetchInvoices, fetchInvoicesCount, fetchInvoiceTotal } from '@/app/api/node/invoice';
import { fetchAllProducts } from '@/app/api/node/product';
import { fetchCustomers } from '@/app/api/node/customers';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    billType?: string;
    orderBy?: string;
    print?: string;
    productId?: string;
    customerId?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const productId = searchParams?.productId || '';
  const customerId = searchParams?.customerId || '';

  // Default to current month start/end dates if not defined
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const formatYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];
  const defaultStartDate = formatYYYYMMDD(new Date(year, month, 1));
  const defaultEndDate = formatYYYYMMDD(new Date(year, month + 1, 0));

  const startDate = searchParams?.startDate !== undefined ? searchParams.startDate : defaultStartDate;
  const endDate = searchParams?.endDate !== undefined ? searchParams.endDate : defaultEndDate;
  const billType = searchParams?.billType || '';
  const orderBy = searchParams?.orderBy || '';
  const currentPage = Number(searchParams?.page) || 1;
  const printMode = searchParams?.print === 'true';

  const products = await fetchAllProducts();
  const customers = await fetchCustomers("", 1, "", "", "", null);

  const invoiceTotalDetatils: any = await fetchInvoiceTotal(query, startDate, endDate, billType, orderBy, productId, customerId);

  const invoices = await fetchInvoices(query, currentPage, startDate, endDate, billType, orderBy, printMode ? null : undefined, productId, customerId);
  const invoicesCount = await fetchInvoicesCount(query, startDate, endDate, billType, orderBy, productId, customerId);
  const totalPages = Math.ceil(Number(invoicesCount) / pageLimit); //node query

  return (
    <div className="w-full">
      {printMode && (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
            .hidden-print-col { display: none !important; }
            body, html { overflow: auto !important; height: auto !important; background: white !important; }
            .flex-grow { padding: 2rem !important; }
            table { display: table !important; width: 100% !important; }
            .md\\:hidden { display: none !important; }
            tr { page-break-inside: avoid !important; }
            @media print {
              .no-print { display: none !important; }
              body, html, .flex, .flex-grow, main, div {
                display: block !important;
                overflow: visible !important;
                height: auto !important;
                position: static !important;
              }
            }
          ` }} />
          <PrintInvoiceSelector />
        </>
      )}
      <div className="flex w-full items-end justify-between no-print">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800">Invoices ({invoicesCount || 0})</h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-md w-fit">
            Fetched Period: {startDate ? formatDateNew(startDate) : 'All'} to {endDate ? formatDateNew(endDate) : 'All'}
          </p>
        </div>
      </div>
      {printMode && (
        <div className="hidden print:block mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold">Ayngaran Tex - Invoices List</h1>
          <p className="text-gray-600 mt-2">Total Invoices: {invoicesCount || 0}</p>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 no-print">
        <div className='flex w-1/2 items-center gap-2 no-print'>
          <div className='w-1/4 no-print'>
            <Search placeholder="Search invoices..." />
          </div>
          <div className='w-3/4 pl-2 no-print flex items-center gap-2'>
            <Financialyear
              orderBy={true}
            />
            <InvoiceFilterModal products={products} customers={customers} />
          </div>
        </div>
        {!printMode && (
          <div className="flex gap-2 text-wrap flex-wrap">
            <div className='no-print'>
              <ExportGstr1 />
            </div>
            <div className='no-print'>
              <ExportInvoices query={query} billType={billType} orderBy={orderBy} />
            </div>
            <div className='no-print'>
              <PrintInvoices query={query} startDate={startDate} endDate={endDate} billType={billType} orderBy={orderBy} />
            </div>
            <CreateInvoice />
          </div>
        )}
      </div>
      {!printMode && (
        <>
          <div className="flex justify-between px-4 py-5 mt-5 bg-blue-300 rounded-lg self-center no-print">
            <div className="w-full flex no-print">
              <label htmlFor="mobile" className="text-sm self-center font-bold">
                Sold
              </label>
              <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
                {formatCurrency(invoiceTotalDetatils?.TotalInvoiceAmount || 0)}
              </div>
            </div>
            <div className="w-full flex justify-center">
              <label htmlFor="mobile" className="text-sm self-center font-bold">
                Received
              </label>
              <div className="relative pl-4 tex-2xl w-40 text-right text-blue-600 text-lg text-center">
                {formatCurrency(Number(parseFloat(invoiceTotalDetatils?.TotalReceivedAmount || 0).toFixed(2)))}
              </div>
            </div>
            <div className="w-full flex justify-center">
              <label htmlFor="mobile" className="text-sm self-center font-bold">
                Cancelled
              </label>
              <div className="relative pl-4 tex-2xl w-40 text-right text-red-600 text-lg text-center">
                {formatCurrency(invoiceTotalDetatils?.TotalCancelledAmount || 0)}
              </div>
            </div>
            <div className="w-full flex justify-end">
              <label htmlFor="mobile" className="text-sm self-center font-bold">
                Pending
              </label>
              <div className="relative pl-4 tex-2xl w-40 text-right text-red-600 text-lg text-center">
                {formatCurrency((invoiceTotalDetatils?.TotalBalanceAmount || 0) - (invoiceTotalDetatils?.TotalCancelledAmount || 0))}
              </div>
            </div>
          </div>
          {(productId || customerId) && (
            (() => {
              const selectedProduct = productId ? products.find((p: any) => String(p.Id) === String(productId)) : null;
              const selectedCustomer = customerId ? customers.find((c: any) => String(c.CustomerId) === String(customerId)) : null;
              if (!selectedProduct && !selectedCustomer) return null;
              return (
                <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between px-6 py-4 mt-3 bg-blue-50 border border-blue-200 rounded-lg no-print">
                  <div className="flex flex-col gap-1">
                    {selectedProduct && (
                      <div className="text-sm font-semibold text-blue-800">
                        Filtered Product: <span className="font-bold text-blue-900">{selectedProduct.Name}</span>
                      </div>
                    )}
                    {selectedCustomer && (
                      <div className="text-sm font-semibold text-blue-800">
                        Filtered Customer: <span className="font-bold text-blue-900">{selectedCustomer.CustomerName}</span>
                      </div>
                    )}
                  </div>
                  {selectedProduct && (
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="text-sm font-semibold text-blue-800">Total Quantity Sold:</span>
                      <span className="text-lg font-bold text-blue-900 bg-white px-3 py-1 rounded-md border border-blue-200 shadow-sm">
                        {invoiceTotalDetatils?.TotalProductQuantitySold || 0}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()
          )}
          <div className="mt-5 flex w-full justify-center no-print">
            <Pagination totalPages={totalPages} />
          </div>
        </>
      )}
      {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
      <Table invoices={invoices || []} printMode={printMode} />
      {/* </Suspense> */}
      {!printMode && (
        <div className="mt-5 flex w-full justify-center no-print">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}