import express from 'express';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { sources } from './src/sources.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const cacheMs = Number(process.env.CACHE_MS || 10 * 60 * 1000);
const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 9000);
const futureToleranceMs = 10 * 60 * 1000;

let cache = {
  createdAt: 0,
  payload: null
};
const articleTextCache = new Map();

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '#cdata',
  trimValues: true
});

app.use(express.static('public', {
  extensions: ['html']
}));

app.get('/api/sources', (_req, res) => {
  res.json({
    count: sources.length,
    sources: sources.map(({ name, homepage, feed, category }) => ({ name, homepage, feed, category }))
  });
});

app.get('/api/news', async (req, res) => {
  const refresh = req.query.refresh === '1';

  if (!refresh && cache.payload && Date.now() - cache.createdAt < cacheMs) {
    res.json(cache.payload);
    return;
  }

  const payload = await buildNewsPayload();

  cache = {
    createdAt: Date.now(),
    payload
  };

  res.json(payload);
});

app.get('/api/article', async (req, res) => {
  const url = String(req.query.url || '');
  const sentenceLimit = clampNumber(Number(req.query.sentences || 10), 1, 10);

  if (!isCachedArticleUrl(url)) {
    res.status(400).json({ error: 'Article URL is not in the current news list' });
    return;
  }

  if (articleTextCache.has(url)) {
    res.json(articleTextCache.get(url));
    return;
  }

  try {
    const startedAt = Date.now();
    const html = await fetchText(url);
    const sentences = extractArticleSentences(html).slice(0, sentenceLimit);
    const payload = {
      url,
      sentenceCount: sentences.length,
      elapsedMs: Date.now() - startedAt,
      text: sentences.join(' ')
    };

    articleTextCache.set(url, payload);
    res.json(payload);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => {
    console.log(`Bulgarian news app running at http://localhost:${port}`);
  });
}

export async function buildNewsPayload() {
  const startedAt = Date.now();
  const results = await fetchAllSources();
  const articles = results
    .flatMap((result) => result.articles)
    .filter((article) => article.title && article.url && isReliablePublishedAt(article.publishedAt))
    .sort(comparePublishedAtDesc);

  return {
    generatedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    sourceCount: sources.length,
    okSourceCount: results.filter((result) => result.ok).length,
    failedSources: results
      .filter((result) => !result.ok)
      .map(({ source, error }) => ({ name: source.name, homepage: source.homepage, feed: source.feed, error })),
    articles
  };
}

async function fetchAllSources() {
  const queue = [...sources];
  const workers = Array.from({ length: 8 }, async () => {
    const results = [];

    while (queue.length) {
      const source = queue.shift();
      results.push(await fetchSource(source));
    }

    return results;
  });

  return (await Promise.all(workers)).flat();
}

async function fetchSource(source) {
  try {
    const { feedUrl, articles } = await loadSourceArticles(source);
    const timestampedArticles = await ensurePublishedTimes(articles);
    if (!timestampedArticles.length) {
      throw new Error('No usable timestamped articles found');
    }

    return {
      ok: true,
      source,
      articles: timestampedArticles
    };
  } catch (error) {
    return {
      ok: false,
      source,
      error: error.message,
      articles: []
    };
  }
}

async function ensurePublishedTimes(articles) {
  const timestamped = [];
  const missing = [];

  for (const article of articles) {
    if (isReliablePublishedAt(article.publishedAt)) {
      timestamped.push(article);
    } else {
      missing.push(article);
    }
  }

  const enriched = await mapWithConcurrency(missing, 10, enrichPublishedTime);
  return [...timestamped, ...enriched.filter((article) => isReliablePublishedAt(article.publishedAt))];
}

async function enrichPublishedTime(article) {
  try {
    const html = await fetchText(article.url);
    const publishedAt = extractPublishedAtFromHtml(html);
    return {
      ...article,
      publishedAt
    };
  } catch (_error) {
    return article;
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    const results = [];

    while (queue.length) {
      const item = queue.shift();
      results.push(await mapper(item));
    }

    return results;
  });

  return (await Promise.all(workers)).flat();
}

