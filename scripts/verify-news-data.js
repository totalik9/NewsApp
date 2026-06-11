import { readFile } from 'node:fs/promises';

const payload = JSON.parse(await readFile('public/data/news.json', 'utf8'));
const articles = payload.articles || [];
const errors = [];
const seenUrls = new Set();
const maxArticleAgeDays = Number(payload.maxArticleAgeDays || process.env.MAX_ARTICLE_AGE_DAYS || 30);
const maxArticleAgeMs = maxArticleAgeDays * 24 * 60 * 60 * 1000;

if (!articles.length) {
  errors.push('No articles found');
}

for (let index = 0; index < articles.length; index += 1) {
  const article = articles[index];
  const publishedAt = Date.parse(article.publishedAt);

  if (!article.title || !article.url) {
    errors.push(`Article ${index} is missing title or URL`);
  }

  if (!Number.isFinite(publishedAt)) {
    errors.push(`Article ${index} has invalid publishedAt: ${article.publishedAt}`);
  }

  if (publishedAt > Date.now() + 10 * 60 * 1000) {
    errors.push(`Article ${index} is dated in the future: ${article.publishedAt}`);
  }

  if (Number.isFinite(maxArticleAgeMs) && maxArticleAgeMs > 0 && Date.now() - publishedAt > maxArticleAgeMs) {
    errors.push(`Article ${index} is older than ${maxArticleAgeDays} days: ${article.publishedAt}`);
  }

  if (index > 0 && publishedAt > Date.parse(articles[index - 1].publishedAt)) {
    errors.push(`Article ${index} is newer than article ${index - 1}`);
  }

  const urlKey = normalizeArticleUrl(article.url);
  if (!urlKey) {
    errors.push(`Article ${index} has invalid URL: ${article.url}`);
  } else if (seenUrls.has(urlKey)) {
    errors.push(`Article ${index} has duplicate URL: ${article.url}`);
  } else {
    seenUrls.add(urlKey);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

if (payload.failedSources?.length) {
  console.warn(`${payload.failedSources.length} sources failed during this build`);
  for (const source of payload.failedSources) {
    console.warn(`- ${source.name}: ${source.error}`);
  }
}

console.log(`Verified ${articles.length} articles from ${payload.okSourceCount}/${payload.sourceCount} sources`);

function normalizeArticleUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    url.search = '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch (_error) {
    return '';
  }
}
