# Website search

Search is an enabled local feature at `/search`, backed by `GET /api/search`. The server assembles its index at request time, so newly published local content is immediately searchable without a separate indexing job.

## Search indicators

- `@word` searches public website pages and service pages.
- `#word` searches articles, published blog posts, and published newsletter/news items.
- `*word` searches visible events when Events is enabled.
- A query without an indicator searches every public scope.

Whitespace after an indicator is optional. Queries are Unicode-normalized, collapsed to a maximum of 200 characters, require at least two searchable characters, and support relevance or newest-first sorting through the typed client contract.

## Public-content boundary

The local index includes configured static pages, visible service/article data, published blog posts, published newsletter issues (or the visible sample news when no issue is published), and published events. When Events has no published records, search uses the same visible sample events as the Events page. It never indexes administrator routes, customer accounts, contact messages, applicants, subscribers, drafts, or future-scheduled blog/newsletter content.

Search results only accept same-site paths beginning with one `/`; unsafe protocol-relative paths are discarded. The feature flag guards the page, client adapter, and server endpoint independently.

## Extension point

`feature-layers/search/server/utils/search-source.ts` assembles local sources and `search-index.ts` maps them into the public search contract. A future hosted search provider should replace that server-only source while preserving the client response contract and public-content rules. Provider keys must remain in private runtime configuration.
