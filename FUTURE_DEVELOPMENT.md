# Future Development

Ideas and source candidates for improving Bulgarian News later without bloating the app.

The main rule stays the same: add sources only if they provide useful articles with reliable timestamps. Test sources in small batches, run the crawler, inspect diagnostics, and keep only sources that improve the feed.

## Source Testing Rules

Before adding a source permanently:

1. Add it to `src/sources.js`.
2. Run `npm run build:static`.
3. Run `npm run verify:data`.
4. Check `sourceDiagnostics` in `public/data/news.json`.
5. Keep the source only if it has reliable timestamps, usable titles, and acceptable summaries.

Avoid adding sources that mostly produce broken dates, duplicate articles, aggressive clickbait, or crawler blocks.

## Quality News Candidates

These are Bulgarian sources worth testing for broader coverage.

| Source | Category | Notes | Feed candidate |
|---|---|---|---|
| Svobodna Evropa | public-interest | Strong politics, judiciary, corruption, investigations | Needs discovery |
| Sega | general | Established newspaper with politics and public affairs coverage | Needs discovery |
| BNR Novini | public-radio | Bulgarian-language public radio news; separate from current Radio Bulgaria EN source | Needs discovery |
| bTV Novinite | tv | Major mainstream newsroom missing from current list | Needs discovery |
| BIRD.bg | investigative | Investigative/data journalism | `https://bird.bg/feed/` |
| Bivol | investigative | Investigative anti-corruption journalism | `https://bivol.bg/feed` |
| Toest | analysis | Long-form commentary and analysis, lower volume | `https://www.toest.bg/rss/` |
| DW Bulgaria | international | Bulgaria/EU analysis and reporting | Needs discovery |
| Euractiv Bulgaria | eu-policy | EU, regulation, politics, economy | Needs discovery |
| Lex.bg News | legal | Courts, judiciary, legal profession, institutions | Needs discovery |
| Factcheck.bg | fact-checking | Verification content, not daily news | Needs discovery |

## Broad Bulgarian Source Backlog

This is a wider inventory of Bulgarian-language or Bulgaria-focused outlets to research later. It intentionally includes sources of mixed quality and different political lines. Being listed here does not mean the source should be added permanently.

### Already In The App

These are currently configured in `src/sources.js`; keep monitoring diagnostics for failures, bad timestamps, and duplicate volume.

| Source | Current category |
|---|---|
| Dnevnik | general |
| Capital | business |
| 24 Chasa | general |
| Mediapool | general |
| Actualno | general |
| Kmeta | regional |
| OffNews | general |
| Novinite | general / English |
| Bulgarian News Agency / BTA | agency |
| GlasNews | general |
| Radio Bulgaria | English |
| Bulgaria ON AIR | tv |
| Standart | general |
| Pogled | analysis |
| BurgasNews | regional |
| Investor | business |
| Money | business |
| Club Z | general |
| Webcafe | magazine |
| Cross | general |
| Vesti | general |
| News.bg | general |
| Fakti | general |
| FrogNews | general |
| Novavarna | regional |
| Trud | general |
| Monitor | general |
| Duma | general |
| Banker | business |
| Pernik News | regional |
| Manager | business |
| Bloomberg TV Bulgaria | business |
| Ruse Media | regional |
| Nova | tv |
| Gabrovo News | regional |
| BNT News | tv |
| Darik News | radio |
| Blitz | tabloid |
| Sliven Press | regional |
| Zov News | regional |
| Plovdiv24 | regional |
| TrafficNews | regional |
| Pod Tepeto | regional |
| Varna24 | regional |
| Burgas24 | regional |
| Ruse24 | regional |
| Plovdiv Press | regional |
| Chernomore | regional |
| Marica | regional |
| Sportal | sports |
| Gong | sports |
| Kaldata | technology |

### National And Mainstream Candidates

