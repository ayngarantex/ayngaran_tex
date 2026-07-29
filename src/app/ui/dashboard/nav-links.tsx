'use client';

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
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/admin', icon: HomeIcon },
  { name: 'Invoices', href: '/admin/invoices', icon: DocumentDuplicateIcon },
  { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon },
  { name: 'Products', href: '/admin/products', icon: CubeIcon },
  { name: 'Payments', href: '/admin/payments', icon: BanknotesIcon },
  { name: 'Suppliers', href: '/admin/suppliers', icon: BuildingStorefrontIcon },
  { name: 'Yarns', href: '/admin/yarns', icon: NumberedListIcon },
  { name: 'Sizing', href: '/admin/sizing', icon: AdjustmentsVerticalIcon },
  { name: 'Warp', href: '/admin/warp', icon: MapIcon },
  { name: 'Expenses', href: '/admin/expenses', icon: CurrencyRupeeIcon },
  { name: 'Job Works', href: '/admin/jobworks', icon: UserGroupIcon },
  { name: 'Beem', href: '/admin/beem', icon: DocumentDuplicateIcon },
];

export default function NavLinks({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
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
            <p className="whitespace-nowrap text-sm font-semibold text-slate-900">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
