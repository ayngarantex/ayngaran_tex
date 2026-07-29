'use client';

import { useState } from 'react';
import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import Image from "next/image";
import AyngaranLogo from '@/app/ui/ayngaran-logo-black.jpeg';
import { PowerIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    router.push('/admin/login');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Mobile & Tablet Top Bar */}
      <div className="flex items-center justify-between bg-black px-4 py-3 text-white md:hidden border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src={AyngaranLogo}
            alt="Ayngaran Logo"
            className="w-10 h-10 object-contain rounded-md"
          />
          <span className="text-lg font-bold tracking-wide text-white">Ayngaran Tex</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg bg-slate-800 p-2 text-white hover:bg-slate-700"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden" onClick={() => setIsOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-50 p-4 shadow-2xl flex flex-col border-r border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 bg-black p-3 rounded-lg text-white">
              <div className="flex items-center gap-2">
                <Image
                  src={AyngaranLogo}
                  alt="Ayngaran Logo"
                  className="w-9 h-9 object-contain"
                />
                <span className="text-base font-bold text-white">Ayngaran Tex</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-slate-300 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              <NavLinks onItemClick={() => setIsOpen(false)} />
            </div>

            <div className="pt-4 border-t border-slate-200 mt-auto">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <PowerIcon className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop & Mobile Scrollable Nav Container */}
      <div className="hidden md:flex h-full flex-col px-3 py-4 bg-slate-50 border-r border-slate-200">
        <Link
          className="mb-4 flex flex-col items-center justify-center rounded-xl bg-black p-4 text-center shadow-md"
          href="/admin"
        >
          <Image
            src={AyngaranLogo}
            alt="Ayngaran Logo"
            className="w-24 h-14 object-contain mb-1"
          />
          <span className="text-xl font-extrabold text-white tracking-wide">Ayngaran Tex</span>
        </Link>

        <div className="flex grow flex-col space-y-2 overflow-y-auto pr-1">
          <NavLinks />
        </div>

        <div className="pt-4 mt-auto border-t border-slate-200">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 border border-red-200 hover:border-transparent"
          >
            <PowerIcon className="h-5 w-5 shrink-0" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Horizontal Nav Scrollbar for Mobile Screens when drawer is closed */}
      <div className="flex md:hidden overflow-x-auto gap-2 p-2 bg-slate-100 border-b border-slate-200">
        <NavLinks />
      </div>
    </div>
  );
}
