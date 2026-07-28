// app/dashboard/expenses/page.tsx
import ExpensesContainer from '@/app/ui/expenses/expenses-container';

export default function Page() {
  // ✅ No async/await here, just render a client wrapper
  return <ExpensesContainer />;
}