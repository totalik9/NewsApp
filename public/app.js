const feedEl = document.querySelector('#feed');
const statusEl = document.querySelector('#status');
const articleCountEl = document.querySelector('#articleCount');
const sourceCountEl = document.querySelector('#sourceCount');
const updatedAtEl = document.querySelector('#updatedAt');
const refreshTimerEl = document.querySelector('#refreshTimer');
const refreshButton = document.querySelector('#refresh');
const searchInput = document.querySelector('#search');
const sourceFilter = document.querySelector('#sourceFilter');
const displayLimit = document.querySelector('#displayLimit');
const failuresEl = document.querySelector('#failures');
const topicButtonsEl = document.querySelector('#topicButtons');

let articles = [];
let lastPayload = null;
let selectedTopic = '';
let nextRefreshAt = Date.now() + 10 * 60 * 1000;
const refreshIntervalMs = 10 * 60 * 1000;
const isLocalApiHost = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
const newsDataUrl = isLocalApiHost ? '/api/news' : 'data/news.json';
const staticMode = !isLocalApiHost;
const expandedArticles = new Set();
const articleTextCache = new Map();
const dateFormatter = new Intl.DateTimeFormat('bg-BG', {
  dateStyle: 'medium',
  timeStyle: 'short'
});
const timeFormatter = new Intl.DateTimeFormat('bg-BG', {
  hour: '2-digit',
  minute: '2-digit'
});

refreshButton.addEventListener('click', () => loadNews(true));
searchInput.addEventListener('input', render);
sourceFilter.addEventListener('change', render);
displayLimit.addEventListener('input', render);
topicButtonsEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-topic]');
  if (!button) return;

  selectedTopic = button.dataset.topic;
  render();
});
feedEl.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-expand-url]');
  if (!button) return;

  const url = button.dataset.expandUrl;
  if (expandedArticles.has(url)) {
    expandedArticles.delete(url);
    render();
    return;
  }

  expandedArticles.add(url);
  if (!articleTextCache.has(url)) {
    articleTextCache.set(url, { loading: true, text: '' });
    render();
    await loadArticleText(url);
  }

  render();
});

await loadNews(false);
setInterval(tickRefreshTimer, 1000);
tickRefreshTimer();

