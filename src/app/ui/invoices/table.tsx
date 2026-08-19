import TableInvoiceDetails from './table-invoice-details';

export default async function InvoicesTable({
  invoices,
  printMode
}: {
  invoices: any;
  printMode: any;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-blue-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className='font-bold'>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 col-billNumber">
                  Bill Number
                </th>
                <th scope="col" className="px-3 py-5 font-bold col-date">
                  Date
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 col-customer">
                  Customer
                </th>
                <th scope="col" className="px-4 py-5 font-bold sm:pl-6 col-gstNumber">
                  Amount & Tax
                </th>
                <th scope="col" className="px-3 py-5 font-bold col-amount">
                  Total
                </th>
                <th scope="col" className="px-3 py-5 font-bold col-received">
                  Received
                </th>
                <th scope="col" className="px-3 py-5 font-bold col-balance">
                  Balance
                </th>
                <th scope="col" className="px-3 py-5 font-bold col-status">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3 no-print">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <TableInvoiceDetails invoices={invoices} printMode={printMode} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