| Source | Homepage | Notes |
|---|---|---|
| Sega | `https://www.segabg.com/` | Established newspaper; feed needs discovery |
| Svobodna Evropa | `https://www.svobodnaevropa.bg/` | RFE/RL Bulgaria; label funding transparently |
| bTV Novinite | `https://btvnovinite.bg/` | Major TV newsroom |
| BNR Novini | `https://bnr.bg/` | Bulgarian National Radio news |
| NOVA News | `https://nova.bg/` | Already partly covered through Nova; test separate sections only if useful |
| Dir.bg | `https://dir.bg/` | Large portal; homepage/feed testing needed |
| Dnes.bg | `https://www.dnes.bg/` | Large general portal |
| Novini.bg | `https://novini.bg/` | High-volume general/political portal |
| Top Novini | `https://topnovini.bg/` | General/regional mix; check current activity |
| Iskra.bg | `https://www.iskra.bg/` | General/regional mix |
| Economic.bg | `https://www.economic.bg/` | Business/economy |
| Expert.bg | `https://www.expert.bg/` | Business/economy/current affairs |
| Profit.bg | `https://profit.bg/` | Business/markets/lifestyle |
| Chronicle.bg | `https://chr.bg/` | Magazine/history/culture; not breaking news |
| Lifestyle.bg | `https://lifestyle.bg/` | Lifestyle; add only if wanted |
| LadyZone | `https://ladyzone.bg/` | Lifestyle; not core news |

### Investigative, Analysis, Fact-Checking

| Source | Homepage | Notes |
|---|---|---|
| BIRD.bg | `https://bird.bg/` | Investigative/data journalism; feed worked in quick check |
| Bivol | `https://bivol.bg/` | Investigative; feed worked in quick check |
| Toest | `https://www.toest.bg/` | Analysis/commentary; feed worked in quick check |
| Factcheck.bg | `https://factcheck.bg/` | Fact-checking |
| Za Istinata | `https://zaistinata.com/` | Regional/investigative network; test feed |
| Marginalia | `https://www.marginalia.bg/` | Human rights/minorities; lower volume |
| Baricada | `https://baricada.org/` | Left/social analysis; label viewpoint |
| Terminal 3 | `https://terminal3.bg/` | Commentary; check current activity |
| De Re Militari | `https://drmjournal.org/` | Security/defense analysis; niche |
| European Council on Foreign Relations Bulgaria content | `https://ecfr.eu/` | Not Bulgarian outlet, but Bulgaria/EU analysis; likely not feed-suitable |

### Right, Conservative, Political Commentary

| Source | Homepage | Notes |
|---|---|---|
| Faktor | `https://faktor.bg/` | Center-right/conservative; feed needs discovery |
| Tribune | `https://tribune.bg/` | Right/party-adjacent; RSS worked in quick check |
| Konservator | `https://konservator.bg/` | Conservative commentary |
| Debati | `https://debati.bg/` | Politics/commentary |
| Desebg | `https://desebg.com/` | Anti-communist archive/news |
| Epicenter | `https://epicenter.bg/` | Political commentary; parser test needed |
| Glasove | `https://glasove.com/` | Political commentary; Cloudflare blocked quick check |
| Afera | `https://afera.bg/` | Political/personality media; Cloudflare blocked quick check |
| Lentata | `https://lentata.com/` | Political commentary; feed discovery needed |
| Istinata | `https://istinata.net/` | Political/commentary; feed worked in quick check |
| PIK | `https://pik.bg/` | Political tabloid; add only if this category is wanted |
| Narod | `https://narod.bg/` | Political/tabloid; quality check needed |
| SafeNews | `https://safenews.bg/` | Political/general; quality check needed |
| Informiran.net | `https://informiran.net/` | Political commentary; quality check needed |

### Pro-Russian / Anti-Western Narrative Monitoring

Use these only with transparent labeling and only if the app later supports narrative-monitoring categories. Do not label direct funding unless documented.

| Source | Homepage | Notes |
|---|---|---|
| Pogled | `https://pogled.info/` | Already present; commentary-heavy |
| Glasove | `https://glasove.com/` | Also listed above; pro-Russian/anti-liberal narratives often alleged, verify carefully |
| Afera | `https://afera.bg/` | Also listed above; political media |
| Istinata | `https://istinata.net/` | Also listed above; political media |
| News Front Bulgaria | Research needed | Possible pro-Kremlin network source; verify legality/access and avoid normal-news mixing |
| RT / Sputnik mirrors | Research needed | Russian state media; EU restrictions apply; do not add to normal feed |

