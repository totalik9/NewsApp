# Bulgarian News

A compact dashboard for scanning current Bulgarian headlines from many sources in one chronological feed.

Live site: https://totalik9.github.io/NewsApp/

The app is intentionally simple: it collects source-provided news items, keeps only articles with reliable timestamps, removes stale and duplicate entries, and renders the newest stories first.

## Features

- Aggregates Bulgarian national, regional, business, technology, sports, agency, TV, and radio sources.
- Sorts every article by the original publication time, newest first.
- Filters out missing, invalid, future-dated, stale, and duplicate articles.
- Shows source-provided summaries without AI rewriting or extra article fetching.
- Supports search, source filtering, topic filtering, article limits, and manual refresh.
- Expands article text on demand in local server mode only.
- Publishes as a static GitHub Pages site with scheduled data refreshes.

## How It Works

The project has two runtime modes.

### Local Server Mode

`server.js` runs an Express app that:

- serves the frontend from `public/`
- fetches RSS/Atom feeds and selected homepage fallbacks
- normalizes articles into a common JSON shape
- exposes API endpoints for live data
- can fetch article text only when a user clicks Expand

Run it locally with:

```powershell
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

If port `3000` is busy, set a different port:

```powershell
$env:PORT = "3001"
npm run dev
```

### Static GitHub Pages Mode

GitHub Actions runs the crawler, writes `public/data/news.json`, verifies the data, and deploys the `public/` folder to GitHub Pages.

In static mode the browser reads:

```text
public/data/news.json
```

The static site does not fetch full article text. It only displays feed data and source-provided summaries.

## Data Quality Rules

The app treats publication time as the main ordering contract.

Articles are accepted only when they have:

- a title
- a URL
- a valid `publishedAt` timestamp
- a timestamp that is not in the future
- a timestamp inside the configured freshness window

By default, articles older than `30` days are filtered out. Override that with:

```powershell
$env:MAX_ARTICLE_AGE_DAYS = "14"
npm run build:static
```

Duplicate filtering removes repeated articles by:

- normalized URL
- same-source normalized title

Generated payloads also include diagnostics:

- `sourceDiagnostics`
- `failedSources`
- `staleArticleCount`
- `duplicateArticleCount`
- `okSourceCount`

These are useful when a publisher changes a feed URL, blocks automated access, or stops providing usable timestamps.

## Summaries

The main feed uses source-provided RSS/Atom summaries.

This is deliberate. The app does not fetch every article page just to create longer previews, because that would make builds slower and increase the chance of publishers blocking the crawler. Small summaries usually mean the source published a short feed description.

Local server mode still supports on-demand expansion through `/api/article`, but only after a user clicks Expand and only for URLs already present in the current news cache.

## API

Local server endpoints:

```text
GET /api/news
GET /api/news?refresh=1
GET /api/sources
GET /api/article?url=<article-url>&sentences=10
```

`/api/article` rejects URLs that are not already in the current news list and rejects unexpected redirect hosts.

## Scripts

```text
npm run dev           Start the local Express app
npm start             Start the local Express app
npm run check         Run JavaScript syntax checks
npm run build:static  Generate public/data/news.json
npm run verify:data   Validate generated news data
```

Recommended local validation:

```powershell
npm run check
npm run build:static
npm run verify:data
```

## Windows Portable Build

The repository includes a small Windows launcher:

```text
NewsApp.exe
```

The launcher finds Node.js, starts `server.js`, selects an available local port, and opens the app in the browser.

To rebuild the portable package:

```powershell
.\build-exe.ps1
```

The output is written to:

```text
dist/NewsApp/
```

## Deployment

Deployment is handled by:

```text
.github/workflows/pages.yml
```

The workflow:

1. Checks out the repo.
2. Installs dependencies with `npm ci`.
3. Runs `npm run build:static`.
4. Runs `npm run verify:data`.
5. Uploads `public/` as a GitHub Pages artifact.
6. Deploys the site.

It runs on:

- pushes to `main` or `master`
- scheduled refreshes
- manual workflow dispatch

## Project Structure

```text
.github/workflows/
  pages.yml              GitHub Pages deployment workflow

public/
  index.html             Main HTML shell
  app.js                 Browser app and filtering UI
  styles.css             Compact dashboard styling
  data/news.json         Generated static dataset

scripts/
  build-static-data.js   Builds public/data/news.json
  verify-news-data.js    Validates generated article data

src/
  sources.js             News source registry

tools/
  NewsAppLauncher.cs     Windows launcher source

server.js                Express API, crawler, parser, quality rules
build-exe.ps1            Portable Windows build script
```

## Notes

Some publishers block automated access, change feed paths, omit timestamps, or publish very short feed summaries. The app handles those as data-quality issues rather than trying to guess. If a source cannot provide valid timestamped articles, it is reported in diagnostics and the rest of the feed still publishes.
