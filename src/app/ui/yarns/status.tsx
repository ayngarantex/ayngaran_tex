import { daysDiffNew } from '@/app/lib/utils';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function YarnStatus({ PaidAmount, InvoiceAmount, InvoiceDate }: { PaidAmount: string, InvoiceAmount: string, InvoiceDate: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-blue-100 text-gray-500': PaidAmount !== InvoiceAmount,
          'bg-green-500 text-white': InvoiceAmount && PaidAmount === InvoiceAmount,
        },
      )}
    >
      {!InvoiceAmount || (PaidAmount !== InvoiceAmount) ? (
        <>
          Pending <span className='text-red-600 px-1'>({daysDiffNew(InvoiceDate)})</span>
          <ClockIcon className="w-4 text-gray-500" />
        </>
      ) : null}
      {InvoiceAmount && PaidAmount === InvoiceAmount ? (
        <>
          Paid
          <CheckIcon className="w-4 text-white" />
        </>
      ) : null}

    </span>
  );
}
