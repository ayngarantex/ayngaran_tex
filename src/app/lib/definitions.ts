// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type CustomerField = {
  CustomerId: number;
  CustomerName: string | null;
  GstNumber: string | null;
  State: string | null
};

export type InvoiceField = {
  customers: {
    CustomerId: number;
    CustomerName: string | null;
    GstNumber: string | null;
    Address: Uint8Array | null;
    State: string | null;
    Phone: string | null;
    Mobile: string | null;
    Agent: string | null;
  } | null;
  InvoiceId: number;
  InvoiceNumber: string | null;
  InvoiceDate: string | null;
  CustomerId: number;
  BeforeTaxAcount: string | null;
  TaxPercentage: string | null;
  Sgst: string | null;
  Cgst: string | null;
  Igst: string | null;
  AfterTax: string | null;
  RoundOff: string | null;
  Status: string | null;
  ReceivedAmount: number;
  invoice_details: {}
};

export type ProductField = {
  Id: number;
  Name: string | null;
  HSNCode: string | null;
  ProductCode?: string | null;
  Type?: string | null;
  ProductPrice?: any
  PurchaseType: string | null
};

export type PaymentField = {
  Id: number;
  CustomerId: number;
  InvoiceId: number;
  Amount: string | null;
  Date: string | null;
  Type: String | null;
};

export type SupplierField = {
  SupplierId: number;
  Name: string | null;
  GstNumber: string | null;
  State: string | null
};

export type loginFields = {
  email: string;
  password: string | null;
};

export type LoomField = {
  LoomId: number;
  LoomName: string | null;
  Address: string | null;
  Count: any
};