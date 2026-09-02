import { NextResponse } from 'next/server';
import { launchBrowser, navigateToPrintUrl } from '@/app/lib/puppeteer-helper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supplierId = Number(id);

  if (isNaN(supplierId)) {
    return NextResponse.json({ error: 'Invalid Supplier ID' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const filterType = searchParams.get('filterType') || 'all';
  const billType = searchParams.get('billType') || '';

  const targetPath = `/admin/suppliers/${supplierId}/ledger?print=true&startDate=${startDate}&endDate=${endDate}&filterType=${filterType}&billType=${billType}`;
  const cookieHeader = request.headers.get('cookie');

  let browser: any;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await navigateToPrintUrl(page, request.url, targetPath, cookieHeader);

    // Emulate print media
    await page.emulateMediaType('print');

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '6mm', right: '6mm', bottom: '6mm', left: '6mm' }
    });

    await browser.close();

    const pdfBuffer = Buffer.from(pdfUint8Array);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ledger_supplier_${supplierId}.pdf"`,
      },
    });
  } catch (error: any) {
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    console.error('Failed to generate supplier ledger PDF with Puppeteer:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
