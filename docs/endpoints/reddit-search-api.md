# Reddit search API

`POST /v1/reddit/search` searches public Reddit posts by keyword, across Reddit or inside the communities you name. It returns each post in Reddit's own field names: subreddit, title, body, author, score and comment count. A search costs 1 credit per call plus 3 credits per post returned, so 100 posts cost 301 credits.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `POST /v1/reddit/search` | Search public Reddit posts | Reddit posts, in Reddit's own field names | 1 per call + 3 per Reddit post | `search_reddit` |
| `POST /v1/reddit/subreddits/{name}/search` | Search posts within one subreddit | Reddit posts restricted to the named subreddit | 1 per call + 3 per Reddit post | `search_subreddit` |
| `POST /v1/reddit/search/subreddits` | Find communities by name or topic | Communities, in Reddit's own field names | 1 per call + 1 per subreddit | `search_subreddits` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `POST /v1/reddit/search`

These go in a JSON body.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `query` | body | string | yes | Reddit search syntax: words, `"exact phrases"`, `OR`, `-exclusions`, and field operators such as `title:`, `author:`, `flair:`, `site:example.com`, `url:`, `self:yes`. Up to 500 characters. |
| `subreddit` | body | string | no | Restrict the search to one community, by name without `r/`. |
| `subreddits` | body | array of string | no | Restrict the search to several communities at once (up to 25). Up to 25 items. |
| `sort` | body | string | no | `new` is arrival order; `comments` ranks by comment count. One of `relevance`, `hot`, `top`, `new`, `comments`. Default `relevance`. |
| `time` | body | string | no | Only posts created within this window. One of `all`, `year`, `month`, `week`, `day`, `hour`. Default `all`. |
| `includeNsfw` | body | boolean | no | Include results marked NSFW. Off by default; what it removes is reported in `meta.omittedNsfw`. Default `false`. |
| `limit` | body | integer | no | Most posts to return. 1 to 100. Default `25`. |
| `cursor` | body | string | no | `meta.nextCursor` from the previous page, unchanged. Opaque, signed, and bound to the other parameters: change any of them and start again without a cursor. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `POST /v1/reddit/subreddits/{name}/search` | `name` (path, required), `query` (body, required), `sort` (body), `time` (body), `includeNsfw` (body), `limit` (body), `cursor` (body) |
| `POST /v1/reddit/search/subreddits` | `query` (body, required), `sort` (body), `includeNsfw` (body), `limit` (body), `cursor` (body) |

Types and limits of each are in the reference: [`searchSubreddit`](https://docs.weirapp.io/reference/reddit/searchSubreddit), [`searchSubreddits`](https://docs.weirapp.io/reference/reddit/searchSubreddits).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request POST \
  --url 'https://api.weirapp.io/v1/reddit/search' \
  --header "Authorization: Bearer $WEIR_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"query":"usage-based pricing","subreddit":"SaaS","sort":"top","time":"year","limit":10}'
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/reddit/search"
body = {"query": "usage-based pricing", "subreddit": "SaaS", "sort": "top", "time": "year", "limit": 10}
request = urllib.request.Request(
    url,
    data=json.dumps(body).encode(),
    headers={
        "Authorization": "Bearer " + os.environ["WEIR_API_KEY"],
        "Content-Type": "application/json",
        "User-Agent": "weir-docs-example",
    },
    method="POST",
)
try:
    with urllib.request.urlopen(request, timeout=60) as response:
        page = json.load(response)
        charged = response.headers["x-credits-charged"]
except urllib.error.HTTPError as error:
    # 402 is out of credits: do not retry. 429 and 503 can be retried after Retry-After.
    raise SystemExit(f"{error.code}: {json.load(error)['error']['message']}")

for post in page["data"]:
    print(post["score"], post["numComments"], post["title"])
print("credits charged:", charged)
print("next cursor:", page["meta"].get("nextCursor"))
```

## Response fields you will use most

`POST /v1/reddit/search` answers `200` with a `data` array and a `meta` object. Reddit posts, in Reddit's own field names.

| Field | Type | Meaning |
| --- | --- | --- |
| `data[].id` | string | Reddit's base-36 post id, without the `t3_` prefix. |
| `data[].subreddit` | string | Community name without the `r/` prefix. |
| `data[].title` | string | The post title. |
| `data[].selftext` | string | Body text. Empty for a link post. |
| `data[].author` | string | Username without the `u/` prefix. `[deleted]` if removed. |
| `data[].score` | integer | Upvotes minus downvotes. Can be negative, and is fuzzed by Reddit. |
| `data[].upvoteRatio` | number | Fraction of votes that were upvotes. |
| `data[].numComments` | integer | Comments on the post. |
| `data[].permalink` | string | Path on reddit.com, beginning with a slash. |
| `data[].url` | string | Absolute URL to the post. |
| `data[].createdAt` | string (date-time) | The same instant as `createdUtc`, in ISO 8601. |
| `data[].over18` | boolean | Marked NSFW by the author or a moderator. |
| `data[].linkFlairText` | string or null | The post's flair, such as `Question` or `Hiring`. Null when it has none. |
| `data[].removedByCategory` | string or null | Why the post was removed: `moderator`, `deleted`, `author`, `automod_filtered`, `reddit`, and so on. Null while it is visible. |
| `meta.nextCursor` | string or null | Cursor for the next page. `null` means there is no next page. |
| `meta.omittedNsfw` | integer | Items removed from this page because they are marked NSFW and `includeNsfw` is false. Absent when nothing was removed. A page can be short, or even empty with a non-null `nextCursor`, because of it. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`searchReddit`](https://docs.weirapp.io/reference/reddit/searchReddit).

## Limits and caveats

- Reddit's search covers post titles and bodies only. It does not search comment text. To find mentions in comments, read a community's [comment stream](subreddit-posts-comments-api.md) or watch it with a `subreddit_comments` [monitor](monitors-webhooks-api.md).
- `POST /v1/reddit/subreddits/{name}/search` searches inside one community, and its body cannot widen the search beyond it. `POST /v1/reddit/search/subreddits` finds communities by name or topic, with member counts.
- `query` takes Reddit search syntax: words, exact phrases in quotes, `OR`, `-exclusions`, and field operators such as `title:`, `author:` and `flair:`.
- NSFW posts are left out unless `includeNsfw` is true. What was removed is counted in `meta.omittedNsfw`, and a page can be short, or even empty with a non-null `meta.nextCursor`, because of it.
- `limit` is 1 to 100 and defaults to 25.
- `author` is a username string, and a deleted author is the literal `[deleted]`. `score` is upvotes minus downvotes: it can be negative, and Reddit fuzzes it.
- Reddit search results can be up to 10 minutes old. Weir keeps a short-lived copy of each answer, and a repeat inside that window returns the copy and is still billed.
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. Each call here counts as 2 requests.
- **When Reddit is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X (Twitter) or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [A subreddit's posts and comments, without a keyword](subreddit-posts-comments-api.md)
- [One post and its comment tree](reddit-post-comments-api.md)
- [Watch a keyword or a subreddit](monitors-webhooks-api.md)
- Worked example in Python, Node.js and cURL: https://docs.weirapp.io/examples/search-reddit

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `search_reddit`, `search_subreddit` and `search_subreddits`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "What are people on r/SaaS saying about usage-based pricing this year? Summarise the top threads."

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
