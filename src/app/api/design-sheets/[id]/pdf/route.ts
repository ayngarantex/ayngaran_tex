import { NextResponse } from 'next/server';
import { getDesignSheetById } from '@/server/repositories/designSheetRepositories';
import { launchBrowser, navigateToPrintUrl } from '@/app/lib/puppeteer-helper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const designSheetId = Number(id);

  if (!designSheetId || isNaN(designSheetId)) {
    return NextResponse.json({ error: 'Invalid design sheet id' }, { status: 400 });
  }

  const sheet = await getDesignSheetById(designSheetId);
  if (!sheet) {
    return NextResponse.json({ error: 'Design sheet not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const includeWidth = searchParams.get('includeWidth') !== 'false';
  const includeNotes = searchParams.get('includeNotes') !== 'false';

  const targetPath = `/admin/design-sheets/${designSheetId}?includeWidth=${includeWidth}&includeNotes=${includeNotes}`;
  const cookieHeader = request.headers.get('cookie');

  let browser: any;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await navigateToPrintUrl(page, request.url, targetPath, cookieHeader);

    // Emulate print media type so @media print / print:* styles apply
    await page.emulateMediaType('print');

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '6mm', right: '6mm', bottom: '6mm', left: '6mm' }
    });

    await browser.close();

    const pdfBuffer = Buffer.from(pdfUint8Array);
    const safeDesignNo = String(sheet.DesignNumber || designSheetId).replace(/[^a-zA-Z0-9_-]/g, '_');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="design_sheet_${safeDesignNo}.pdf"`,
      },
    });
  } catch (error: any) {
    if (browser) {
      try { await browser.close(); } catch (e) { }
    }
    console.error('Failed to generate Design Sheet PDF with Puppeteer:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

