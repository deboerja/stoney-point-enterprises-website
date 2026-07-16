// One-time (re-runnable) asset generation from the source logo.
// Not part of the site build itself -- run manually (`npm run assets`)
// whenever the source logo changes, and commit the resulting static
// files in public/. Keeps the Astro build itself simple/fast and
// fully static, per this project's "no unnecessary build-time work"
// design constraint.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = process.env.LOGO_SOURCE_PATH;
const OUT_DIR = path.join(ROOT, "public");

// Sampled from the source logo's background fill.
const BRAND_BG = "#0d2818";

if (!SOURCE) {
  console.error("LOGO_SOURCE_PATH env var not set -- point it at the source logo PNG.");
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

async function main() {
  const meta = await sharp(SOURCE).metadata();
  console.log("source:", SOURCE, meta.width, "x", meta.height);

  // 1. Icon-only crop (mountain + compass, no wordmark) for favicon use --
  // the full logo's text is illegible at favicon sizes. Crop is generous
  // (includes margin) then padded to a perfect square on the same
  // background color so nothing gets stretched or cut at the edges.
  const iconCropHeight = Math.round(meta.height * 0.64);
  const iconBuffer = await sharp(SOURCE)
    .extract({ left: 0, top: 0, width: meta.width, height: iconCropHeight })
    .resize({
      width: Math.max(meta.width, iconCropHeight),
      height: Math.max(meta.width, iconCropHeight),
      fit: "contain",
      background: BRAND_BG,
    })
    .toBuffer();

  await sharp(iconBuffer).resize(16, 16).png().toFile(path.join(OUT_DIR, "favicon-16.png"));
  await sharp(iconBuffer).resize(32, 32).png().toFile(path.join(OUT_DIR, "favicon-32.png"));
  await sharp(iconBuffer).resize(48, 48).png().toFile(path.join(OUT_DIR, "favicon-48.png"));
  await sharp(iconBuffer).resize(180, 180).png().toFile(path.join(OUT_DIR, "apple-touch-icon.png"));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(OUT_DIR, "icon-512.png"));
  await sharp(iconBuffer).resize(192, 192).png().toFile(path.join(OUT_DIR, "icon-192.png"));

  // 2. Header mark -- same icon crop, moderate resolution for crisp
  // display at small on-page sizes incl. retina.
  await sharp(iconBuffer).resize(160, 160).png().toFile(path.join(OUT_DIR, "logo-mark.png"));

  // 3. Full logo (icon + wordmark), moderate resolution, for use on the
  // About/Home page as the full brand mark.
  await sharp(SOURCE).resize(640, 640).png().toFile(path.join(OUT_DIR, "logo-full.png"));

  // 4. Open Graph / social share image (1200x630 -- standard OG ratio).
  // Full square logo centered on a canvas matching the brand background,
  // not stretched or cropped.
  const ogLogoSize = 560;
  const ogLogo = await sharp(SOURCE).resize(ogLogoSize, ogLogoSize).toBuffer();
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: BRAND_BG,
    },
  })
    .composite([{ input: ogLogo, left: Math.round((1200 - ogLogoSize) / 2), top: Math.round((630 - ogLogoSize) / 2) }])
    .png()
    .toFile(path.join(OUT_DIR, "og-image.png"));

  console.log("done -- generated favicon-16/32/48.png, apple-touch-icon.png, icon-192/512.png, logo-mark.png, logo-full.png, og-image.png in public/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
