import * as nodeInvoice from '@/app/api/node/invoice';
import * as nodeCustomers from '@/app/api/node/customers';
import * as nodeProducts from '@/app/api/node/product';
import * as nodeSuppliers from '@/app/api/node/supplier';
import * as nodeLooms from '@/app/api/node/looms';
import * as nodeSizing from '@/app/api/node/sizing';
import * as nodeYarns from '@/app/api/node/yarns';

export const fetchInvoices = nodeInvoice.fetchInvoices;
export const fetchInvoicesCount = nodeInvoice.fetchInvoicesCount;
export const fetchInvoicesPages = async (...args: any[]) => {
  const count = await nodeInvoice.fetchInvoicesCount(args[0], args[1], args[2], args[3], args[4] || '');
  return { count, totalPages: Math.ceil((count || 0) / 20) };
};
export const fetchInvoiceById = nodeInvoice.fetchInvoiceById;
export const fetchInvoiceTotal = nodeInvoice.fetchInvoiceTotal;

export const fetchAllCustomers = nodeCustomers.fetchCustomers;
export const fetchCustomers = nodeCustomers.fetchCustomers;
export const fetchCustomerPages = async (...args: any[]) => 1;
export const fetchCustomerById = nodeCustomers.fetchCustomerById;

export const fetchAllProducts = nodeProducts.fetchNodeProducts;
export const fetchProductsWithCode = nodeCustomers.fetchProductsWithCode;
export const fetchProducts = nodeProducts.fetchNodeProducts;
export const fetchProductPages = async (...args: any[]) => 1;
export const fetchProductById = nodeProducts.fetchNodeProductById;

export const fetchPaymentPages = async (...args: any[]) => [];
export const fetchInvoiceByCustomerId = nodeInvoice.fetchCustomerInvoices;
export const fetchPaymentByCustomerId = nodeInvoice.fetchCustomerPayments;

export const fetchYarns = nodeYarns.fetchYarns;
export const fetchYarnPages = nodeYarns.fetchYarnPages;
export const fetchAllSuppliers = async (type: string = 'All') => nodeSuppliers.fetchAllSuppliers(type);
export const fetchYarnById = nodeYarns.fetchYarnById;
export const fetchYarnsDetails = nodeYarns.fetchYarnsDetails;

export const fetchSuppliers = nodeSuppliers.fetchSuppliers;
export const fetchSupplierPages = async (...args: any[]) => 1;
export const fetchSupplierById = nodeSuppliers.fetchSupplierById;
export const fetchYarnBySupplierId = async (...args: any[]) => [];
export const fetchPaymentBySupplierId = async (...args: any[]) => [];

export const fetchSizing = nodeSizing.fetchSizing;
export const fetchSizingPages = nodeSizing.fetchSizingPages;
export const fetchSizingTotal = nodeSizing.fetchSizingTotal;
export const fetchSizingById = nodeSizing.fetchSizingById;

export const fetchLooms = nodeLooms.fetchLooms;
export const fetchAllLooms = async (query: string = '', page: number = 1) => nodeLooms.fetchLooms(query, page);
export const fetchLoomById = nodeLooms.fetchLoomById;
export const fetchLoomPages = async (...args: any[]) => 1;
export const fetchLoomEntriesByLoomId = async (...args: any[]) => [];
export const fetchSizingWarpDetailsByLoomId = async (...args: any[]) => [];
export const getWarpDetailsBySizingId = async (...args: any[]) => [];
export const fetchEntryById = async (...args: any[]) => [];