async function loadSourceArticles(source) {
  const candidates = [];

  if (source.feed) {
    candidates.push(source.feed);
  }

  const discovered = await discoverFeed(source.homepage).catch(() => null);
  if (discovered && !candidates.includes(discovered)) {
    candidates.push(discovered);
  }

  if (!candidates.length) {
    const html = await fetchText(source.homepage);
    return {
      feedUrl: source.homepage,
      articles: scrapeHomepageArticles(html, source)
    };
  }

  const errors = [];
  for (const feedUrl of candidates) {
    try {
      const xml = await fetchText(feedUrl);
      const parsed = parser.parse(xml);
      const articles = parseFeed(parsed, source, feedUrl);
      if (!articles.length) {
        throw new Error('No feed items found');
      }

      return {
        feedUrl,
        articles
      };
    } catch (error) {
      errors.push(`${feedUrl}: ${error.message}`);
    }
  }

  const html = await fetchText(source.homepage);
  const articles = scrapeHomepageArticles(html, source);
  if (articles.length) {
    return {
      feedUrl: source.homepage,
      articles
    };
  }

  throw new Error(errors.join('; '));
}

async function discoverFeed(homepage) {
  const html = await fetchText(homepage);
  const matches = [...html.matchAll(/<link\b[^>]*>/gi)];

  for (const [tag] of matches) {
    const type = getAttr(tag, 'type') || '';
    const rel = getAttr(tag, 'rel') || '';
    const href = getAttr(tag, 'href');

    if (!href) continue;
    if (!/alternate/i.test(rel)) continue;
    if (!/(rss|atom|xml)/i.test(type + href)) continue;

    return new URL(href, homepage).toString();
  }

  return null;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5',
        'user-agent': 'BulgarianNewsAggregator/1.0 (+http://localhost)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    if (isBlockedPage(text)) {
      throw new Error('Site blocked automated access');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function parseFeed(parsed, source, feedUrl) {
  if (parsed.rss?.channel) {
    const channel = parsed.rss.channel;
    return asArray(channel.item).map((item) => normalizeArticle({
      source,
      feedUrl,
      title: textValue(item.title),
      url: textValue(item.link) || textValue(item.guid),
      publishedAt: parseDate(item.pubDate || item['dc:date'] || item.date),
      summary: textValue(item.description || item['content:encoded']),
      category: textValue(asArray(item.category)[0])
    }));
  }

  if (parsed.feed) {
    return asArray(parsed.feed.entry).map((entry) => normalizeArticle({
      source,
      feedUrl,
      title: textValue(entry.title),
      url: atomLink(entry.link),
      publishedAt: parseDate(entry.published || entry.updated),
      summary: textValue(entry.summary || entry.content),
      category: textValue(asArray(entry.category)[0]?.['@_term'] || asArray(entry.category)[0])
    }));
  }

  return [];
}

function normalizeArticle({ source, feedUrl, title, url, publishedAt, summary, category }) {
  const absoluteUrl = url ? new URL(url, source.homepage).toString() : '';

  return {
    id: `${source.name}:${absoluteUrl || title}`,
    title: cleanText(title),
    url: absoluteUrl,
    publishedAt,
    source: source.name,
    sourceHomepage: source.homepage,
    sourceCategory: source.category,
    feedUrl,
    category: cleanText(category),
    summary: cleanText(stripHtml(summary)).slice(0, 280)
  };
}

function atomLink(link) {
  const links = asArray(link);
  const alternate = links.find((candidate) => candidate?.['@_rel'] === 'alternate') || links[0];
  return typeof alternate === 'string' ? alternate : alternate?.['@_href'];
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return value['#cdata'] || value['#text'] || '';
}

function parseDate(value) {
  const raw = textValue(value);
  if (!raw) return null;

  const date = parseDateValue(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseDateValue(value) {
  const raw = cleanText(decodeEntities(value));
  if (!raw) return new Date(Number.NaN);

  const isoLikeLocal = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (isoLikeLocal) {
    return dateInSofia(
      Number(isoLikeLocal[1]),
      Number(isoLikeLocal[2]),
      Number(isoLikeLocal[3]),
      Number(isoLikeLocal[4]),
      Number(isoLikeLocal[5]),
      Number(isoLikeLocal[6] || 0)
    );
  }

  const bgDate = raw.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\s*(?:г\.|\/)?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?/i);
  if (bgDate) {
    const year = Number(bgDate[3].length === 2 ? `20${bgDate[3]}` : bgDate[3]);
    return dateInSofia(
      year,
      Number(bgDate[2]),
      Number(bgDate[1]),
      Number(bgDate[4] || 0),
      Number(bgDate[5] || 0),
      Number(bgDate[6] || 0)
    );
  }

  return new Date(raw);
}

function dateInSofia(year, month, day, hour, minute, second = 0) {
  const utc = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetHours = isSofiaDst(year, month, day) ? 3 : 2;
  return new Date(utc - offsetHours * 60 * 60 * 1000);
}

function isSofiaDst(year, month, day) {
  const date = Date.UTC(year, month - 1, day);
  return date >= lastSundayUtc(year, 3) && date < lastSundayUtc(year, 10);
}

function lastSundayUtc(year, month) {
  const date = new Date(Date.UTC(year, month, 0));
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isReliablePublishedAt(value) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= Date.now() + futureToleranceMs;
}

function comparePublishedAtDesc(a, b) {
  const diff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  if (diff) return diff;
  return `${a.source}:${a.title}`.localeCompare(`${b.source}:${b.title}`, 'bg');
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ');
}

function isCachedArticleUrl(url) {
  if (!cache.payload?.articles) return false;
  return cache.payload.articles.some((article) => article.url === url);
}

function extractArticleSentences(html) {
  const structuredText = extractStructuredArticleText(html);
  if (structuredText) {
    return splitSentences(structuredText).filter((sentence) => sentence.length > 25 && !isBoilerplateText(sentence));
  }

  const mainHtml = firstMatch(html, /<article\b[^>]*>([\s\S]*?)<\/article>/i)
    || firstMatch(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i)
    || firstMatch(html, /<body\b[^>]*>([\s\S]*?)<\/body>/i)
    || html;
  const cleanHtml = mainHtml
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<(nav|header|footer|aside|form)\b[\s\S]*?<\/\1>/gi, ' ');
  const paragraphs = [...cleanHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => cleanText(decodeEntities(stripHtml(match[1]))))
    .filter((text) => text.length > 45 && !isBoilerplateText(text));
  const text = paragraphs.length
    ? paragraphs.join(' ')
    : cleanText(decodeEntities(stripHtml(cleanHtml)));

  return splitSentences(text).filter((sentence) => sentence.length > 25 && !isBoilerplateText(sentence));
}

function extractStructuredArticleText(html) {
  const jsonLdText = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => {
      try {
        return JSON.parse(decodeEntities(match[1]));
      } catch (_error) {
        return null;
      }
    })
    .flatMap((value) => extractJsonLdText(value))
    .find((text) => text.length > 80);

  if (jsonLdText) return jsonLdText;

  const metaDescription = getMetaContent(html, 'description')
    || getMetaPropertyContent(html, 'og:description')
    || getMetaPropertyContent(html, 'twitter:description');

  return cleanText(decodeEntities(metaDescription));
}

