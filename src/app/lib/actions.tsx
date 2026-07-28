'use server';

import { redirect } from 'next/navigation';
import { loginFields } from '@/app/lib/definitions';

export async function loginDetails(formData: FormData): Promise<void> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ UserName: email, password: password }),
  });

  if (!res.ok) {
    redirect('/admin/login');
  }

}
