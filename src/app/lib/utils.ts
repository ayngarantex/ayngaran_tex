// import { Revenue } from './definitions';

export const pageLimit = 20;

export const formatCurrency = (amount: number) => {
  return (amount).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
};

const dateStr = "Sat Aug 16 2025 05:30:00 GMT+0530 (India Standard Time)";
const date = new Date(dateStr);

// Convert to YYYY-MM-DD
const formatted = date.toISOString().split("T")[0];

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-IN',
) => {
  const date = new Date(dateStr);

  // const options: Intl.DateTimeFormatOptions = {
  //   day: '2-digit',   // Ensures leading zero for single digits
  //   month: 'short',   // Jan, Feb, Mar
  //   year: 'numeric',  // 2025
  // };

  // return date.toLocaleDateString(locale, options);
  return date.toISOString().split("T")[0];
};

export const formatDate = (
  dateStr: string,
  locale: string = 'en-IN',
) => {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',   // Ensures leading zero for single digits
    month: 'short',   // Jan, Feb, Mar
    year: 'numeric',  // 2025
  };

  return date.toLocaleDateString(locale, options);
  // return date.toISOString().split("T")[0];
};

export const formatNewDate = (
  dateStr: string,
  locale: string = 'en-IN',
) => {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',   // Ensures leading zero for single digits
    month: '2-digit',   // Jan, Feb, Mar
    year: 'numeric',  // 2025
  };

  return date.toLocaleDateString(locale, options);
  // return date.toISOString().split("T")[0];
};

export const formatNumDate = (
  dateStr: string,
  locale: string = 'en-IN',
) => {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',   // Ensures leading zero for single digits
    month: 'short',   // Jan, Feb, Mar
    year: '2-digit',  // 2025
  };

  return date.toLocaleDateString(locale, options);
  // return date.toISOString().split("T")[0];
};

export const currentDate = () => {
  const today = new Date();

  // Formatted for a specific locale (e.g., US English)
  const formattedDateLocale = today.toLocaleDateString('en-IN');

  // ISO 8601 format
  const formattedDateISO = today.toISOString().slice(0, 10); // "YYYY-MM-DD"
  return formattedDateISO;
};

export const getFinancialYears = (startYear: number, futureYears = 1) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // if before April, financial year is still previous
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
}

export const statesList = () => {
  return [
    { label: 'TamilNadu', code: 33 }, { label: 'Kerala', code: 32 }, { label: 'Karnataka', code: 29 }];
}

export const yarnCountList = () => {
  return ['18s', '20s', '26s', '2-20s', '2-40s', 'Freight'];
}

export const productType = () => {
  return ['Folded', 'Unfold', 'Without Kuri'];
}

export const loomsList = () => {
  return ['Angamuthu Modamangalam', 'Madeshwara Tex', 'R.karthikeya Tex', 'Vishnu Tex', 'Archana Tex', 'Elavarasan', 'Sri Angalaparamasewari Tex'];
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
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

export const daysDiff = (date: string) => {
  const invoiceDate = new Date(date); // your invoice date

  const today = new Date();

  const diffTime = today.getTime() - invoiceDate.getTime(); // difference in ms
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert ms → days

  return diffDays;

}

export const generateYAxis = (revenue: any) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month: any) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
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

  // Helper for numbers < 1000
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
}


export const getFinancialYear = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${(year + 1)}`;
  } else {
    return `${(year - 1)}-${year}`;
  }
};

export const getFinancialYearShort = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
  }
};


export const invoiceTypeOptions = () => {
  return ['Tax Invoice', 'Credit Note', 'Job WOrk'];
}

export const getFinancialYearShortNew = (dateStr: string) => {
  const date = new Date(Number(dateStr));
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
  }
};

export const formatDateNew = (
  dateStr: string,
  locale: string = 'en-IN',
) => {
  const date = new Date(Number(dateStr));

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',   // Ensures leading zero for single digits
    month: 'short',   // Jan, Feb, Mar
    year: 'numeric',  // 2025
  };

  return date.toLocaleDateString(locale, options);
  // return date.toISOString().split("T")[0];
};

export const daysDiffNew = (date: string) => {
  const invoiceDate = new Date(Number(date)); // your invoice date

  const today = new Date();

  const diffTime = today.getTime() - invoiceDate.getTime(); // difference in ms
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert ms → days

  return diffDays;

}

export const formatDateToLocalNew = (
  dateStr: string,
  locale: string = 'en-IN',
) => {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && dateStr.includes('-') && !isNaN(Date.parse(dateStr))) {
    return dateStr;
  }

  const num = Number(dateStr);
  const date = new Date(isNaN(num) ? dateStr : num);

  if (isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};