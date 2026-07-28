'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './button';
import { UserCircleIcon, KeyIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { statesList } from '@/app/lib/utils';

export default function RegisterForm() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Staff");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("TamilNadu");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const jsonBody = JSON.stringify({
        UserName: userName,
        Password: password,
        UserType: userType,
        Mobile: mobile,
        Address: address,
        State: state,
        IsActive: isActive ? 1 : 0
      });

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setIsSubmitting(false);
      } else {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleRegister}>
      <div className="flex-1 rounded-lg bg-blue-50 px-6 pb-6 pt-8 shadow-md w-[450px]">
        <h1 className="mb-3 text-2xl font-bold text-gray-900 text-center">
          Register User
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Create a new login user account
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase" htmlFor="username">
              Username *
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-400 bg-white"
                id="username"
                type="text"
                placeholder="Enter username"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase" htmlFor="password">
              Password *
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-400 bg-white"
                id="password"
                type="password"
                placeholder="Enter secure password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* UserType Select */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase" htmlFor="usertype">
              User Type *
            </label>
            <select
              id="usertype"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm bg-white"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          {/* Mobile */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase" htmlFor="mobile">
              Mobile Number
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-400 bg-white"
                id="mobile"
                type="text"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <DevicePhoneMobileIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* State Select */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase" htmlFor="state">
              State
            </label>
            <select
              id="state"
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm bg-white"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {statesList()?.map((row: any) => (
                <option key={row.label} value={row.label}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase" htmlFor="address">
              Address
            </label>
            <div className="relative">
              <textarea
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder:text-gray-400 bg-white"
                id="address"
                rows={3}
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* IsActive Checkbox */}
          <div className="flex items-center">
            <input
              id="isactive"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isactive" className="ml-2 block text-sm text-gray-900 font-medium">
              Is Active Account
            </label>
          </div>
        </div>

        <Button type="submit" className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register Account'}
        </Button>

        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link
              href="/admin/login"
              className="font-semibold text-blue-600 hover:text-blue-800 underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