async function loadNews(refresh) {
  refreshButton.disabled = true;
  statusEl.textContent = refresh
    ? staticMode ? 'Checking for deployed updates...' : 'Refreshing feeds...'
    : 'Loading latest stories...';

  try {
    const response = await fetch(newsUrl(refresh), { cache: refresh ? 'reload' : 'default' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    lastPayload = await response.json();
    articles = sortArticlesByPublishedAt(lastPayload.articles || []);
    nextRefreshAt = Date.now() + refreshIntervalMs;
    populateSources(articles);
    render();
  } catch (error) {
    feedEl.innerHTML = `<div class="empty">Could not load news: ${escapeHtml(error.message)}</div>`;
    statusEl.textContent = 'News loading failed.';
  } finally {
    refreshButton.disabled = false;
  }
}

function tickRefreshTimer() {
  const remainingMs = Math.max(0, nextRefreshAt - Date.now());
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  refreshTimerEl.textContent = staticMode
    ? `Next deployed-data check in ${minutes}:${String(seconds).padStart(2, '0')}`
    : `Next refresh in ${minutes}:${String(seconds).padStart(2, '0')}`;

  if (remainingMs <= 0 && !refreshButton.disabled) {
    loadNews(true);
  }
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedSource = sourceFilter.value;
  const limit = Number.parseInt(displayLimit.value, 10);
  const filtered = articles.filter((article) => {
    const matchesSource = !selectedSource || article.source === selectedSource;
    const matchesTopic = !selectedTopic || topicLabel(article) === selectedTopic;
    const text = `${article.title} ${article.source} ${article.summary}`.toLowerCase();
    return matchesSource && matchesTopic && (!query || text.includes(query));
  });
  const visible = Number.isFinite(limit) && limit > 0 ? filtered.slice(0, limit) : filtered;

  articleCountEl.textContent = visible.length.toLocaleString('bg-BG');
  sourceCountEl.textContent = `${lastPayload?.okSourceCount || 0}/${lastPayload?.sourceCount || 0}`;
  updatedAtEl.textContent = lastPayload?.generatedAt ? dateFormatter.format(new Date(lastPayload.generatedAt)) : '-';
  statusEl.textContent = lastPayload
    ? `Sorted by published time. Showing ${visible.length.toLocaleString('bg-BG')} of ${filtered.length.toLocaleString('bg-BG')} matching, ${articles.length.toLocaleString('bg-BG')} crawled. Fetched in ${(lastPayload.elapsedMs / 1000).toFixed(1)}s.`
    : 'No fetch has completed yet.';

  feedEl.innerHTML = visible.length
    ? visible.map(renderArticle).join('')
    : '<div class="empty">No articles match the current filters.</div>';

  renderTopicButtons();
  renderFailures(lastPayload?.failedSources || []);
}

function populateSources(nextArticles) {
  const current = sourceFilter.value;
  const sources = [...new Set(nextArticles.map((article) => article.source))].sort((a, b) => a.localeCompare(b, 'bg'));

  sourceFilter.innerHTML = '<option value="">All sources</option>' + sources
    .map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`)
    .join('');

  if (sources.includes(current)) {
    sourceFilter.value = current;
  }
}

function renderArticle(article) {
  const date = article.publishedAt ? new Date(article.publishedAt) : null;
  const time = date && !Number.isNaN(date.getTime()) ? timeFormatter.format(date) : 'No time';
  const fullDate = date && !Number.isNaN(date.getTime()) ? dateFormatter.format(date) : 'Unknown date';
  const source = escapeHtml(article.source);
  const category = topicLabel(article);

  return `
    <article class="article">
      <div>
        <div class="headline-row">
          <h2><a href="${escapeAttr(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a></h2>
          <time datetime="${escapeAttr(article.publishedAt || '')}" title="${escapeAttr(fullDate)}">${escapeHtml(time)}</time>
        </div>
        <div class="meta">
          <span>${source}</span>
          ${category ? `<span>${escapeHtml(category)}</span>` : ''}
          <button class="expand-button" type="button" data-expand-url="${escapeAttr(article.url)}">${expandedArticles.has(article.url) ? 'Collapse' : 'Expand'}</button>
        </div>
        ${article.summary ? `<div class="summary-text">${escapeHtml(article.summary)}</div>` : ''}
        ${renderExpandedArticle(article.url)}
      </div>
    </article>
  `;
}

async function loadArticleText(url) {
  if (staticMode) {
    articleTextCache.set(url, {
      loading: false,
      text: 'Full article extraction is available in the local server version. Open the source link to read the article.'
    });
    return;
  }

  try {
    const response = await fetch(`/api/article?sentences=10&url=${encodeURIComponent(url)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);

    articleTextCache.set(url, {
      loading: false,
      text: payload.text || 'No article text found.',
      sentenceCount: payload.sentenceCount || 0
    });
  } catch (error) {
    articleTextCache.set(url, {
      loading: false,
      error: error.message
    });
  }
}

function newsUrl(refresh) {
  if (staticMode) return `${newsDataUrl}${refresh ? `?t=${Date.now()}` : ''}`;
  return `${newsDataUrl}${refresh ? '?refresh=1' : ''}`;
}

function sortArticlesByPublishedAt(nextArticles) {
  return [...nextArticles]
    .filter((article) => article.publishedAt && !Number.isNaN(Date.parse(article.publishedAt)))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

function renderExpandedArticle(url) {
  if (!expandedArticles.has(url)) return '';

  const detail = articleTextCache.get(url);
  if (!detail || detail.loading) {
    return '<div class="article-detail">Loading article text...</div>';
  }

  if (detail.error) {
    return `<div class="article-detail error">Could not load article text: ${escapeHtml(detail.error)}</div>`;
  }

  return `<div class="article-detail">${escapeHtml(detail.text)}</div>`;
}

function renderTopicButtons() {
  const counts = new Map();

  for (const article of articles) {
    const topic = topicLabel(article);
    if (!topic) continue;
    counts.set(topic, (counts.get(topic) || 0) + 1);
  }

  const topTopics = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'bg'))
    .slice(0, 5);

  topicButtonsEl.innerHTML = [
    `<button type="button" data-topic="" class="${selectedTopic ? '' : 'active'}">All topics</button>`,
    ...topTopics.map(([topic, count]) => {
      const active = selectedTopic === topic ? ' active' : '';
      return `<button type="button" data-topic="${escapeAttr(topic)}" class="${active}">${escapeHtml(topic)} <span>${count.toLocaleString('bg-BG')}</span></button>`;
    })
  ].join('');
}

function topicLabel(article) {
  return cleanTopic(article.category || article.sourceCategory || 'Other');
}

function cleanTopic(value) {
  const topic = String(value || '').trim();
  if (!topic || topic.toLowerCase() === 'no') return 'Other';
  return topic;
}

function renderFailures(failures) {
  failuresEl.hidden = failures.length === 0;
  if (!failures.length) {
    failuresEl.innerHTML = '';
    return;
  }

  failuresEl.innerHTML = `
    <details>
      <summary>${failures.length} sources did not respond</summary>
      <ul>
        ${failures.map((failure) => `<li>${escapeHtml(failure.name)}: ${escapeHtml(failure.error)}</li>`).join('')}
      </ul>
    </details>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
