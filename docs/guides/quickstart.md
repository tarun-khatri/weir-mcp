# Quickstart

> Part of the Weir docs for public Reddit and X (Twitter) data. Copied from https://docs.weirapp.io/quickstart on 12 November 2026. That page is always the current version.

A working search in five minutes. No card.

Using an AI agent? You may not need a key at all: [connect it with MCP](https://docs.weirapp.io/mcp).

## 1. Get a key

Create one under [API keys](https://weirapp.io/dashboard/keys). It is shown once.

```bash
export WEIR_API_KEY="weir_live_..."
```

A key is a bearer credential: whoever holds it spends your credits. Keep it out of browser code
and public repositories.

## 2. Make a request

```bash
curl --request POST \
  --url https://api.weirapp.io/v1/reddit/search \
  --header "Authorization: Bearer $WEIR_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"query":"payment failures","limit":10}'
```

Swap `reddit` for `x` to search X instead.

## 3. Read the response

```json
{
  "data": [
    {
      "id": "1t4k9x2",
      "subreddit": "saas",
      "title": "Our checkout has been failing since Tuesday",
      "author": "eng_at_acme",
      "score": 212,
      "numComments": 47,
      "createdAt": "2026-07-30T11:04:22.000Z"
    }
  ],
  "meta": { "requestId": "req_…", "nextCursor": "…" }
}
```

`data` is a plain array of that platform's own shape. `meta.nextCursor` gets you the next page.

## 4. Check what it cost

Every response carries the charge:

```
x-credits-charged: 31
x-credits-remaining: 4969
```

Ten Reddit posts cost 31 credits: 1 for the call and 3 per post. Every
[reference page](https://docs.weirapp.io/reference/reddit/searchReddit) states its price, and a failed call costs nothing.

## Next

- [Authentication](https://docs.weirapp.io/authentication). Scope a key before it goes near production.
- [Errors](https://docs.weirapp.io/errors). `402` and `429` need opposite responses.
- [Response shapes](https://docs.weirapp.io/response-shapes). What each platform returns.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
