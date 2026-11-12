# Subreddit posts and comments API

`GET /v1/reddit/subreddits/{name}/posts` lists a subreddit's posts in Reddit's own orderings (hot, new, rising, top or controversial), with no keyword needed. `GET /v1/reddit/subreddits/{name}/comments` reads the community's newest comments across every post, and `GET /v1/reddit/subreddits/{name}` returns its description and member count. Posts and comments cost 3 credits each plus 1 credit per call, and the community record costs 2 credits a lookup.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/reddit/subreddits/{name}/posts` | List a community's posts: hot, new, rising, top, or controversial | Posts in the listing's order, in Reddit's own field names | 1 per call + 3 per Reddit post | `get_subreddit_posts` |
| `GET /v1/reddit/subreddits/{name}/comments` | Read a community's newest comments, across every post | Comments, newest first, in Reddit's own field names | 1 per call + 3 per Reddit comment | `get_subreddit_comments` |
| `GET /v1/reddit/subreddits/{name}` | Get information about a public subreddit | Subreddit metadata, in Reddit's own field names | 1 per call + 1 per subreddit | `get_subreddit` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/reddit/subreddits/{name}/posts`

`name` goes in the path and the others go in the query string.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `name` | path | string | yes | A community name without `r/`; `popular` or `all` for the site-wide listings; or up to 25 communities joined with `+` (`saas+startups+entrepreneur`) to read them as one listing in a single call. |
| `sort` | query | string | no | Reddit's own orderings. `new` is arrival order, which is what watching a community needs; `hot` is Reddit's default front page. One of `hot`, `new`, `rising`, `top`, `controversial`. Default `hot`. |
| `time` | query | string | no | Window for `top` and `controversial` only. Defaults to `day` for those sorts. One of `hour`, `day`, `week`, `month`, `year`, `all`. |
| `geo` | query | string | no | Region for `popular` sorted by `hot` only: a country code (`DE`), a US state (`US_CA`), or `GLOBAL`. |
| `includeNsfw` | query | string | no | Include posts marked NSFW. Off by default; what it removes is reported in `meta.omittedNsfw`, so a short or empty page is never mistaken for a quiet one. One of `true`, `false`. Default `false`. |
| `limit` | query | integer | no | Posts per page, before the NSFW rule is applied. 1 to 100. Default `25`. |
| `cursor` | query | string | no | `meta.nextCursor` from the previous page, unchanged. Opaque, signed, and bound to the other parameters: change any of them and start again without a cursor. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/reddit/subreddits/{name}/comments` | `name` (path, required), `includeNsfw` (query), `limit` (query), `cursor` (query) |
| `GET /v1/reddit/subreddits/{name}` | `name` (path, required) |

Types and limits of each are in the reference: [`getSubredditComments`](https://docs.weirapp.io/reference/reddit/getSubredditComments), [`getSubreddit`](https://docs.weirapp.io/reference/reddit/getSubreddit).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/reddit/subreddits/saas/posts?sort=new&limit=25' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.parse
import urllib.request

url = "https://api.weirapp.io/v1/reddit/subreddits/saas/posts"
url += "?" + urllib.parse.urlencode({"sort": "new", "limit": 25})
request = urllib.request.Request(
    url,
    headers={
        "Authorization": "Bearer " + os.environ["WEIR_API_KEY"],
        "User-Agent": "weir-docs-example",
    },
)
try:
    with urllib.request.urlopen(request, timeout=60) as response:
        page = json.load(response)
        charged = response.headers["x-credits-charged"]
except urllib.error.HTTPError as error:
    # 402 is out of credits: do not retry. 429 and 503 can be retried after Retry-After.
    raise SystemExit(f"{error.code}: {json.load(error)['error']['message']}")

for post in page["data"]:
    print(post["createdAt"], post["score"], post["numComments"], post["title"])
print("credits charged:", charged)
print("next cursor:", page["meta"].get("nextCursor"))
```

## Response fields you will use most

`GET /v1/reddit/subreddits/{name}/posts` answers `200` with a `data` array and a `meta` object. Posts in the listing's order, in Reddit's own field names.

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

Every field, with its type, is in the reference: [`getSubredditPosts`](https://docs.weirapp.io/reference/reddit/getSubredditPosts).

## Limits and caveats

- `name` also takes `popular`, `all`, or up to 25 communities joined with `+`, such as `saas+startups`. They are read as one listing in a single call and billed as one request.
- Listings stop at about 1,000 posts, Reddit's own ceiling, where `meta.nextCursor` becomes `null`.
- `time` applies to the `top` and `controversial` orderings only.
- NSFW posts are left out unless `includeNsfw=true`. How many were left out is in `meta.omittedNsfw`.
- A community that does not exist, or is private, banned or quarantined, is a `404` whose `details.reason` says which.
- The comment stream is the way to find mentions inside comments, because Reddit's search does not search comment text at all. Each comment carries the post it belongs to in `linkTitle` and `linkPermalink`.
- Busy communities produce comments faster than anyone pages through them. To watch one continuously, create a `subreddit_comments` [monitor](monitors-webhooks-api.md), which also filters by keyword.
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. `GET /v1/reddit/subreddits/{name}/posts` counts as 2 requests, `GET /v1/reddit/subreddits/{name}/comments` as 2 and `GET /v1/reddit/subreddits/{name}` as 1.
- **When Reddit is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X (Twitter) or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Search Reddit posts by keyword](reddit-search-api.md)
- [One post and its comment tree](reddit-post-comments-api.md)
- [Watch a subreddit for new posts or comments](monitors-webhooks-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_subreddit_posts`, `get_subreddit_comments` and `get_subreddit`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "What are the newest posts on r/SaaS today? Give me the titles and scores."

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
