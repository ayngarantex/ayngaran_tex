import Form from '@/app/ui/expenses/edit-form';
import { fetchExpenseById } from '@/app/lib/expenses';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const ExpenseId = parseInt(params.id);
    const expenses = await fetchExpenseById(ExpenseId);

    return (
        <main>
            <Form expenses={expenses || {}} />
        </main>
    );
}