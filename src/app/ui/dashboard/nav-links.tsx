'use client';

import { useEffect, useState } from 'react';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  CurrencyRupeeIcon,
  CubeIcon,
  NumberedListIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  MapIcon,
  AdjustmentsVerticalIcon,
  UserPlusIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/admin', icon: HomeIcon },
  { name: 'Invoices', href: '/admin/invoices', icon: DocumentDuplicateIcon },
  { name: 'Products', href: '/admin/products', icon: CubeIcon },
  { name: 'Purchases', href: '/admin/purchases', icon: ShoppingBagIcon },
  { name: 'Yarns', href: '/admin/yarns', icon: NumberedListIcon },
  { name: 'Sizing', href: '/admin/sizing', icon: AdjustmentsVerticalIcon },
  { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon },
  { name: 'Suppliers', href: '/admin/suppliers', icon: BuildingStorefrontIcon },
  { name: 'Job Works', href: '/admin/jobworks', icon: UserGroupIcon },
  { name: 'Warp', href: '/admin/warp', icon: MapIcon },
  { name: 'Payments', href: '/admin/payments', icon: BanknotesIcon },
  { name: 'Expenses', href: '/admin/expenses', icon: CurrencyRupeeIcon },
  { name: 'Investments', href: '/admin/investments', icon: BanknotesIcon }
];

export default function NavLinks({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      if (cookieValue) {
        try {
          const payloadBase64 = cookieValue.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          const userRole = decodedPayload.role || decodedPayload.userType;
          setIsAdmin(userRole === 'admin');
        } catch (e) {
          setIsAdmin(false);
        }
      }
    }
  }, []);

  const visibleLinks = isAdmin
    ? [...links, { name: 'Register User', href: '/admin/register', icon: UserPlusIcon }]
    : links;

  return (
    <>
      {visibleLinks.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onItemClick}
            className={clsx(
              'flex h-11 shrink-0 items-center justify-start gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
              {
                'bg-slate-900 text-white shadow-md font-bold': isActive,
                'bg-white text-slate-900 border border-slate-200/80 hover:bg-slate-100 hover:text-black': !isActive,
              },
            )}
          >
            <LinkIcon className="h-5 w-5 shrink-0" />
            <p className={clsx('whitespace-nowrap text-sm font-semibold', {
              'text-white': isActive,
              'text-slate-900': !isActive,
            })}>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