### Public Institutions, Agencies, Policy

| Source | Homepage | Notes |
|---|---|---|
| Bulgarian News Agency / BTA | `https://www.bta.bg/` | Already present |
| Focus News Agency | `https://www.focus-news.net/` | Agency-style coverage; test feed |
| Pressclub Information Agency | `https://pianews.eu/` | Agency candidate; check activity/feed |
| Parliament news | `https://www.parliament.bg/` | Official source; not media, but useful if adding institutions |
| Council of Ministers press service | `https://www.gov.bg/` | Official source; not media |
| President.bg news | `https://www.president.bg/` | Official source; not media |
| Sofia Municipality news | `https://www.sofia.bg/` | Official local source |

### Regional Candidates

The app already has many regional sources. These are additional candidates to research for local coverage.

| Source | Region | Homepage |
|---|---|---|
| Moreto.net | Varna | `https://www.moreto.net/` |
| Varna Utre | Varna | `https://varnautre.bg/` |
| Varna News | Varna | `https://varnanews.bg/` |
| BurgasInfo | Burgas | `https://www.burgasinfo.com/` |
| Burgas24 | Burgas | Already present |
| Flagman | Burgas | `https://www.flagman.bg/` |
| Gramofona | Burgas | `https://www.gramofona.com/` |
| Plovdiv24 | Plovdiv | Already present |
| TrafficNews | Plovdiv | Already present |
| Pod Tepeto | Plovdiv | Already present |
| Plovdiv-Online | Plovdiv | `https://plovdiv-online.com/` |
| Plovdiv Derbi | Plovdiv | `https://plovdivderby.com/` |
| Ruse Media | Ruse | Already present |
| Ruse24 | Ruse | Already present |
| Dunavmost | Ruse | `https://www.dunavmost.com/` |
| Pleven Press | Pleven | `https://plevenpress.com/` |
| Pleven Za Pleven | Pleven | `https://plevenzapleven.bg/` |
| Gabrovo News | Gabrovo | Already present |
| Gabrovo Daily | Gabrovo | `https://www.gabrovodaily.info/` |
| Veliko Tarnovo News | Veliko Tarnovo | `https://www.vtnews.bg/` |
| Yantra Dnes | Veliko Tarnovo/Gorna Oryahovitsa | `https://www.dnesbg.com/` |
| Shumen Online | Shumen | `https://shumenonline.bg/` |
| Shum.bg | Shumen | `https://www.shum.bg/` |
| Dobrich Online | Dobrich | `https://dobrichonline.com/` |
| Pro News Dobrich | Dobrich | `https://pronewsdobrich.bg/` |
| Haskovo.net | Haskovo | `https://www.haskovo.net/` |
| Kardjali.bgvesti | Kardzhali | Research needed |
| Smolyan.bgvesti | Smolyan | Research needed |
| Blagoevgrad24 | Blagoevgrad | `https://www.blagoevgrad24.bg/` |
| Struma | Southwest Bulgaria | `https://struma.bg/` |
| Den News | Kyustendil/Dupnitsa | `https://dennews.bg/` |
| Pernik News | Pernik | Already present |
| Zapadno | West Bulgaria | `https://zapadno.com/` |
| Sliven Press | Sliven | Already present |
| Stara Zagora News | Stara Zagora | `https://stzagora.net/` |
| Kazanlak.com | Kazanlak | `https://www.kazanlak.com/` |
| Yambol News | Yambol | Research needed |
| Haskovo.info | Haskovo | `https://haskovo.info/` |

### Business, Economy, Technology

| Source | Homepage | Notes |
|---|---|---|
| Economic.bg | `https://www.economic.bg/` | Business/economy |
| Profit.bg | `https://profit.bg/` | Business/markets |
| Enterprise.bg | `https://enterprise.bg/` | Business |
| DevStyleR | `https://devstyler.io/` | Technology/dev industry |
| TechNews.bg | `https://technews.bg/` | Technology |
| Mobile Bulgaria | `https://mobilebulgaria.com/` | Telecom/mobile tech |
| HiComm | `https://hicomm.bg/` | Technology/pop science |
| Digital.bg | `https://www.digital.bg/` | Consumer tech |
| Questona | Research needed | Technology/startup candidate |

