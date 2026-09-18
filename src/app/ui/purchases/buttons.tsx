"use client";
import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon, TrashIcon, BanknotesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deletePurchase, updatePurchasePayments } from '@/app/api/node/purchases';
import { currentDate, formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import PaymentForm, { PurchasePaymentRow } from './payment-form';
import SupplierLumpSumPaymentModal from '@/app/ui/suppliers/supplier-lump-sum-payment-modal';

export { SupplierLumpSumPaymentModal };

export function CreatePurchase() {
  return (
    <Link
      href="/admin/purchases/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Add Purchase</span>{' '}
      <PlusIcon className="h-5 md:" />
    </Link>
  );
}

export function UpdatePurchase({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/purchases/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeletePurchase({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this purchase record?')) {
      await deletePurchase(id);
      router.refresh();
    }
  };

  return (
    <button type="button" onClick={handleDelete} className="rounded-md border p-2 hover:bg-blue-100 text-red-600 hover:text-red-800">
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );
}

export function PayPurchase({ purchase }: { purchase: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentsList, setPaymentsList] = useState<PurchasePaymentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = purchase?.purchase_payment_details || [];
      if (existing.length > 0) {
        setPaymentsList(
          existing.map((row: any, idx: number) => ({
            pId: idx,
            date: row.Date ? formatDateToLocal(row.Date) : currentDate(),
            amount: row.Amount !== null && row.Amount !== undefined ? String(row.Amount) : '',
            type: row.Type || (purchase?.BillType === 'gst' ? 'Bank' : 'Gpay'),
            to: row.ReceivedBy || 'Prakash'
          }))
        );
      } else {
        setPaymentsList([
          {
            pId: 0,
            date: currentDate(),
            amount: '',
            type: purchase?.BillType === 'gst' ? 'Bank' : 'Gpay',
            to: 'Prakash'
          }
        ]);
      }
    }
  }, [isOpen, purchase]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const filteredPayments = paymentsList.filter((row: PurchasePaymentRow) => row.date && row.date !== 'date' && row.amount);
      const success = await updatePurchasePayments(purchase.PurchaseId, filteredPayments);
      if (success) {
        setIsOpen(false);
        window.location.reload();
      } else {
        alert("Failed to save purchase payments.");
      }
    } catch (err) {
      console.error("Save Purchase Payments Error:", err);
      alert("Error saving payments.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPayFull = async () => {
    setLoading(true);
    try {
      const todayStr = currentDate();
      const invAmt = Number(purchase?.InvoiceAmount || 0);
      const paidAmt = Number(purchase?.PaidAmount || 0);
      const balanceVal = invAmt - paidAmt;

      if (balanceVal <= 0) {
        alert("This purchase is already fully paid.");
        setLoading(false);
        return;
      }

      const existing = (purchase?.purchase_payment_details || []).map((row: any) => ({
        date: row.Date ? formatDateToLocal(row.Date) : todayStr,
        amount: row.Amount !== null && row.Amount !== undefined ? String(row.Amount) : '',
        type: row.Type || (purchase?.BillType === 'gst' ? 'Bank' : 'Gpay'),
        to: row.ReceivedBy || 'Prakash'
      }));

      const quickPayments = [
        ...existing,
        {
          date: todayStr,
          amount: balanceVal.toFixed(2),
          type: purchase?.BillType === 'gst' ? 'Bank' : 'Gpay',
          to: 'Prakash'
        }
      ];

      const success = await updatePurchasePayments(purchase.PurchaseId, quickPayments);
      if (success) {
        setIsOpen(false);
        window.location.reload();
      } else {
        alert("Failed to save payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving payment.");
    } finally {
      setLoading(false);
    }
  };

  const balanceVal = Math.max(0, (Number(purchase?.InvoiceAmount || 0) - Number(purchase?.PaidAmount || 0)));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border p-2 border-emerald-300 text-emerald-600 hover:bg-emerald-100 transition-colors"
        title="Add / Edit Payment for Purchase"
      >
        <BanknotesIcon className="w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BanknotesIcon className="w-6 h-6 text-emerald-600" />
                  Payment for Purchase Bill #{purchase?.InvoiceNumber || purchase?.PurchaseId}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supplier: <span className="font-semibold text-slate-700">{purchase?.SupplierName || purchase?.suppliers?.Name || 'N/A'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <PaymentForm
                invoiceAmount={Number(purchase?.InvoiceAmount || 0)}
                paymentsList={paymentsList}
                setPaymentsList={setPaymentsList}
              />
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl">
              <button
                type="button"
                onClick={handleQuickPayFull}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                ⚡ Pay Full ({formatCurrency(balanceVal > 0 ? balanceVal : Number(purchase?.InvoiceAmount || 0))}) & Today
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
