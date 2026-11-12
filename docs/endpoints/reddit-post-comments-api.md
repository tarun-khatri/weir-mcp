# Reddit post and comments API

`GET /v1/reddit/posts/{id}/comments` returns a Reddit post's comment tree as a flat list, page by page. Each comment carries `depth` and `parentId`, so the tree can be rebuilt. `GET /v1/reddit/posts/{id}` returns the post itself, and each post or comment costs 3 credits plus 1 credit per call.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/reddit/posts/{id}/comments` | Get a Reddit comment tree as a flat list, page by page | Comments ordered by Reddit with depth and parent IDs | 1 per call + 3 per Reddit comment | `get_reddit_comments` |
| `GET /v1/reddit/posts/{id}` | Get one public Reddit post | One Reddit post, in Reddit's own field names | 1 per call + 3 per Reddit post | `get_reddit_post` |
| `POST /v1/reddit/lookup` | Fetch up to 100 posts and comments, and 100 communities, in one call | The items that exist and are publicly readable, in Reddit's own field names | 1 per call + 3 per Reddit post + 3 per Reddit comment + 1 per subreddit | `lookup_reddit` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/reddit/posts/{id}/comments`

`id` goes in the path and the others go in the query string.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `id` | path | string | yes | Reddit's base-36 post id, without the `t3_` prefix: `1vdo8we` in a post URL. |
| `limit` | query | integer | no | Comments on the first page; Reddit's own ceiling is 500. Each later page loads up to 100 more of the comments Reddit left behind "load more" links. 1 to 500. Default `50`. |
| `depth` | query | integer | no | Reply levels to include; 1 is top-level comments only. 1 to 10. Default `3`. |
| `sort` | query | string | no | `confidence` is Reddit's "best"; `new` puts the latest first. One of `confidence`, `top`, `new`, `controversial`, `old`, `random`, `qa`, `live`. Default `confidence`. |
| `comment` | query | string | no | Focus on one comment (its id, without `t1_`): returns it, up to `context` of its ancestors, and its replies, the view a comment's permalink opens. |
| `context` | query | integer or null | no | Ancestors to include above `comment`. Default 3. 0 to 8. |
| `cursor` | query | string | no | `meta.nextCursor` from the previous page, unchanged. Opaque, signed, and bound to the other parameters: change any of them and start again without a cursor. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/reddit/posts/{id}` | `id` (path, required) |
| `POST /v1/reddit/lookup` | `posts` (body), `comments` (body), `subreddits` (body) |

Types and limits of each are in the reference: [`getRedditPost`](https://docs.weirapp.io/reference/reddit/getRedditPost), [`lookupReddit`](https://docs.weirapp.io/reference/reddit/lookupReddit).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
export POST_ID="..."   # Reddit's post id, the code after /comments/ in a post URL
curl --request GET \
  --url "https://api.weirapp.io/v1/reddit/posts/$POST_ID/comments?sort=top&limit=50" \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.parse
import urllib.request

post_id = os.environ["POST_ID"]  # Reddit's post id, the code after /comments/ in a post URL
url = f"https://api.weirapp.io/v1/reddit/posts/{post_id}/comments"
url += "?" + urllib.parse.urlencode({"sort": "top", "limit": 50})
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

for comment in page["data"]:
    print(comment["depth"], comment["score"], comment["author"], comment["body"])
print("credits charged:", charged)
print("next cursor:", page["meta"].get("nextCursor"))
```

## Response fields you will use most

`GET /v1/reddit/posts/{id}/comments` answers `200` with a `data` array and a `meta` object. Comments ordered by Reddit with depth and parent IDs.

| Field | Type | Meaning |
| --- | --- | --- |
| `data[].id` | string | Reddit's base-36 comment id, without the `t1_` prefix. |
| `data[].parentId` | string | The comment or post this replies to. |
| `data[].depth` | integer | 0 for a top-level comment. |
| `data[].author` | string | Username without the `u/` prefix. `[deleted]` if removed. |
| `data[].body` | string | Markdown. `[removed]` or `[deleted]` once taken down. |
| `data[].score` | integer | The comment's score. |
| `data[].scoreHidden` | boolean | Reddit is hiding this comment's score for now; `score` means nothing while true. |
| `data[].isSubmitter` | boolean | The commenter is the post's author (OP). |
| `data[].permalink` | string | Absolute URL of the comment. |
| `data[].createdAt` | string (date-time) | When it was written. |
| `meta.nextCursor` | string or null | Cursor for the next page. `null` means there is no next page. |
| `meta.moreCount` | integer | Reddit's estimate of the comments not loaded yet. 0 once `nextCursor` is null. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getRedditComments`](https://docs.weirapp.io/reference/reddit/getRedditComments).

## Limits and caveats

- The first page is the thread as Reddit lays it out, up to `limit` comments and `depth` levels. `limit` goes up to 500 on the first page, and each later page loads up to 100 more.
- Large threads do not fit on one page. `meta.moreCount` estimates how many comments still sit behind Reddit's "load more" links: pass `meta.nextCursor` back until it is `null`.
- The `depth` parameter is the number of reply levels to include, 1 to 10, default 3. In the response, a comment's own `depth` is 0 for a top-level comment.
- `comment` focuses the thread on one comment, as its permalink does, with `context` ancestors above it.
- The id is Reddit's base-36 post id, without the `t3_` prefix: the code after /comments/ in a post URL.
- `POST /v1/reddit/lookup` refreshes items you already know about: up to 100 posts and comments, and 100 communities, in one call. Items Reddit did not return are listed in `meta.missing`, results are not filtered for NSFW, and you are billed per item returned.
- A removed post says why in `removedByCategory`, and a deleted comment has the body `[deleted]`.
- A Reddit post can be up to 1 hour old and its comments up to 15 minutes. Weir keeps a short-lived copy of each answer, and a repeat inside that window returns the copy and is still billed.
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. `GET /v1/reddit/posts/{id}/comments` counts as 4 requests, `GET /v1/reddit/posts/{id}` as 1 and `POST /v1/reddit/lookup` as 2.
- **When Reddit is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X (Twitter) or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Find posts by keyword](reddit-search-api.md)
- [A subreddit's comment stream](subreddit-posts-comments-api.md)
- [A monitor that reports new comments on one post](monitors-webhooks-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_reddit_comments`, `get_reddit_post` and `lookup_reddit`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Read the comments on this Reddit post and list the main points people agree on: (paste the post's link)"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