### Sports

| Source | Homepage | Notes |
|---|---|---|
| Sportal | `https://sportal.bg/` | Already present |
| Gong | `https://gong.bg/` | Already present |
| Topsport | `https://topsport.bg/` | Sports |
| Sportlive | `https://www.sportlive.bg/` | Sports |
| dsport | `https://dsport.bg/` | Sports |
| BG Football | `https://bgfootball.com/` | Football niche |
| Sportni.bg | `https://www.sportni.bg/` | Sports candidate |

### Culture, Society, Diaspora

| Source | Homepage | Notes |
|---|---|---|
| Ploshtad Slaveikov | `https://www.ploshtadslaveikov.com/` | Culture |
| Kultura | `https://kultura.bg/` | Culture/analysis |
| ArtDay | `https://artday.bg/` | Culture |
| Impressio | `https://impressio.dir.bg/` | Culture section under Dir |
| Az Cheta | `https://azcheta.com/` | Books/culture |
| Eurochicago | `https://www.eurochicago.com/` | Bulgarian diaspora |
| BG Voice | `https://bg-voice.com/` | Bulgarian diaspora / US |
| BG Ben | `https://bgben.co.uk/` | Bulgarian diaspora / UK |

### Agriculture, Rural, Sector-Specific

| Source | Homepage | Notes |
|---|---|---|
| Agri.bg | `https://agri.bg/` | Agriculture |
| Fermer.bg | `https://fermer.bg/` | Agriculture |
| Sinor.bg | `https://sinor.bg/` | Agriculture |
| Agro Plovdiv | `https://agroplovdiv.bg/` | Agriculture |
| Maritime.bg | `https://www.maritime.bg/` | Maritime/transport |
| Construction City | Research needed | Construction/real estate candidate |
| Imoti.net news | `https://www.imoti.net/` | Real estate, if useful |

### Legal, Security, Military

| Source | Homepage | Notes |
|---|---|---|
| Lex.bg | `https://news.lex.bg/` | Legal/judiciary |
| De Fakto | `https://defakto.bg/` | Legal/judiciary |
| Legal World | `https://legalworld.bg/` | Legal; check current status |
| Otbrana | `https://otbrana.com/` | Defense/security |
| Pan.bg | `https://pan.bg/` | Aviation/defense; quality check needed |
| Bulgarian Military | `https://bulgarianmilitary.com/` | Defense, English; quality check needed |

### Health, Science, Education

| Source | Homepage | Notes |
|---|---|---|
| Zdrave.net | `https://zdrave.net/` | Healthcare sector |
| Medical News | `https://medicalnews.bg/` | Healthcare |
| Nauka.bg | `https://nauka.bg/` | Science/education |
| Uchi.bg news | `https://ucha.se/` | Education-adjacent; may not be news-suitable |
| Az Buki | `https://azbuki.bg/` | Education/science publication |

### Sources To Treat Carefully

These can be monitored, but should not be added blindly to the main feed.

| Source type | Examples | Risk |
|---|---|---|
| Political tabloids | PIK, Narod, some Facebook-first sites | High noise, weak sourcing, duplicate content |
| Party media | party TV/sites, politician channels | Advocacy; needs clear category label |
| Russian state/proxy networks | RT, Sputnik, News Front, Pravda mirrors | Legal/platform restrictions and disinformation risk |
| Anonymous aggregators | repost-only sites | Duplicate content and bad timestamps |
| Lifestyle/clickbait networks | celebrity/viral portals | Not useful for core news unless explicitly desired |

## Right-Leaning And Conservative Candidates

Use these for better political balance, but keep the quality bar.

