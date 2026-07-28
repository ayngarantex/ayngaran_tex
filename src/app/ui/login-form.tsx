'use client'

import {
  AtSymbolIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const jsonBody = JSON.stringify({
        UserName: userName,
        Password: password
      });

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setIsSubmitting(false);
      } else {
        router.push('/admin/invoices');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleLogin}>
      <div className="flex-1 rounded-lg bg-blue-50 px-6 pb-4 pt-8 shadow-md w-[400px]">
        <h1 className="mb-3 text-2xl font-bold text-gray-900 text-center">
          Log In
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Please log in to continue
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="w-full">
          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700"
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-400 bg-white"
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={userName}
                required
                onChange={(e) => setUserName(e.target.value)}
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 peer-focus:text-gray-900" />
            </div>
          </div>

          <div className="mt-4">
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-400 bg-white"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        <Button type="submit" className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'} <ArrowRightIcon className="h-5 w-5" />
        </Button>

        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link
              href="/admin/register"
              className="font-semibold text-blue-600 hover:text-blue-800 underline"
            >
              Register here
            </Link>

          </p>
        </div>
      </div>
    </form>
  );
}