function extractPublishedAtFromHtml(html) {
  const metaDate = getMetaPropertyContent(html, 'article:published_time')
    || getMetaPropertyContent(html, 'og:published_time')
    || getMetaContent(html, 'pubdate')
    || getMetaContent(html, 'publishdate')
    || getMetaContent(html, 'date')
    || getItempropContent(html, 'datePublished')
    || getItempropContent(html, 'dateCreated');

  const parsedMetaDate = parseDate(metaDate);
  if (parsedMetaDate) return parsedMetaDate;

  const jsonLdDate = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => {
      try {
        return JSON.parse(decodeEntities(match[1]));
      } catch (_error) {
        return null;
      }
    })
    .flatMap((value) => extractJsonLdDates(value))
    .map(parseDate)
    .find(Boolean);

  return jsonLdDate || parseDate(getTimeDateTime(html)) || null;
}

function extractJsonLdDates(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => extractJsonLdDates(item));

  if (typeof value === 'object') {
    const graph = value['@graph'] ? extractJsonLdDates(value['@graph']) : [];
    return [...graph, value.datePublished, value.dateCreated, value.dateModified].filter(Boolean);
  }

  return [];
}

function extractJsonLdText(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => extractJsonLdText(item));

  if (typeof value === 'object') {
    const graph = value['@graph'] ? extractJsonLdText(value['@graph']) : [];
    const articleText = cleanText(decodeEntities(value.articleBody || value.description || ''));
    return [...graph, articleText].filter(Boolean);
  }

  return [];
}

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?…])\s+(?=[A-ZА-Я0-9"„])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function isBoilerplateText(text) {
  return /(cookies|cookie|gdpr|абонирай|абонамент|реклама|прочети още|виж още|сподели|facebook|instagram|twitter|newsletter|вход|регистрация)/i.test(text);
}

function firstMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : '';
}

