const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

async function run() {
  const recDir = path.join(__dirname, "../recordings");
  if (!fs.existsSync(recDir)) {
    fs.mkdirSync(recDir, { recursive: true });
  }

  console.log("Launching Chrome...");
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: recDir,
      size: { width: 1280, height: 800 },
    },
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // crisp high DPI
  });

  const page = await context.newPage();
  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 1. Move to sample section
  console.log("Hovering sample invoice...");
  const sampleBtn = page.locator("button:has-text('Business Invoice')");
  await sampleBtn.hover();
  await page.waitForTimeout(800);

  // 2. Click the sample invoice
  console.log("Clicking Business Invoice...");
  await sampleBtn.click();
  await page.waitForTimeout(1200);

  // 3. Move to Run OCR button
  console.log("Hovering Run OCR button...");
  const runBtn = page.locator("button:has-text('Run OCR')");
  await runBtn.hover();
  await page.waitForTimeout(700);

  // 4. Click Run OCR
  console.log("Clicking Run OCR...");
  await runBtn.click();

  // 5. Wait for the OCR result to finish and appear
  console.log("Waiting for result...");
  await page.waitForSelector("text=VERTEX SOLUTIONS", { timeout: 30000 });
  await page.waitForTimeout(2000);

  // 6. Scroll down the result preview smoothly to show the parsed invoice table
  console.log("Scrolling through parsed result...");
  const contentArea = page.locator(".prose-ocr");
  if (await contentArea.count() > 0) {
    await page.evaluate(() => {
      const scrollable = document.querySelector(".prose-ocr")?.parentElement;
      if (scrollable) {
        scrollable.scrollBy({ top: 180, behavior: "smooth" });
      }
    });
    await page.waitForTimeout(1500);
  }

  // 7. Toggle to 'Raw' view
  console.log("Toggling to Raw view...");
  const rawBtn = page.locator("button:has-text('Raw')");
  if (await rawBtn.count() > 0) {
    await rawBtn.click();
    await page.waitForTimeout(1500);

    // Toggle back to Rendered
    console.log("Toggling back to Rendered view...");
    const renderedBtn = page.locator("button:has-text('Rendered')");
    await renderedBtn.click();
    await page.waitForTimeout(1500);
  }

  // 8. Click Copy button
  console.log("Clicking Copy...");
  const copyBtn = page.locator("button:has-text('Copy')");
  if (await copyBtn.count() > 0) {
    await copyBtn.click();
    await page.waitForTimeout(2000);
  }

  console.log("Finishing recording...");
  await page.waitForTimeout(1500);

  // Close page and context to finalize video
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const finalPath = path.join(recDir, "indra_ocr_demo.webm");
    fs.renameSync(videoPath, finalPath);
    console.log("SUCCESS! Video saved to:", finalPath);
  }
}

run().catch((err) => {
  console.error("Error during recording:", err);
  process.exit(1);
});
