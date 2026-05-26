# Bulgarian News App

A local news timeline that fetches RSS/Atom feeds from Bulgarian news sources and lists articles by published time.

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

The app uses publisher RSS/Atom feeds where available, falls back to homepage feed discovery, and can scrape homepage headlines for sources that do not expose a feed. It does not cap articles per source by default; use the "Show all" field in the UI to limit how many matching articles are displayed. Some sites may block automated requests, change feed URLs, or omit timestamps; those sources are reported in the UI under failed sources.
