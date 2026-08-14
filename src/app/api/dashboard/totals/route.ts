import { NextResponse } from 'next/server';
import { fetchInvoiceTotal } from '@/app/api/node/invoice';
import { fetchYarnsDetails } from '@/app/api/node/yarns';
import { fetchSizingTotal } from '@/app/api/node/sizing';
import { fetchPurchasesDetails } from '@/app/api/node/purchases';

export async function GET() {
  try {
    const [invoiceTotals, yarnTotals, sizingTotals, purchaseTotals] = await Promise.all([
      fetchInvoiceTotal("", "", "", ""),
      fetchYarnsDetails("", "", "", "", ""),
      fetchSizingTotal("", "", "", "", ""),
      fetchPurchasesDetails("", "", "", "", "")
    ]);

    const invoicePending = (invoiceTotals?.TotalBalanceAmount || 0) - (invoiceTotals?.TotalCancelledAmount || 0);
    const yarnPending = yarnTotals?.balance || 0;
    const yarnPurchased = yarnTotals?.totalInvoiceAmount || 0;
    const sizingPending = sizingTotals?.balance || 0;
    const sizingPurchased = sizingTotals?.totalInvoiceAmount || 0;
    const purchasePending = purchaseTotals?.balance || 0;
    const purchasePurchased = purchaseTotals?.totalInvoiceAmount || 0;

    return NextResponse.json({
      invoicePending,
      yarnPending,
      yarnPurchased,
      sizingPending,
      sizingPurchased,
      purchasePending,
      purchasePurchased
    });
  } catch (error: any) {
    console.error("Failed to fetch dashboard totals:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard totals" }, { status: 500 });
  }
}
