# Stoney Point Enterprises &mdash; website

Source for the public Stoney Point Enterprises website, deployed to
[stoneypointenterprises.com](https://stoneypointenterprises.com) via
GitHub Pages.

Static site built with [Astro](https://astro.build) in fully static
output mode &mdash; no server-side rendering, no client-side framework,
no database. See [Technical approach](#technical-approach) below.

## Local development

Requires Node.js `22.12.0` or newer (see `.nvmrc`).

```bash
npm install
npm run dev
```

Serves the site locally with hot reload, typically at
`http://localhost:4321`.

> **Network note:** if `npm install` hangs, this environment may have a
> broken IPv6 route to the npm registry. Set
> `NODE_OPTIONS=--dns-result-order=ipv4first` before running npm/node
> commands to force IPv4 resolution.

## Build

```bash
npm run build
```

Outputs static files to `dist/`. Verify a clean build works from a
fresh checkout before every deploy:

```bash
rm -rf node_modules dist
npm install
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

Deployment is fully automated via GitHub Actions
(`.github/workflows/deploy.yml`): every push to `main` builds the site
and deploys it to GitHub Pages using the current supported
`actions/upload-pages-artifact` + `actions/deploy-pages` method (not
the legacy branch-based deployment).

No manual deployment steps are required once the workflow is enabled
in the repository's Pages settings (**Settings &rarr; Pages &rarr;
Build and deployment &rarr; Source: GitHub Actions**).

## Custom domain

The production domain (`stoneypointenterprises.com`) is configured via
the `public/CNAME` file, which GitHub Pages reads automatically on
deploy. Do not remove this file or the custom domain will revert to
the default `github.io` URL.

DNS must point the apex domain at GitHub Pages' IP addresses (or use
your registrar's ALIAS/ANAME record if it supports one) and enable
HTTPS enforcement in the repository's Pages settings once the
certificate is issued. See the operator runbook in the pull request
description for this repository's specific DNS record requirements,
including which existing records (email, other subdomains) must be
preserved.

## Content updates

All page content lives in `src/pages/*.astro` as plain HTML inside
Astro components &mdash; no CMS, no markdown pipeline. To edit a page,
edit its `.astro` file directly and open a pull request.

Shared layout, header, and footer: `src/layouts/BaseLayout.astro`,
`src/components/Header.astro`, `src/components/Footer.astro`.

Design tokens (colors, spacing, type): `src/styles/global.css`. All
color choices are checked against WCAG 2.1 AA contrast ratios &mdash;
if you change a color, re-verify contrast before merging (see
[Testing](#testing) below).

### Updating the logo or generated images

The favicon, header mark, and Open Graph image are all generated from
one source logo via `scripts/generate-assets.mjs` (uses `sharp`, a
dev dependency). To regenerate after a logo change:

```bash
LOGO_SOURCE_PATH=/path/to/new-logo.png npm run assets
```

This overwrites the generated files in `public/`. Review the output
(especially the favicon crop) before committing.

## Dependency updates

Dependabot is configured (`.github/dependabot.yml`) to open weekly
pull requests for both npm dependencies and GitHub Actions versions.
GitHub Actions in the deploy workflow are pinned to full commit SHAs
(not just version tags) for supply-chain integrity &mdash; Dependabot
PRs will update both the SHA and the version comment together.

To update manually:

```bash
npm outdated
npm update
npm run build   # confirm the build still succeeds
```

## Testing

```bash
npm run build
npm run preview &        # serve the built site locally
npx html-validate "dist/**/*.html"
npx linkinator http://127.0.0.1:4321 --recurse --skip "mailto:,^https://stoneypointenterprises.com"
node scripts/a11y-check.mjs       # axe-core accessibility check, all pages
node scripts/lighthouse-check.mjs # Lighthouse: performance/a11y/best-practices/SEO
node scripts/screenshots.mjs      # desktop + mobile screenshots to /tmp/spe-screenshots
```

Testing tools (`playwright`, `lighthouse`, `@axe-core/playwright`,
`html-validate`, `linkinator`) are dev dependencies, not shipped to
the deployed site.

## Technical approach

- **Astro, static output only** (`output: "static"` in
  `astro.config.mjs`) &mdash; every page is pre-rendered HTML at build
  time. No server runtime in production.
- **No client-side JavaScript framework.** The only inline `<script>`
  is a ~10-line vanilla-JS mobile-nav toggle in `Header.astro`.
- **No database, no CMS, no user accounts, no third-party analytics,
  no tracking pixels, no advertising, no remote font loading.** System
  fonts only.
- **No contact form.** Contact is a `mailto:` link.
- Sitemap and robots.txt are generated/served automatically
  (`@astrojs/sitemap` + `public/robots.txt`).

## Repository structure

```
src/
  layouts/BaseLayout.astro   # <head>, meta/OG/JSON-LD, header+footer wrapper
  components/                # Header.astro, Footer.astro
  pages/                     # one file per route
  styles/global.css          # design system (tokens, components)
scripts/
  generate-assets.mjs        # logo -> favicon/OG image generation (sharp)
  a11y-check.mjs             # axe-core accessibility test
  lighthouse-check.mjs       # Lighthouse audit
  screenshots.mjs            # desktop/mobile screenshots
public/                      # static files copied as-is (icons, robots.txt, CNAME)
.github/workflows/deploy.yml # build + deploy to GitHub Pages
.github/dependabot.yml       # weekly dependency updates
```

## License

Source code is MIT-licensed (see `LICENSE`). The Stoney Point
Enterprises name, logo, and brand assets are not covered by that
license and are not licensed for reuse.

## Security

See [`SECURITY.md`](./SECURITY.md) for how to report a security issue
with this site or repository.
