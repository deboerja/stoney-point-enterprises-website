// Accessibility check via axe-core + Playwright against the local preview
// server. Not part of the site build -- a testing-only script.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";
const pages = [
  "/",
  "/about",
  "/capabilities",
  "/projects",
  "/projects/residentai-home-energy-intelligence",
  "/security",
  "/privacy",
  "/contact",
  "/legal",
];

const browser = await chromium.launch();
const context = await browser.newContext();
let totalViolations = 0;

for (const path of pages) {
  const page = await context.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const violations = results.violations;
  totalViolations += violations.length;
  console.log(`\n${path} -- ${violations.length} violation(s)`);
  for (const v of violations) {
    console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`);
    for (const n of v.nodes.slice(0, 3)) {
      console.log(`      ${n.target.join(" ")}`);
    }
  }
  await page.close();
}

await browser.close();
console.log(`\nTOTAL VIOLATIONS: ${totalViolations}`);
process.exit(totalViolations > 0 ? 1 : 0);
