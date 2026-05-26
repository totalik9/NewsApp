# Bulgarian News App

Bulgarian News App is a lightweight local web app that aggregates news from Bulgarian media sources and presents them in a single chronological timeline. It is built for fast scanning: the newest articles are shown first, older articles appear lower in the list, and the interface includes source filtering, search, popular topic filters, a visible article limit, and on-demand article expansion.

The app currently tracks 52 Bulgarian news sources. It fetches publisher RSS/Atom feeds where available, discovers feeds from source homepages when possible, and falls back to homepage headline extraction for sources that do not expose a reliable feed. The backend normalizes article titles, URLs, publication timestamps, source names, categories, and summaries, then sorts everything by published time before sending it to the browser.

## Features

- Aggregates Bulgarian news from 52 configured sources.
- Sorts articles by publication time, newest first.
- Shows up to 1000 articles by default while still crawling all available feed items.
- Refreshes automatically every 10 minutes.
- Supports manual refresh.
- Provides source filtering, text search, and top-topic buttons.
- Includes an Expand button that fetches article text only when requested.
- Caches aggregated news responses to reduce repeated network work.
- Reports blocked or failing sources instead of showing broken articles.

## How It Works

The Node/Express server exposes a small API and serves the static frontend.

1. The server loads the source list from `src/sources.js`.
2. `/api/news` fetches RSS/Atom feeds in parallel.
3. If a feed is missing, the server tries to discover one from the homepage.
4. If no feed exists, the server attempts lightweight homepage headline extraction.
5. Articles are normalized into a common shape and sorted by `publishedAt`.
6. The browser renders the timeline and applies client-side filters.
7. When Expand is clicked, `/api/article` fetches that one article page and extracts the first sentences from article markup, JSON-LD, meta descriptions, or paragraph text.

This design avoids downloading full article pages during every refresh. Full text is fetched only for articles the user expands, keeping the regular 10-minute refresh fast and polite to publisher sites.

## Run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## API

- `GET /api/news` returns cached aggregated articles.
- `GET /api/news?refresh=1` forces a fresh fetch.
- `GET /api/sources` lists the configured sources.
- `GET /api/article?url=<article-url>&sentences=10` extracts text for one article that is already present in the current news cache.

## Project Structure

```text
public/
  app.js        Browser-side timeline, filters, refresh timer, and expand behavior
  index.html    Main page markup
  styles.css    Compact Verdana-based UI styling
src/
  sources.js    Bulgarian news source registry
server.js       Express API, RSS parsing, feed discovery, scraping, caching
```

## Notes

The app uses publisher RSS/Atom feeds where available, falls back to homepage feed discovery, and can scrape homepage headlines for sources that do not expose a feed. It does not cap articles per source by default; use the "Show all" field in the UI to limit how many matching articles are displayed. Some sites may block automated requests, change feed URLs, or omit timestamps; those sources are reported in the UI under failed sources.
