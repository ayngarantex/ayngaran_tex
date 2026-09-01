"use client";
import { useState, useEffect, useRef } from 'react';
import { deleteInvoice, fetchInvoices, fetchGstr1Data } from '@/app/api/node/invoice';
import { PencilIcon, PlusIcon, TrashIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getFinancialYearShortNew, formatDateNew, invoiceTypeOptions } from '@/app/lib/utils';

export function CreateInvoice() {
  return (
    <Link
      href="/admin/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Invoice</span>{' '}
      <PlusIcon className="h-5 md:" />
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

export function DownloadInvoice({ 
  invoice,
  original = true,
  duplicate = false,
  className,
  showLabel = false,
}: { 
  invoice: any;
  original?: boolean;
  duplicate?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleDownload = async (optOriginal: boolean, optDuplicate: boolean) => {
    setShowDropdown(false);
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      params.set('original', String(optOriginal));
      params.set('duplicate', String(optDuplicate));

      const response = await fetch(`/api/invoices/${invoice.InvoiceId}/pdf?${params.toString()}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Invoice PDF server generation error:", errData);
        alert(`Server PDF generation issue (${errData.details || errData.error || 'Server error'}). Opening print page so you can print or save as PDF.`);
        window.open(`/admin/invoices/${invoice.InvoiceId}/print?original=${optOriginal}&duplicate=${optDuplicate}`, '_blank');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      let fileName = `invoice_${invoice.InvoiceId}.pdf`;
      if (invoice?.InvoiceNumber) {
        const formattedNum = invoice.InvoiceType === 'Credit Note'
          ? `${getFinancialYearShortNew(invoice.InvoiceDate)}_AT-C_${String(invoice.InvoiceNumber).padStart(2, '0')}` : invoiceTypeOptions().map((option: any) => option).includes(invoice.InvoiceType)
            ? `${getFinancialYearShortNew(invoice.InvoiceDate)}_AT_${String(invoice.InvoiceNumber).padStart(2, '0')}`
            : `S-DC_${String(invoice.InvoiceNumber).padStart(2, '0')}`;
        fileName = `${formattedNum}.pdf`;
      }

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } catch (err: any) {
      console.error("Invoice PDF download error:", err);
      alert("Unable to download PDF from server. Opening print page so you can save as PDF directly.");
      window.open(`/admin/invoices/${invoice.InvoiceId}/print?original=${optOriginal}&duplicate=${optDuplicate}`, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleButtonClick = () => {
    if (showLabel) {
      handleDownload(original, duplicate);
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={downloading}
        className={className || "rounded-md border p-2 hover:bg-blue-100 cursor-pointer disabled:opacity-50 flex items-center justify-center"}
        title={showLabel ? "Download PDF" : "Download PDF copies"}
      >
        {downloading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {showLabel && <span>Downloading...</span>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ArrowDownTrayIcon className="w-5" />
            {showLabel && <span>Download PDF</span>}
          </div>
        )}
      </button>

      {showDropdown && !showLabel && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 focus:outline-none border border-gray-100">
          <div className="py-1">
            <button
              onClick={() => handleDownload(true, false)}
              className="text-left block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
            >
              Original Copy
            </button>
            <button
              onClick={() => handleDownload(false, true)}
              className="text-left block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium border-t border-gray-100"
            >
              Duplicate Copy
            </button>
            <button
              onClick={() => handleDownload(true, true)}
              className="text-left block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium border-t border-gray-100"
            >
              Both Copies
            </button>
          </div>
        </div>
      )}
    </div>
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
      <PrinterIcon className="h-5 md: w-5 text-gray-500" />
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
        <svg className="h-5 w-5 md: text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

export function ExportGstr1() {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const years = Array.from({ length: 7 }, (_, i) => String(currentYear - 3 + i));
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const lastDay = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
      const endDate = `${selectedYear}-${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

      // Call the Server Action to get raw data
      const { invoices, details } = await fetchGstr1Data(startDate, endDate);

      // Helper function to format invoice numbers exactly as printed
      const formatInvoiceNumber = (inv: any) => {
        const isCreditNote = inv.InvoiceType === 'Credit Note';
        const dateObj = new Date(inv.InvoiceDate);
        const year = dateObj.getFullYear();
        const shortYr = year.toString().slice(-2);
        const nextYrShort = (year + 1).toString().slice(-2);
        const prevYrShort = (year - 1).toString().slice(-2);
        const isAprilOrLater = (dateObj.getMonth() + 1) >= 4;
        const fy = isAprilOrLater ? `${shortYr}-${nextYrShort}` : `${prevYrShort}-${shortYr}`;
        const numStr = String(inv.InvoiceNumber).padStart(2, '0');
        return isCreditNote ? `${fy}/AT-C/${numStr}` : `${fy}/AT/${numStr}`;
      };

      // Construct GSTR-1 JSON schema
      const gstinSupplier = "33AYWPV5842M1ZD"; // hardcoded supplier GSTIN
      const fp = `${selectedMonth}${selectedYear}`;

      const b2bMap = new Map();
      const cdnrMap = new Map();
      const b2csMap = new Map();

      // 1. Group regular invoices by Customer GSTIN (B2B)
      for (const inv of invoices) {
        if (inv.BillType !== 'gst') continue;

        const isCreditNote = inv.InvoiceType === 'Credit Note';
        const hasGst = inv.GstNumber && inv.GstNumber.trim().length === 15;

        const dateObj = new Date(inv.InvoiceDate);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const idt = `${day}-${month}-${year}`;

        const inum = formatInvoiceNumber(inv);
        const val = Number(inv.InvoiceAmount);

        // Map state name to state code
        const stateMapping: Record<string, string> = {
          'TamilNadu': '33',
          'Kerala': '32',
          'Karnataka': '29'
        };
        const pos = hasGst ? inv.GstNumber.substring(0, 2) : (stateMapping[inv.State] || '33');

        if (hasGst) {
          const ctin = inv.GstNumber.toUpperCase();

          const itm_det: any = {
            txval: Number(inv.BeforeTax || 0),
            rt: Number(inv.TaxPercentage || 5),
            iamt: 0,
            camt: 0,
            samt: 0,
            csamt: 0
          };

          const isLocal = pos === '33';
          if (isLocal) {
            itm_det.camt = Number(inv.Cgst || 0);
            itm_det.samt = Number(inv.Sgst || 0);
          } else {
            itm_det.iamt = Number(inv.Igst || 0);
          }

          if (isCreditNote) {
            if (!cdnrMap.has(ctin)) {
              cdnrMap.set(ctin, { ctin, nt: [] });
            }
            cdnrMap.get(ctin).nt.push({
              ntty: 'C',
              nt_num: inum,
              nt_dt: idt,
              val: val,
              inum: inum,
              idt: idt,
              rchrg: 'N',
              itms: [
                {
                  num: 1,
                  itm_det: itm_det
                }
              ]
            });
          } else {
            if (!b2bMap.has(ctin)) {
              b2bMap.set(ctin, { ctin, inv: [] });
            }
            b2bMap.get(ctin).inv.push({
              inum: inum,
              idt: idt,
              val: val,
              pos: pos,
              rchrg: 'N',
              inv_typ: 'R',
              itms: [
                {
                  num: 1,
                  itm_det: itm_det
                }
              ]
            });
          }
        } else {
          // B2C Small
          const rate = Number(inv.TaxPercentage || 5);
          const b2csKey = `${pos}_${rate}`;
          if (!b2csMap.has(b2csKey)) {
            b2csMap.set(b2csKey, {
              typ: 'OE',
              sply_ty: pos === '33' ? 'INTRA' : 'INTER',
              rt: rate,
              pos: pos,
              txval: 0,
              iamt: 0,
              camt: 0,
              samt: 0,
              csamt: 0
            });
          }
          const b2csItem = b2csMap.get(b2csKey);
          b2csItem.txval += Number(inv.BeforeTax || 0);
          b2csItem.iamt += Number(inv.Igst || 0);
          b2csItem.camt += Number(inv.Cgst || 0);
          b2csItem.samt += Number(inv.Sgst || 0);
        }
      }

      const b2bList = Array.from(b2bMap.values());
      const cdnrList = Array.from(cdnrMap.values());
      const b2csList = Array.from(b2csMap.values()).map((item: any) => ({
        ...item,
        txval: Number(item.txval.toFixed(2)),
        iamt: Number(item.iamt.toFixed(2)),
        camt: Number(item.camt.toFixed(2)),
        samt: Number(item.samt.toFixed(2))
      }));

      // 2. Group details for HSN summary (split into hsn_b2b and hsn_b2c)
      const hsnB2bMap = new Map();
      const hsnB2cMap = new Map();

      for (const detail of details) {
        if (detail.BillType !== 'gst') continue;

        const hsn = detail.HSNCode || '5208';
        const rate = Number(detail.TaxPercentage || 5);
        const key = `${hsn}_${rate}`;

        const hasGst = detail.GstNumber && detail.GstNumber.trim().length === 15;
        const targetMap = hasGst ? hsnB2bMap : hsnB2cMap;

        if (!targetMap.has(key)) {
          targetMap.set(key, {
            hsn_sc: hsn,
            desc: detail.ItemName || 'Fabric',
            uqc: 'MTR',
            qty: 0,
            txval: 0,
            rt: rate,
            iamt: 0,
            camt: 0,
            samt: 0
          });
        }

        const hsnItem = targetMap.get(key);
        hsnItem.qty += Number(detail.Quantity || 0);
        hsnItem.txval += Number(detail.Total || 0);

        const taxFactor = rate / 100;
        const itemTotalTax = Number(detail.Total || 0) * taxFactor;

        const isLocal = detail.State === 'TamilNadu';
        if (isLocal) {
          hsnItem.camt += Number((itemTotalTax / 2).toFixed(2));
          hsnItem.samt += Number((itemTotalTax / 2).toFixed(2));
        } else {
          hsnItem.iamt += Number(itemTotalTax.toFixed(2));
        }
      }

      let hsnB2bNum = 1;
      const hsnB2bList = Array.from(hsnB2bMap.values()).map((item: any) => ({
        num: hsnB2bNum++,
        hsn_sc: item.hsn_sc,
        txval: Number(item.txval.toFixed(2)),
        iamt: Number(item.iamt.toFixed(2)),
        camt: Number(item.camt.toFixed(2)),
        samt: Number(item.samt.toFixed(2)),
        csamt: 0,
        uqc: item.uqc,
        qty: Number(item.qty.toFixed(2)),
        rt: item.rt
      }));

      let hsnB2cNum = 1;
      const hsnB2cList = Array.from(hsnB2cMap.values()).map((item: any) => ({
        num: hsnB2cNum++,
        hsn_sc: item.hsn_sc,
        txval: Number(item.txval.toFixed(2)),
        iamt: Number(item.iamt.toFixed(2)),
        camt: Number(item.camt.toFixed(2)),
        samt: Number(item.samt.toFixed(2)),
        csamt: 0,
        uqc: item.uqc,
        qty: Number(item.qty.toFixed(2)),
        rt: item.rt
      }));

      // 3. Document issues (12 categories)
      const docDetList = [];
      for (let i = 1; i <= 12; i++) {
        if (i === 1) {
          const regularInvoices = invoices.filter((inv: any) => inv.BillType === 'gst' && inv.InvoiceType === 'Tax Invoice');
          if (regularInvoices.length > 0) {
            const sorted = [...regularInvoices].sort((a: any, b: any) => Number(a.InvoiceNumber) - Number(b.InvoiceNumber));
            const minFormatted = formatInvoiceNumber(sorted[0]);
            const maxFormatted = formatInvoiceNumber(sorted[sorted.length - 1]);
            const total = regularInvoices.length;
            const cancelled = regularInvoices.filter((inv: any) => inv.IsCancel === 1).length;

            docDetList.push({
              docs: [
                {
                  num: 1,
                  from: minFormatted,
                  to: maxFormatted,
                  totnum: total,
                  cancel: cancelled,
                  net_issue: total - cancelled
                }
              ],
              doc_num: 1
            });
          }
        } else if (i === 5) {
          const creditNotes = invoices.filter((inv: any) => inv.BillType === 'gst' && inv.InvoiceType === 'Credit Note');
          if (creditNotes.length > 0) {
            const sorted = [...creditNotes].sort((a: any, b: any) => Number(a.InvoiceNumber) - Number(b.InvoiceNumber));
            const minFormatted = formatInvoiceNumber(sorted[0]);
            const maxFormatted = formatInvoiceNumber(sorted[sorted.length - 1]);
            const total = creditNotes.length;
            const cancelled = creditNotes.filter((inv: any) => inv.IsCancel === 1).length;

            docDetList.push({
              docs: [
                {
                  num: 1,
                  from: minFormatted,
                  to: maxFormatted,
                  totnum: total,
                  cancel: cancelled,
                  net_issue: total - cancelled
                }
              ],
              doc_num: 5
            });
          }
        }
      }

      const nilInv = [
        { sply_ty: "INTRB2B", nil_amt: 0, expt_amt: 0, ngsup_amt: 0 },
        { sply_ty: "INTRAB2B", nil_amt: 0, expt_amt: 0, ngsup_amt: 0 },
        { sply_ty: "INTRB2C", nil_amt: 0, expt_amt: 0, ngsup_amt: 0 },
        { sply_ty: "INTRAB2C", nil_amt: 0, expt_amt: 0, ngsup_amt: 0 }
      ];

      const gstr1Json: any = {
        gstin: gstinSupplier,
        fp: fp,
        b2b: b2bList,
        b2cs: b2csList,
        nil: {
          inv: nilInv
        },
        hsn: {
          hsn_b2b: hsnB2bList,
          hsn_b2c: hsnB2cList
        },
        doc_issue: {
          doc_det: docDetList
        }
      };

      if (cdnrList.length > 0) {
        gstr1Json.cdnr = cdnrList;
      }

      // Trigger file download
      const jsonContent = JSON.stringify(gstr1Json);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `returns_${selectedMonth}${selectedYear}_R1_${gstinSupplier}_offline.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsOpen(false);
    } catch (err) {
      console.error("GSTR-1 generation failed:", err);
      alert("Failed to export GSTR-1 return file. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 no-print cursor-pointer"
        title="Export GSTR-1 Return"
      >
        <span className="hidden md:block">Export GSTR-1</span>
        <ArrowDownTrayIcon className="h-5 md: w-5 text-white" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs no-print">
          <div className="w-[450px] bg-white rounded-xl shadow-2xl p-6 border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export GSTR-1 Return File
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 bg-white"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Select Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 bg-white"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
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
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Export JSON'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
