import Form from '@/app/ui/customers/edit-form';
import { fetchCustomerById } from '@/app/api/node/customers'

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const CustomerId = parseInt(params.id);
    const customer = await fetchCustomerById(String(CustomerId));

    return (
        <main>
            <Form customer={customer || {}} />
        </main>
    );
}