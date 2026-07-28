import Form from '@/app/ui/invoices/edit-form';
import { fetchNodeProducts } from '@/app/api/node/product';
import { fetchCustomers } from '@/app/api/node/customers';
import { fetchInvoiceById } from '@/app/api/node/invoice';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const InvoiceId = parseInt(params.id);
    const invoice = await fetchInvoiceById(InvoiceId);
    const customers = await fetchCustomers('', 0, "", "", "");

    return (
        <main>
            <Form invoice={invoice || {}} customers={customers} />
        </main>
    );
}