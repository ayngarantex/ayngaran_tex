import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById } from '@/server/repositories/invoiceRepository';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';

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

  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const printUrl = `${protocol}://${host}/admin/invoices/${invoiceId}/print?original=${original}&duplicate=${duplicate}`;

  // Forward session cookies so Puppeteer authenticates properly
  const cookieHeader = request.headers.get('cookie');

  try {
    let browser: any;

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // Production Vercel Serverless environment
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: (chromium as any).defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: (chromium as any).headless,
      });
    } else {
      // Local Windows / Development environment
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    if (cookieHeader) {
      await page.setExtraHTTPHeaders({
        cookie: cookieHeader,
      });
    }

    // Navigate to print page and wait until network is idle
    await page.goto(printUrl, { waitUntil: 'networkidle0' });

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
    console.error('Failed to generate PDF with Puppeteer:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error?.message },
      { status: 500 }
    );
  }
}
