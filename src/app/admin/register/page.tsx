import RegisterForm from '@/app/ui/register-form';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || "ayngaran-tex-fallback-jwt-secret-key-998877";

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userRole = decoded?.role || decoded?.userType;
    if (!decoded || userRole !== 'admin') {
      redirect('/admin/invoices');
    }
  } catch (error) {
    redirect('/admin/login');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}
