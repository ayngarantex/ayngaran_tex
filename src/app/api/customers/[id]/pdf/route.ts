import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const customerId = Number(id);

  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid Customer ID' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const filterType = searchParams.get('filterType') || 'all';
  const billType = searchParams.get('billType') || '';

  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  
  // Construct print-optimized URL
  const printUrl = `${protocol}://${host}/admin/customers/${customerId}/ledger?print=true&startDate=${startDate}&endDate=${endDate}&filterType=${filterType}&billType=${billType}`;

  // Forward session cookies so Puppeteer authenticates properly
  const cookieHeader = request.headers.get('cookie');

  try {
    let browser: any;

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // Production Serverless environment
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: (chromium as any).defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: (chromium as any).headless,
      });
    } else {
      // Local development environment
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();
    
    if (cookieHeader) {
      await page.setExtraHTTPHeaders({
        cookie: cookieHeader,
      });
    }

    // Navigate and wait for content to load
    await page.goto(printUrl, { waitUntil: 'networkidle0' });

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
        'Content-Disposition': `attachment; filename="ledger_customer_${customerId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Failed to generate customer ledger PDF with Puppeteer:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error?.message },
      { status: 500 }
    );
  }
}
