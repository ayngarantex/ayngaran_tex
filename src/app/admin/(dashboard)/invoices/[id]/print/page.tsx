// pages/invoice/[id].jsx
import { fetchInvoiceById } from '@/app/api/node/invoice';
import { fetchCustomerById, fetchProductsWithCode } from '@/app/api/node/customers';
import PrintScreen from "@/app/ui/invoices/print-screen";

export default async function Page(props: { params: Promise<{ id: string }> }) {

  const params = await props.params;
  const InvoiceId = parseInt(params.id);
  const invoice = await fetchInvoiceById(InvoiceId);
  const customer = await fetchCustomerById(String(invoice?.CustomerId));
  const products = await fetchProductsWithCode(invoice?.CustomerId || 0, 0, "");

  return (
    <PrintScreen invoice={invoice || {}} products={products} customer={customer} />
  );
};
