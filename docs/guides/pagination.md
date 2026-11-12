# Pagination

> Part of the Weir docs for public Reddit and X (Twitter) data. Copied from https://docs.weirapp.io/pagination on 12 November 2026. That page is always the current version.

Cursors, not page numbers.

```json
{ "meta": { "nextCursor": "eyJ2IjoxLCJz…" } }
```

Send it back as `cursor` to continue. **`nextCursor: null` is the only stop condition**. A page
can come back empty with more results behind it.

```bash
curl --request POST \
  --url https://api.weirapp.io/v1/reddit/search \
  --header "Authorization: Bearer $WEIR_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"query":"payment failures","cursor":"eyJ2IjoxLCJz…"}'
```

Searches take `cursor` in the body. Endpoints read with `GET`, such as a user's posts or a post's
replies, take it in the query string.

## Keep the query identical

A cursor is bound to the exact request it came from. Change any filter and you get `400`, not a
silent reset to page one. Quietly serving page two of a different search produces a plausible,
wrong answer that nobody notices.

Change the query, start a new cursor.

## Cursors are per platform

A Reddit cursor means nothing to X. Walking both means walking two cursors, and finishing one does
not stop the other.

## Every page is billed

`limit` bounds one call. 100 Reddit posts cost 301 credits: 1 for the call and 3 per post. X
serves about 20 posts per page, so 100 X posts take about five calls and cost about 105.

```ts
async function* redditPages(query: string, maxPages: number) {
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const response = await fetch("https://api.weirapp.io/v1/reddit/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WEIR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, limit: 100, ...(cursor ? { cursor } : {}) }),
    });
    if (!response.ok) throw new Error(`Weir answered ${response.status}`);

    const { data, meta } = await response.json();
    yield data; // this page's array of posts

    if (!meta.nextCursor) return;
    cursor = meta.nextCursor;
  }
}

for await (const posts of redditPages("payment failures", 20)) {
  for (const post of posts) console.log(post.url);
}
```

Each page is an array of posts, so the inner loop reads it directly.

**`maxPages` is not optional in spirit.** An unbounded walk over a broad query keeps finding
results and keeps charging. A ceiling is the difference between a backfill and a bill.

## How far back an X account goes

X itself limits what a profile shows: the newest 800 posts on the Posts tab and the newest 3,200
on Posts & replies
([X Help Center](https://help.x.com/en/using-x/missing-posts)). The API reads the same tabs, so:

| To read                         | Use                                  | Reaches             |
| ------------------------------- | ------------------------------------ | ------------------- |
| An account's posts and reposts  | `GET /v1/x/users/{user}/posts`       | The newest ~800     |
| Its posts together with replies | `GET /v1/x/users/{user}/replies`     | The newest ~3,200   |
| Anything older                  | `POST /v1/x/search` with `fromUsers` | What X search finds |

Where a tab ends, `data` is empty and `nextCursor` is `null`. To go on from there, search with
`fromUsers` and `untilId` set to the oldest post id you already have, or walk back month by month
with `since` and `until`. X search does not return every post, so for a complete copy of your
**own** account use X's archive download (Settings, Your account, Download an archive of your
data), which holds every post you have made.

While you page a tab, each page is filled up to `limit` from the next one X serves, so a short
page before the end is rare. The pinned post comes first on the first page only.

## Do not build your own cursor

It is a signed envelope, not an offset. The signature covers the position _and_ a fingerprint of
the query, so a hand-edited cursor is rejected rather than honoured. To resume tomorrow, store the
string exactly as given.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
