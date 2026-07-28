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

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
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

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-blue-50 p-3 text-sm font-medium hover:bg-black hover:text-white md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-blue-400 text-white': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
