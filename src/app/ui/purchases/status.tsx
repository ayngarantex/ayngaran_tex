import { daysDiffNew } from '@/app/lib/utils';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function PurchaseStatus({ PaidAmount, InvoiceAmount, InvoiceDate }: { PaidAmount: number, InvoiceAmount: number, InvoiceDate: string }) {
  const isPaid = InvoiceAmount > 0 && Math.abs(PaidAmount - InvoiceAmount) < 0.01;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-blue-100 text-gray-500': !isPaid,
          'bg-green-500 text-white': isPaid,
        },
      )}
    >
      {!isPaid ? (
        <>
          Pending <span className='text-red-600 px-1'>({daysDiffNew(InvoiceDate)})</span>
          <ClockIcon className="w-4 text-gray-500" />
        </>
      ) : (
        <>
          Paid
          <CheckIcon className="w-4 text-white" />
        </>
      )}
    </span>
  );
}
