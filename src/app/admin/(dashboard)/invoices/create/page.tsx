import Form from '@/app/ui/invoices/create-form';

import { fetchCustomers } from '@/app/api/node/customers';
import { fetchNodeProducts } from '@/app/api/node/product';
import { fetchLastInvoiceNumber } from '@/app/api/node/invoice';

export default async function Page() {
  const customers = await fetchCustomers('', 0, "", "", "");
  // const products = await fetchNodeProducts('', 0);
  const lastInvoiceGstNumber = await fetchLastInvoiceNumber("gst");
  const lastInvoiceDcNumber = await fetchLastInvoiceNumber("dc");

  return (
    <main>
      <Form customers={customers} lastInvoiceGstNumber={lastInvoiceGstNumber} lastInvoiceDcNumber={lastInvoiceDcNumber} />
    </main>
  );
}