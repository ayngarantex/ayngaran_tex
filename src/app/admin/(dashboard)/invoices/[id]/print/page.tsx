// pages/invoice/[id].jsx
import { fetchInvoiceById } from '@/app/api/node/invoice';
import { fetchCustomerById, fetchProductsWithCode } from '@/app/api/node/customers';
import PrintScreen from "@/app/ui/invoices/print-screen";

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ original?: string; duplicate?: string; signature?: string }>;
}) {

  const params = await props.params;
  const searchParams = await props.searchParams;
  const InvoiceId = parseInt(params.id);
  const invoice = await fetchInvoiceById(InvoiceId);
  const customer = await fetchCustomerById(String(invoice?.CustomerId));
  const products = await fetchProductsWithCode(invoice?.CustomerId || 0, 0, "");

  const initialOriginal = searchParams?.original !== 'false';
  const initialDuplicate = searchParams?.duplicate === 'true';
  const initialSignature = searchParams?.signature !== 'false';

  return (
    <PrintScreen
      invoice={invoice || {}}
      products={products}
      customer={customer}
      initialOriginal={initialOriginal}
      initialDuplicate={initialDuplicate}
      initialSignature={initialSignature}
    />
  );
};
