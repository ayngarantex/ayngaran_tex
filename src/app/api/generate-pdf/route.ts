import puppeteer from "puppeteer";

export async function POST(req: Request) {
  const { html } = await req.json();

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "domcontentloaded",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,

    margin: {
      top: "20px",
      bottom: "120px", // 🔥 space for footer
      left: "20px",
      right: "20px",
    },

    displayHeaderFooter: true,

    headerTemplate: `<div></div>`,

    // footerTemplate: `
    //   <div style="width:100%; font-size:10px; padding:10px 20px;">
    //     <div style="border-top:1px solid #ccc; padding-top:10px;">

    //       <div style="display:flex; justify-content:space-between;">
    //         <div>
    //           <b>Bank:</b> CANARA BANK<br/>
    //           A/C: 120024091918<br/>
    //           IFSC: CNRB0001208
    //         </div>

    //         <div style="text-align:right;">
    //           Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    //         </div>
    //       </div>

    //     </div>
    //   </div>
    // `,
  });

  await browser.close();

  return new Response(pdfBuffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=invoice.pdf",
    },
  });
}