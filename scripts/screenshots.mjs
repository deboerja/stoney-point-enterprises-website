// Desktop + mobile screenshots against the local preview server.
// Testing-only script, not part of the site build.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";
const OUT_DIR = process.env.SCREENSHOT_DIR || "/tmp/spe-screenshots";
mkdirSync(OUT_DIR, { recursive: true });

const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const pages = [
  { path: "/", name: "home" },
  { path: "/projects/residentai-home-energy-intelligence", name: "residentai-energy" },
  { path: "/security", name: "security" },
];

const browser = await chromium.launch();

for (const [device, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport });
  for (const { path, name } of pages) {
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    // Full-page screenshots stitch multiple viewport-height tiles while
    // scrolling; a position:sticky header (correct, intended behavior on
    // the live site) gets re-captured in each tile, producing ghosted
    // duplicate text in the stitched image. Real users never see this --
    // it's purely a screenshot-capture artifact, confirmed by comparing
    // against a viewport-only capture. Disable sticky just for capture.
    await page.addStyleTag({ content: ".site-header { position: static !important; }" });
    const file = `${OUT_DIR}/${name}-${device}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log("saved", file);
    await page.close();
  }
  await context.close();
}

await browser.close();
