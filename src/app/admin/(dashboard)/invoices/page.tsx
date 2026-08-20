import Pagination from '@/app/lib/pagination';
import Search from '@/app/ui/search';
import { CreateInvoice, PrintInvoices, PrintInvoiceSelector, ExportInvoices, ExportGstr1 } from '@/app/ui/invoices/buttons';
import Table from '@/app/ui/invoices/table';
import Financialyear from '@/app/lib/financialyear';
import InvoiceFilterModal from '@/app/ui/invoices/filter-modal';
import { formatCurrency, pageLimit } from '@/app/lib/utils';
import { fetchInvoices, fetchInvoicesCount, fetchInvoiceTotal } from '@/app/api/node/invoice';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    billType?: string;
    orderBy?: string;
    print?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

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

  const invoiceTotalDetatils: any = await fetchInvoiceTotal(query, startDate, endDate, billType, orderBy);

  const invoices = await fetchInvoices(query, currentPage, startDate, endDate, billType, orderBy, printMode ? null : undefined);
  const invoicesCount = await fetchInvoicesCount(query, startDate, endDate, billType, orderBy);
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
      <div className="flex w-full items-center justify-between no-print">
        {/* ${lusitana.className} */}
        <h1 className={`text-2xl`}>Invoices ({invoicesCount || 0})</h1>
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
            <InvoiceFilterModal />
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