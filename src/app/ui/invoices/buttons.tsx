"use client";
import { useState, useEffect } from 'react';
import { deleteInvoice, fetchInvoices } from '@/app/api/node/invoice';
import { PencilIcon, PlusIcon, TrashIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getFinancialYearShortNew, formatDateNew } from '@/app/lib/utils';

export function CreateInvoice() {
  return (
    <Link
      href="/admin/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Invoice</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function PrintInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/invoices/${id}/print`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PrinterIcon className="w-5" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }
    await deleteInvoice(id); //node query
    redirect('/admin/invoices');
  }

  return (
    <>
      <button type="button" onClick={handleDelete} className="rounded-md border p-2 hover:bg-blue-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}

export function DownloadInvoice({ invoice }: { invoice: any }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.InvoiceId}/pdf`);
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      let fileName = `invoice_${invoice.InvoiceId}.pdf`;
      if (invoice?.InvoiceNumber) {
        const formattedNum = invoice.InvoiceType === 'Tax Invoice'
          ? `${getFinancialYearShortNew(invoice.InvoiceDate)}_AT_${String(invoice.InvoiceNumber).padStart(2, '0')}`
          : invoice.InvoiceType === 'Credit Note'
            ? `${getFinancialYearShortNew(invoice.InvoiceDate)}_AT-C_${String(invoice.InvoiceNumber).padStart(2, '0')}`
            : `S-DC_${String(invoice.InvoiceNumber).padStart(2, '0')}`;
        fileName = `${formattedNum}.pdf`;
      }

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Error downloading PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="rounded-md border p-2 hover:bg-blue-100 cursor-pointer disabled:opacity-50"
      title="Download PDF"
    >
      {downloading ? (
        <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <ArrowDownTrayIcon className="w-5" />
      )}
    </button>
  );
}

export function PrintInvoices({ query, startDate, endDate, billType, orderBy }: { query: string, startDate: string, endDate: string, billType: string, orderBy: string }) {
  const handlePrint = () => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (billType) params.set('billType', billType);
    if (orderBy) params.set('orderBy', orderBy);
    params.set('print', 'true');
    window.open(`/admin/invoices?${params.toString()}`, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="flex h-10 items-center rounded-lg bg-gray-100 border border-gray-300 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 no-print"
      title="Print List"
    >
      <span className="hidden md:block">Print List</span>
      <PrinterIcon className="h-5 md:ml-2 w-5 text-gray-500" />
    </button>
  );
}

export function PrintInvoiceSelector() {
  const [fields, setFields] = useState({
    billNumber: true,
    date: true,
    customer: true,
    gstNumber: true,
    amount: true,
    received: true,
    balance: true,
    status: true,
  });

  const handleToggle = (field: keyof typeof fields) => {
    const nextVal = !fields[field];
    setFields(prev => ({ ...prev, [field]: nextVal }));

    const elements = document.querySelectorAll(`.col-${field}`);
    elements.forEach(el => {
      if (nextVal) {
        el.classList.remove('hidden-print-col');
      } else {
        el.classList.add('hidden-print-col');
      }
    });
  };

  return (
    <div className="no-print p-6 bg-blue-50/50 border border-blue-200/60 rounded-xl mb-6 shadow-sm">
      <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002-2zm-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Select Columns to Print
      </h2>
      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
        {Object.keys(fields).map((key) => {
          let label = '';
          if (key === 'billNumber') label = 'Bill Number';
          else if (key === 'gstNumber') label = 'GST Number';
          else label = key.charAt(0).toUpperCase() + key.slice(1);
          return (
            <label key={key} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fields[key as keyof typeof fields]}
                onChange={() => handleToggle(key as keyof typeof fields)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              {label}
            </label>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Selected Columns
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg border border-gray-300 transition-colors"
        >
          Cancel / Close
        </button>
      </div>
    </div>
  );
}

export function ExportInvoices({ query, billType, orderBy }: { query: string, billType: string, orderBy: string }) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const defaultStartDate = `${yyyy}-${mm}-01`;
  const lastDayDate = new Date(yyyy, today.getMonth() + 1, 0).getDate();
  const defaultEndDate = `${yyyy}-${mm}-${String(lastDayDate).padStart(2, '0')}`;

  const [isOpen, setIsOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(defaultStartDate);
  const [exportEndDate, setExportEndDate] = useState(defaultEndDate);
  const [exportBillType, setExportBillType] = useState(billType);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setExportStartDate(defaultStartDate);
      setExportEndDate(defaultEndDate);
      setExportBillType(billType);
    }
  }, [isOpen, billType]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const invoices = await fetchInvoices(query, 1, exportStartDate, exportEndDate, exportBillType, 'InvoiceNumberASC', null);

      const headers = [
        'Customer Name',
        'GST Number',
        'Bill Number',
        'Invoice Date',
        'Before Tax',
        'CGST',
        'SGST',
        'IGST',
        'Round Off',
        'Invoice Amount'
      ];

      const csvRows = [
        headers.join(','),
        ...invoices.map((inv: any) => {
          let billNum = '';
          if (inv.InvoiceType === 'Tax Invoice') {
            billNum = `${getFinancialYearShortNew(inv.InvoiceDate)}/AT/${String(inv.InvoiceNumber).padStart(2, '0')}`;
          } else if (inv.InvoiceType === 'Credit Note') {
            billNum = `${getFinancialYearShortNew(inv.InvoiceDate)}/AT-C/${String(inv.InvoiceNumber).padStart(2, '0')}`;
          } else {
            billNum = `S-DC/${String(inv.InvoiceNumber).padStart(2, '0')}`;
          }

          const fields = [
            inv.CustomerName || '',
            inv.GstNumber || '',
            billNum,
            inv.InvoiceDate ? formatDateNew(inv.InvoiceDate) : '',
            inv.BeforeTax || 0,
            inv.Cgst || 0,
            inv.Sgst || 0,
            inv.Igst || 0,
            inv.RoundOff || 0,
            inv.InvoiceAmount || 0
          ];

          return fields.map(field => {
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          }).join(',');
        })
      ];

      const csvContent = '\uFEFF' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);

      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `invoices_export_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsOpen(false);
    } catch (err) {
      console.error("Export to Excel failed:", err);
      alert("Failed to export invoices. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 no-print cursor-pointer"
        title="Export to Excel"
      >
        <span className="hidden md:block">Export to Excel</span>
        <svg className="h-5 w-5 md:ml-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-150 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Invoices
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Select the filters and date range of the invoices you wish to export to Excel (CSV format).
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="exportStartDate" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <input
                    id="exportStartDate"
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="exportEndDate" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    End Date
                  </label>
                  <input
                    id="exportEndDate"
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="exportBillType" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Bill Type
                </label>
                <select
                  id="exportBillType"
                  value={exportBillType}
                  onChange={(e) => setExportBillType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white cursor-pointer"
                >
                  <option value="">All Bill Types</option>
                  <option value="normal">Normal Bill</option>
                  <option value="gst">Gst Bill</option>
                </select>
              </div>

              {/* Quick Select Actions */}
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setExportStartDate(defaultStartDate);
                    setExportEndDate(defaultEndDate);
                    setExportBillType(billType);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Reset to Defaults
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setExportStartDate('');
                    setExportEndDate('');
                    setExportBillType('');
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  'Download CSV'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
