import { NextResponse } from 'next/server';
import { getInvoiceById } from '@/server/repositories/invoiceRepository';
import { launchBrowser, navigateToPrintUrl } from '@/app/lib/puppeteer-helper';

export const runtime = 'nodejs'; // Ensure Node runtime for Buffer support
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const invoiceId = Number(id);

  // Verify invoice exists
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const original = searchParams.get('original') !== 'false';
  const duplicate = searchParams.get('duplicate') === 'true';

  const targetPath = `/admin/invoices/${invoiceId}/print?original=${original}&duplicate=${duplicate}`;
  const cookieHeader = request.headers.get('cookie');

  let browser: any;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await navigateToPrintUrl(page, request.url, targetPath, cookieHeader);

    // Emulate print media type so @media print styles apply
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
        'Content-Disposition': `attachment; filename="invoice_${invoiceId}.pdf"`,
      },
    });
  } catch (error: any) {
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    console.error('Failed to generate PDF with Puppeteer:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
