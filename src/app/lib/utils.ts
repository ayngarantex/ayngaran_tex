export const pageLimit = 20;

export const formatCurrency = (amount: number) => {
  return (amount || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
};

export const parseAnyDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

  // If it's a numeric string timestamp (e.g. "1740000000000")
  if (typeof dateStr === 'string' && /^\d+$/.test(dateStr)) {
    const numDate = new Date(Number(dateStr));
    if (!isNaN(numDate.getTime())) return numDate;
  }

  // Standard date string ("2025-08-16", "2025-08-16T00:00:00.000Z", "2025-08-16 00:00:00")
  const strDate = new Date(dateStr);
  if (!isNaN(strDate.getTime())) return strDate;

  // Numeric timestamp input
  if (typeof dateStr === 'number') {
    const numDate = new Date(dateStr);
    if (!isNaN(numDate.getTime())) return numDate;
  }

  return null;
};

export const formatDateToLocal = (
  dateStr: any,
  locale: string = 'en-IN',
) => {
  const date = parseAnyDate(dateStr);
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDate = (
  dateStr: any,
  locale: string = 'en-IN',
) => {
  const date = parseAnyDate(dateStr);
  if (!date) return '-';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  return date.toLocaleDateString(locale, options);
};

export const formatNewDate = (
  dateStr: any,
  locale: string = 'en-IN',
) => {
  const date = parseAnyDate(dateStr);
  if (!date) return '-';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  return date.toLocaleDateString(locale, options);
};

export const formatNumDate = (
  dateStr: any,
  locale: string = 'en-IN',
) => {
  const date = parseAnyDate(dateStr);
  if (!date) return '-';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  };

  return date.toLocaleDateString(locale, options);
};

export const currentDate = () => {
  const today = new Date();
  const formattedDateISO = today.toISOString().slice(0, 10);
  return formattedDateISO;
};

export const getFinancialYears = (startYear: number, futureYears = 1) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let lastYear;
  if (currentMonth < 4) {
    lastYear = currentYear - 1;
  } else {
    lastYear = currentYear;
  }

  const endYear = lastYear + futureYears;
  const years = [];

  for (let y = startYear; y <= endYear; y++) {
    years.push(`${y}-${y + 1}`);
  }

  return years;
};

export const statesList = () => {
  return [
    { label: 'TamilNadu', code: 33 }, { label: 'Kerala', code: 32 }, { label: 'Karnataka', code: 29 }
  ];
};

export const yarnCountList = () => {
  return ['18s', '20s', '26s', '2-20s', '2-40s', 'Freight'];
};

export const productType = () => {
  return ['Folded', 'Unfold', 'Without Kuri'];
};

export const loomsList = () => {
  return ['Angamuthu Modamangalam', 'Madeshwara Tex', 'R.karthikeya Tex', 'Vishnu Tex', 'Archana Tex', 'Elavarasan', 'Sri Angalaparamasewari Tex'];
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export const daysDiff = (dateStr: any) => {
  const invoiceDate = parseAnyDate(dateStr);
  if (!invoiceDate) return 0;

  const today = new Date();
  const diffTime = today.getTime() - invoiceDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const numberToIndianWords = (num: number) => {
  if (typeof num !== "number" || isNaN(num)) return "Invalid number";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function numToWords(n: number) {
    let str = "";
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n = n % 100;
    }
    if (n > 19) {
      str += tens[Math.floor(n / 10)] + " ";
      n = n % 10;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }

  if (num === 0) return "Zero";

  let result = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num / 100000) % 100);
  const thousand = Math.floor((num / 1000) % 100);
  const hundred = Math.floor((num / 100) % 10);
  const rest = Math.floor(num % 100);

  if (crore > 0) result += numToWords(crore) + " Crore ";
  if (lakh > 0) result += numToWords(lakh) + " Lakh ";
  if (thousand > 0) result += numToWords(thousand) + " Thousand ";
  if (hundred > 0) result += ones[hundred] + " Hundred ";
  if (rest > 0 && num > 100) result += "and ";
  if (rest > 0) result += numToWords(rest);

  return result.trim();
};

export const getFinancialYear = (dateStr: any) => {
  const date = parseAnyDate(dateStr);
  if (!date) return '';
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${(year + 1)}`;
  } else {
    return `${(year - 1)}-${year}`;
  }
};

export const getFinancialYearShort = (dateStr: any) => {
  const date = parseAnyDate(dateStr);
  if (!date) return '';
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
  }
};

export const invoiceTypeOptions = () => {
  return ['B2B', 'B2C', 'Job Work', 'Credit Note', "Tax Invoice"];
};

export const getFinancialYearShortNew = (dateStr: any) => {
  return getFinancialYearShort(dateStr);
};

export const formatDateNew = (
  dateStr: any,
  locale: string = 'en-IN',
) => {
  return formatDate(dateStr, locale);
};

export const daysDiffNew = (dateStr: any) => {
  return daysDiff(dateStr);
};

export const formatDateToLocalNew = (
  dateStr: any,
  locale: string = 'en-IN',
) => {
  return formatDateToLocal(dateStr, locale);
};

export const expenseTypeOptions = () => {
  return [
    'Yarn', 'Wages', 'Sizing', 'Transaction Charges', 'Purchase', 'Transport', 'Loan', 'Cheet', 'Comission', 'Gst Charges', 'Stationary', 'Bill', 'Others'
  ];
};