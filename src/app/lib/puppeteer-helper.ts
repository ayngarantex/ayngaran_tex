import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';
import fs from 'fs';

/**
 * Robustly launches Puppeteer across different environments:
 * 1. Vercel / AWS Lambda Serverless (@sparticuz/chromium + puppeteer-core)
 * 2. Standalone Node.js server / Linux VPS (puppeteer with server flags)
 * 3. Fallback to system Chromium/Chrome binaries on Linux/Windows VPS if local bundle missing
 * 4. Fallback to @sparticuz/chromium pack executable path
 */
export async function launchBrowser() {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    try {
      return await puppeteerCore.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--ignore-certificate-errors',
        ],
        defaultViewport: (chromium as any).defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: (chromium as any).headless,
      } as any);
    } catch (e) {
      console.warn('Serverless chromium launch failed, falling back to next strategy:', e);
    }
  }

  // Strategy 1: Standard Node.js server / Linux VPS / Docker / Dev environment via puppeteer
  try {
    const puppeteer = await import('puppeteer');
    return await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--ignore-certificate-errors',
      ],
    } as any);
  } catch (err) {
    console.warn('Standard puppeteer launch failed, attempting fallback to system chromium:', err);
  }

  // Strategy 2: Common system chromium paths on Linux/Windows VPS
  const systemChromiumPaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const exePath of systemChromiumPaths) {
    if (fs.existsSync(exePath)) {
      try {
        return await puppeteerCore.launch({
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--ignore-certificate-errors',
          ],
          executablePath: exePath,
          headless: true,
        } as any);
      } catch (e) {
        console.warn(`System executable launch failed for ${exePath}:`, e);
      }
    }
  }

  // Strategy 3: Try @sparticuz/chromium as ultimate fallback
  try {
    const execPath = await chromium.executablePath();
    return await puppeteerCore.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--ignore-certificate-errors',
      ],
      executablePath: execPath,
      headless: true,
    } as any);
  } catch (e: any) {
    console.error('All Puppeteer launch strategies failed:', e);
    throw new Error('Server browser environment unavailable for PDF generation: ' + (e?.message || String(e)));
  }
}

/**
 * Attempts navigation to target URL with loopback fallback URLs and direct HTML fetch fallback.
 * On production servers, accessing the external public domain from inside the server process
 * often fails due to NAT loopback restrictions. Trying local loopback addresses and HTML fetch guarantees connection.
 */
export async function navigateToPrintUrl(page: any, requestUrl: string, targetPath: string, cookieHeader: string | null) {
  const reqUrlObj = new URL(requestUrl);
  const host = reqUrlObj.host || 'localhost:3000';
  const protocol = reqUrlObj.protocol || 'http:';
  const port = process.env.PORT || reqUrlObj.port || '3000';

  const urlsToTry = [
    `${protocol}//${host}${targetPath}`,
    `http://127.0.0.1:${port}${targetPath}`,
    `http://localhost:${port}${targetPath}`,
  ];

  if (cookieHeader) {
    await page.setExtraHTTPHeaders({
      cookie: cookieHeader,
    });
  }

  let navigated = false;
  let lastError: any = null;

  for (const testUrl of urlsToTry) {
    try {
      const res = await page.goto(testUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      if (res && res.status() < 400) {
        // Wait for key content elements (tables, invoice container, print layout) to render
        await page.waitForSelector('table, .invoice, #print-area, .print-layout', { timeout: 8000 }).catch(() => {});
        // Allow Next.js client hydration and async state renders to settle
        await new Promise((resolve) => setTimeout(resolve, 1500));
        navigated = true;
        break;
      }
    } catch (e: any) {
      lastError = e;
      console.warn(`Puppeteer navigation attempt failed for ${testUrl}:`, e?.message || e);
    }
  }

  // Fallback: If network navigation attempts failed, fetch HTML directly and set content
  if (!navigated) {
    try {
      const fetchUrl = `${protocol}//${host}${targetPath}`;
      const fetchRes = await fetch(fetchUrl, {
        headers: { cookie: cookieHeader || '' }
      });
      if (fetchRes.ok) {
        let html = await fetchRes.text();
        if (!html.includes('<base')) {
          html = html.replace('<head>', `<head><base href="${protocol}//${host}">`);
        }
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('table, .invoice, #print-area, .print-layout', { timeout: 8000 }).catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 1500));
        navigated = true;
      }
    } catch (fetchErr: any) {
      console.warn('Direct HTML fetch fallback failed:', fetchErr?.message || fetchErr);
    }
  }

  if (!navigated && lastError) {
    throw lastError;
  }
}
