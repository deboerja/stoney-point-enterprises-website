// Lighthouse audit against the local preview server. Testing-only script.
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { writeFileSync } from "node:fs";

const BASE = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";
const pages = ["/", "/projects/residentai-home-energy-intelligence", "/security"];

const chrome = await launch({ chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"] });

for (const path of pages) {
  const options = { logLevel: "error", output: "json", port: chrome.port, onlyCategories: ["performance", "accessibility", "best-practices", "seo"] };
  const runnerResult = await lighthouse(BASE + path, options);
  const { categories } = runnerResult.lhr;
  const slug = path === "/" ? "home" : path.replace(/\//g, "_").replace(/^_/, "");
  writeFileSync(`/tmp/lighthouse-${slug}.json`, runnerResult.report);
  console.log(`\n${path}`);
  for (const [key, cat] of Object.entries(categories)) {
    console.log(`  ${cat.title}: ${Math.round(cat.score * 100)}`);
  }
}

await chrome.kill();