function getMetaContent(html, name) {
  const match = html.match(new RegExp(`<meta\\b(?=[^>]*\\bname=["']${escapeRegExp(name)}["'])[^>]*\\bcontent=["']([^"']*)["'][^>]*>`, 'i'));
  return match ? match[1] : '';
}

function getMetaPropertyContent(html, property) {
  const match = html.match(new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${escapeRegExp(property)}["'])[^>]*\\bcontent=["']([^"']*)["'][^>]*>`, 'i'));
  return match ? match[1] : '';
}

function getItempropContent(html, itemprop) {
  const match = html.match(new RegExp(`<meta\\b(?=[^>]*\\bitemprop=["']${escapeRegExp(itemprop)}["'])[^>]*\\bcontent=["']([^"']*)["'][^>]*>`, 'i'));
  return match ? match[1] : '';
}

function getTimeDateTime(html) {
  const match = html.match(/<time\b[^>]*\bdatetime=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : '';
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isBlockedPage(text) {
  return /enable javascript and cookies to continue|just a moment|cf_chl_|challenge-platform/i.test(text);
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_match, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return max;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match ? match[1] : null;
}

function scrapeHomepageArticles(html, source) {
  const seen = new Set();
  const articles = [];
  const anchorPattern = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const href = match[1];
    const title = cleanText(stripHtml(match[2]));

    if (!isLikelyArticle(title, href, source)) continue;

    const url = new URL(href, source.homepage).toString();
    if (!url.startsWith(source.homepage) || seen.has(url)) continue;

    seen.add(url);
    articles.push(normalizeArticle({
      source,
      feedUrl: source.homepage,
      title,
      url,
      publishedAt: parseScrapedDate(html, match.index || 0, title),
      summary: '',
      category: source.category
    }));
  }

  return articles;
}

function isLikelyArticle(title, href, source) {
  if (title.length < 24 || title.length > 180) return false;
  if (/^(начало|контакти|реклама|екип|за нас|условия|политика|още)$/i.test(title)) return false;
  if (isBlockedArticlePath(href, source)) return false;
  return /\/[^/#?]+\/[^/#?]+/.test(href) || /\d{4,}/.test(href);
}

function isBlockedArticlePath(href, source) {
  const path = href.toLowerCase();
  if (/\/(page|filmi|weather|horoscope|games|mail|catalog|promo|privacy|terms)\b/.test(path)) return true;
  if (source.name === 'Dir' && !/^https?:\/\/dir\.bg\/|^\//.test(href)) return true;
  return false;
}

function parseScrapedDate(html, index, title) {
  const titleDate = title.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  const titleShortDate = title.match(/(\d{1,2})\.(\d{1,2})\.(\d{2})/);
  const nearby = html.slice(index, index + 600);
  const timeOnly = findValidTime(nearby);

  if (titleDate && timeOnly) {
    return toIsoDate(titleDate[3], titleDate[2], titleDate[1], timeOnly.hour, timeOnly.minute);
  }

  if (titleDate) {
    return toIsoDate(titleDate[3], titleDate[2], titleDate[1], 0, 0);
  }

  if (titleShortDate && timeOnly) {
    return toIsoDate(`20${titleShortDate[3]}`, titleShortDate[2], titleShortDate[1], timeOnly.hour, timeOnly.minute);
  }

  if (titleShortDate) {
    return toIsoDate(`20${titleShortDate[3]}`, titleShortDate[2], titleShortDate[1], 0, 0);
  }

  const fullDate = nearby.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (fullDate) {
    return toIsoDate(fullDate[3], fullDate[2], fullDate[1], fullDate[4], fullDate[5]);
  }

  const shortDate = nearby.match(/(\d{1,2})\.(\d{1,2})\.(\d{2})\s+(\d{1,2}):(\d{2})/);
  if (shortDate) {
    return toIsoDate(`20${shortDate[3]}`, shortDate[2], shortDate[1], shortDate[4], shortDate[5]);
  }

  return null;
}

function findValidTime(text) {
  for (const match of text.matchAll(/\b(\d{1,2}):(\d{2})\b/g)) {
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
  }

  return null;
}

function toIsoDate(year, month, day, hour, minute) {
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
