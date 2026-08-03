// types.ts
export interface ProductRow {
  pId: number,
  product: number;
  productName: string;
  quantity: number;
  quantityType: string;
  price: number;
  type: string,
}

export interface SizingRow {
  pId: number,
  warpId: number,
  meters: number;
  color: any;
  date: string;
  weight: any;
  loomId: any
}

export interface PaymentRow {
  pId: number,
  date: string;
  amount: string;
  type: string;
  to: string;
}

export interface FinancialDateRow {
  startDate: string;
  endDate: string;
}

export interface YarnRow {
  pId: number,
  count: string;
  color: string;
  varient: string;
  bag: string,
  quantity: number;
  price: any;
}

export interface SizingItemsRow {
  pId: number,
  color: string;
  yarnSent: number,
  yarnUsed: number,
  yarnBalance: number,
}

export interface WarpDhotieRow {
  pId: number,
  dcId?: string,
  dc: string,
  date: string;
  piece: number,
  count: number,
  color: string,
  weight: string,
}

export interface ExpensesRow {
  pId: number,
  date: string,
  reason: string;
  type: string,
  amount: number,
  otherType: string,
}

export interface FinancialyearNewProps {
  hideYear?: boolean;
  orderBy?: boolean;
  LoomName?: boolean;
  hideBillType?: boolean;
  setFilter: (
    startDate: string,
    endDate: string,
    billType: string,
    orderByColumn: string,
    loomName: string,
  ) => void;
};