| Source | Category | Notes | Feed candidate |
|---|---|---|---|
| Faktor | right | Pro-Western, center-right/conservative politics and analysis | Needs discovery |
| Tribune | right | Right-leaning / party-adjacent political news | `https://tribune.bg/bg/rss/` |
| Konservator | conservative | Conservative commentary and essays; more opinion than news | Needs discovery |
| Desebg | anti-communist | Historical memory, State Security, anti-communist archive/news | Needs discovery |
| Debati | right | Politics and commentary, pro-democratic/right-ish mix | Needs discovery |
| Epicenter | political-media | Political news and commentary; quality varies | Needs parser test |
| Glasove | political-media | Conservative/anti-liberal commentary sphere; crawler may be blocked | Cloudflare blocked quick check |
| Dir.bg | mainstream | Large portal, not strictly right-wing but useful for balance | Needs discovery |
| Novini.bg | mainstream | General portal with high political volume; quality varies | Needs discovery |
| Dnes.bg | mainstream | General portal with broader political mix | Needs discovery |

Suggested first test batch:

```js
{ name: 'Tribune', homepage: 'https://tribune.bg/', feed: 'https://tribune.bg/bg/rss/', category: 'right' },
{ name: 'Faktor', homepage: 'https://faktor.bg/', feed: null, category: 'right' },
{ name: 'Konservator', homepage: 'https://konservator.bg/', feed: null, category: 'conservative' },
{ name: 'Debati', homepage: 'https://debati.bg/', feed: null, category: 'right' }
```

## Political Media And Personality Sources

These should be labeled separately from ordinary news. They can be useful for monitoring political narratives, but they are often commentary, advocacy, or party-adjacent media.

Recommended category names:

- `political-media`
- `opinion`
- `youtube`

| Source | Category | Notes | Feed candidate |
|---|---|---|---|
| Afera | political-media | Political/personality site; requested as an example | `https://afera.bg/feed/` returned Cloudflare `403` |
| Tribune | political-media | Right/party-adjacent politics | `https://tribune.bg/bg/rss/` |
| Epicenter | political-media | Political commentary/news | `/rss` responded, but needs parser test |
| Glasove | political-media | Political commentary | Cloudflare blocked quick check |
| Lentata | political-media | Political commentary | `/feed/` returned HTML; needs discovery |
| Istinata | political-media | Political/commentary site | `https://istinata.net/feed/` |
| PIK | political-tabloid | Political tabloid; add only if this category is wanted | Needs discovery |
| Pogled | political-media | Already present in the app | `https://pogled.info/rss` currently configured |

Suggested first test batch:

```js
{ name: 'Tribune', homepage: 'https://tribune.bg/', feed: 'https://tribune.bg/bg/rss/', category: 'political-media' },
{ name: 'Istinata', homepage: 'https://istinata.net/', feed: 'https://istinata.net/feed/', category: 'political-media' },
{ name: 'Afera', homepage: 'https://afera.bg/', feed: null, category: 'political-media' },
{ name: 'Epicenter', homepage: 'https://epicenter.bg/', feed: null, category: 'political-media' }
```

## YouTube Channels

YouTube channels can be added through Atom feeds:

```text
https://www.youtube.com/feeds/videos.xml?channel_id=<CHANNEL_ID>
```

The current feed parser should be tested against YouTube Atom feeds before adding many channels.

Possible channel groups:

- Afera-related channels
- Tribune or party-adjacent channels
- 7/8 TV / Slavi Trifonov ecosystem
- Pogled Info / Alternativen Pogled
- individual Bulgarian political commentator channels

YouTube items should use category `youtube` or `political-media` so they are not confused with ordinary news articles.

## Funding And Influence Transparency

Future source work should track funding and institutional affiliation where it is public. This is useful for viewpoint balance, but it must be handled carefully. Do not label a Bulgarian outlet as "foreign-funded" or "Russian-funded" unless there is a reliable public source for that specific claim.

Recommended metadata fields for future source entries:

```js
{
  name: 'Example',
  homepage: 'https://example.bg/',
  feed: 'https://example.bg/feed/',
  category: 'general',
  viewpoint: 'center-right',
  fundingNote: 'Public grant / owner / state-affiliated / research needed',
  fundingSourceUrl: 'https://...'
}
```

Suggested labels:

- `public-grant-us`: public US-linked grant support or US-funded institution.
- `public-grant-eu`: public EU-linked grant support.
- `russian-state`: official Russian state media or Russian state-owned media group.
- `russia-affiliated`: public reporting links the outlet/network to Russian state or proxy structures.
- `pro-russian-editorial`: editorial line often aligns with Russian state narratives, but direct funding is not proven.
- `research-needed`: claim exists in public debate, but no reliable source has been recorded yet.

