import { readFile } from 'node:fs/promises';

const payload = JSON.parse(await readFile('public/data/news.json', 'utf8'));
const articles = payload.articles || [];
const errors = [];

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

  if (index > 0 && publishedAt > Date.parse(articles[index - 1].publishedAt)) {
    errors.push(`Article ${index} is newer than article ${index - 1}`);
  }
}

if (payload.failedSources?.length) {
  errors.push(`${payload.failedSources.length} sources failed`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Verified ${articles.length} articles from ${payload.okSourceCount}/${payload.sourceCount} sources`);
