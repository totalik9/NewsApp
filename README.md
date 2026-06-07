# Bulgarian News

A fast news dashboard for scanning current Bulgarian headlines from 52 media sources in one chronological feed.

The project is built around one core rule: articles are ordered by the publication time reported by the original source, with the newest items always shown first. The crawler rejects articles without a reliable publication timestamp, enriches missing feed dates from article-page metadata when possible, and verifies the final dataset before deployment.

Live site: https://totalik9.github.io/NewsApp/

## What It Does

- Aggregates headlines from Bulgarian national, regional, business, technology, sports, agency, TV, and radio sources.
- Sorts every article by original publication time, newest first.
- Filters out untimestamped, future-dated, malformed, or failed-source items.
- Supports search, source filtering, topic filtering, visible article limits, and manual refresh.
- Expands article text on demand in the local server version.
- Publishes as a static GitHub Pages web app with scheduled feed refreshes.

## Architecture

The app has two runtime modes:

- Local server mode: Node/Express serves the frontend and exposes live API endpoints.
- GitHub Pages mode: GitHub Actions runs the crawler, writes `public/data/news.json`, verifies it, and deploys `public/` as a static site.

The browser uses the local API on `localhost` and static JSON on GitHub Pages.

## Timestamp Integrity

Publication time is the primary ordering contract.

The backend:

- Parses RSS and Atom dates from source feeds.
- Falls back to article-page metadata such as `article:published_time`, `datePublished`, JSON-LD, and `<time datetime>`.
- Interprets timezone-less Bulgarian timestamps as Sofia time.
- Rejects articles with missing, invalid, or future timestamps.
- Sorts all accepted articles by `publishedAt` descending.

The frontend also re-sorts the received payload before rendering, so cached or static data cannot display out of order.

`npm run verify:data` fails if:

- Any article is missing a valid timestamp.
- Any article is dated in the future.
- Any article appears out of newest-first order.

If a source fails during a build, the verifier prints a warning and the app publishes the remaining valid timestamped articles. Failed sources are included in the generated dataset so the UI can report them.

## Local Development

Requirements:

- Node.js 20 or newer
- npm

Install dependencies:

```powershell
npm install
```

Run the local app:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Static Build

Generate the static GitHub Pages dataset locally:

```powershell
npm run build:static
npm run verify:data
```

The generated file is written to:

```text
public/data/news.json
```

That file is ignored by git because GitHub Actions regenerates it during deployment.

## Scripts

```text
npm run dev           Start the local Express app
npm start             Start the local Express app
npm run check         Run JavaScript syntax checks
npm run build:static  Generate public/data/news.json
npm run verify:data   Validate timestamp integrity and warn about failed sources
```

## API

Local server endpoints:

```text
GET /api/news
GET /api/news?refresh=1
GET /api/sources
GET /api/article?url=<article-url>&sentences=10
```

`/api/article` only expands articles already present in the current news cache.

## Deployment

Deployment is handled by GitHub Actions in `.github/workflows/pages.yml`.

The workflow:

1. Installs dependencies with `npm ci`.
2. Runs `npm run build:static`.
3. Runs `npm run verify:data`.
4. Uploads the `public/` folder as a GitHub Pages artifact.
5. Deploys the site.

It runs on:

- Pushes to `main` or `master`
- A 30-minute schedule
- Manual workflow dispatch

To enable the live site in GitHub:

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Set **Build and deployment > Source** to **GitHub Actions**.
4. Push to `master` or run **Deploy GitHub Pages** from the **Actions** tab.

## Project Structure

```text
.github/workflows/
  pages.yml              GitHub Pages deployment workflow
public/
  app.js                 Browser app, filtering, rendering, static/API loading
  index.html             Main HTML shell
  styles.css             UI styles
scripts/
  build-static-data.js   Static data generator for GitHub Pages
  verify-news-data.js    Dataset integrity check
src/
  sources.js             News source registry
server.js                Express API, crawler, feed parsing, timestamp handling
```

## Notes

Some publishers change RSS URLs, block automated access, omit timestamps, or return HTML from old feed paths. The app treats those as data-quality issues: sources must produce timestamped articles to appear in the feed, and the deployment verifier prevents malformed or incorrectly ordered articles from going live.
