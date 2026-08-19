import { daysDiffNew } from '@/app/lib/utils';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function InvoiceStatus({ ReceivedAmount, InvoiceAmount, BalanceAmount, InvoiceDate, IsCancel = 0 }: { ReceivedAmount: string, InvoiceAmount: string, BalanceAmount: string, InvoiceDate: string, IsCancel: number }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-red-600 text-white': IsCancel === 1,
          'bg-blue-100 text-gray-500': ReceivedAmount !== InvoiceAmount,
          'bg-green-500 text-white': InvoiceAmount && ReceivedAmount === InvoiceAmount,
        },
      )}
    >
      {IsCancel === 1 ?
        <>
          Cancelled
        </>
        : null}
      {(IsCancel === 0 || IsCancel === null) && (!InvoiceAmount || (ReceivedAmount !== InvoiceAmount)) ? (
        <>
          Pending<span className='text-red-600 px-1'>({daysDiffNew(InvoiceDate)})</span>
          <ClockIcon className="w-4 text-gray-500" />
        </>
      ) : null}
      {InvoiceAmount && ReceivedAmount === InvoiceAmount ? (
        <>
          Paid
          <CheckIcon className="w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}