### America For Bulgaria / US-Linked Transparency

America for Bulgaria Foundation has a public project database and publishes financial information. Its website also lists the Association of European Journalists as a featured project under Business Enabling Environment. Use official ABF records first, not social media claims.

Candidate organizations/outlets to research:

| Source or organization | Candidate label | Notes |
|---|---|---|
| Association of European Journalists Bulgaria | `public-grant-us` | Listed by ABF as a featured project; not itself a news outlet, but relevant to media ecosystem tracking |
| Factcheck.bg | `public-grant-us` / `research-needed` | Check public funding disclosures before adding label |
| Svobodna Evropa | `us-funded-institution` | RFE/RL is US-funded; source can still be useful if clearly labeled |
| Mediapool | `research-needed` | Often discussed in public funding debates; verify from public records before labeling |
| Club Z | `research-needed` | Verify from public records before labeling |
| Dnevnik / Capital / Economedia | `research-needed` | Privately owned; verify any grant/project claims before labeling |

Useful research links:

- America for Bulgaria Foundation project database: `https://us4bg.org/our-projects/`
- America for Bulgaria Foundation financial statements: `https://us4bg.org/who-we-are/financial-statements/`
- RFE/RL corporate information: `https://www.rferl.org/`

### Russian State / Russia-Linked Transparency

Separate direct Russian state media from Bulgarian outlets that are merely pro-Russian in editorial line.

Confirmed or high-confidence categories:

| Source/network | Candidate label | Notes |
|---|---|---|
| RT / Russia Today | `russian-state` | Russian state media; EU restrictions apply |
| Sputnik / Rossiya Segodnya | `russian-state` | Russian state-owned media group; EU restrictions apply |
| News Front | `russia-affiliated` | Frequently described in research/reporting as part of the pro-Kremlin disinformation ecosystem; verify Bulgarian feed viability |
| Pravda network mirrors | `russia-affiliated` | Known pro-Kremlin content network; avoid unless explicitly building a disinformation-monitoring view |
| Alfa TV / Ataka ecosystem | `pro-russian-editorial` | Party media; channel reportedly closed, but useful as historical reference |

Bulgarian sources that may be useful for viewpoint monitoring but should not be labeled as Russian-funded without proof:

| Source | Candidate label | Notes |
|---|---|---|
| Pogled | `pro-russian-editorial` | Already present; commentary-heavy |
| Glasove | `pro-russian-editorial` / `research-needed` | Cloudflare blocked quick feed check |
| Afera | `political-media` / `research-needed` | Cloudflare blocked quick feed check |
| Istinata | `political-media` / `research-needed` | Feed works; direct funding not established |
| Epicenter | `political-media` / `research-needed` | Needs parser and funding research |

Useful research links:

- EU sanctions and restrictions on RT/Sputnik should be checked through official EU Council/Commission pages.
- Rossiya Segodnya / Sputnik ownership can be checked from official and regulatory sources.
- For Bulgarian outlets, prefer media ownership registers, annual reports, grant databases, and reputable investigations over hearsay.

Implementation idea:

- Add a non-prominent metadata badge or filter later, for example `funding: public-grant-us`, `funding: russian-state`, `funding: unknown`.
- Keep the main feed chronological. Do not rank articles by funding label.
- Let users filter or inspect source context, but avoid turning the app into a propaganda scoreboard.

## Product Ideas To Keep Small

Useful improvements that fit the app:

- Source diagnostics view in the UI, based on `sourceDiagnostics`.
- Optional category filter presets: `news`, `business`, `regional`, `right`, `political-media`, `youtube`.
- Optional source transparency metadata for ownership/funding when publicly documented.
- Per-source enable/disable config for local experimentation.
- Separate "commentary/political media" topic group so the main feed remains understandable.

Avoid:

- AI summaries by default.
- Fetching every article page just to improve previews.
- Adding dozens of low-quality political/tabloid sources at once.
- Complex personalization or accounts.
