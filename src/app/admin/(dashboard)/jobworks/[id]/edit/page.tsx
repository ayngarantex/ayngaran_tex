import Form from '@/app/ui/jobworks/edit-form';
import { fetchLoomById } from '@/app/api/node/looms';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const Id = params.id;
    const loom = await fetchLoomById(Id);

    return (
        <main>
            <Form loom={loom || {}} />
        </main>
    );
}
