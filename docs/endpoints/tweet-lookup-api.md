# Get tweet by ID: X (Twitter) post lookup API

`GET /v1/x/posts/{id}` returns one public X post by its numeric id, with its author, counters, media, and any post it quotes or reposts. `GET /v1/x/posts` looks up as many as 100 ids in one call, and `GET /v1/x/posts/{id}/edits` returns every version of an edited post. Each costs 1 credit per call plus 1 credit per post returned, so one post is 2 credits and a full batch of 100 is 101.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/posts/{id}` | Get one public X post | One X post, in X's own field names | 1 per call + 1 per X post | `get_x_post` |
| `GET /v1/x/posts` | Get up to 100 public X posts by id | The posts found, in request order | 1 per call + 1 per X post | `get_x_posts` |
| `GET /v1/x/posts/{id}/edits` | Get the edit history of an X post | Versions of the post, newest first | 1 per call + 1 per X post | `get_x_post_edits` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/x/posts/{id}`

`id` goes in the path.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `id` | path | string | yes | Numeric post id: the digits after `/status/` in a post's URL. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/x/posts` | `ids` (query, required) |
| `GET /v1/x/posts/{id}/edits` | `id` (path, required) |

Types and limits of each are in the reference: [`getXPosts`](https://docs.weirapp.io/reference/x/getXPosts), [`getXPostEdits`](https://docs.weirapp.io/reference/x/getXPostEdits).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/x/posts/2113776971603689874' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/x/posts/2113776971603689874"
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

post = page["data"]
print(post["createdAt"], post["author"]["username"], post["likeCount"], post["text"])
print("credits charged:", charged)
```

## Response fields you will use most

`GET /v1/x/posts/{id}` answers `200` with a `data` object and a `meta` object. One X post, in X's own field names.

| Field | Type | Meaning |
| --- | --- | --- |
| `data.id` | string | Numeric post id, as a string. It exceeds 2^53. |
| `data.text` | string | Full post text, untruncated. |
| `data.url` | string | Link to the post on x.com. |
| `data.createdAt` | string (date-time) | When it was posted. |
| `data.lang` | string or null | BCP-47 language tag detected by X. |
| `data.author` | object | An object with `id`, `username`, `name`, `verified`, `followersCount`, `profileImageUrl`. |
| `data.likeCount`, `retweetCount`, `replyCount`, `quoteCount`, `viewCount`, `bookmarkCount` | integer or null | Counts as X reports them. `null` means X did not report it, not zero. |
| `data.media` | array of object | Attached photos, videos, and GIFs, in display order. |
| `data.entities` | object | An object with `hashtags`, `mentions`, `urls`. |
| `data.quotedPost` | object or null | The post this one quotes, when it is a quote post. |
| `data.retweetedPost` | object or null | Set when this post is a repost. Read the original's text and counts here: X truncates a repost's own `text` to `RT @user: …`. |
| `data.article` | object or null | Set when the post is an X Article; its `text` is then only a link to it. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXPost`](https://docs.weirapp.io/reference/x/getXPost).

## Limits and caveats

- The id is the digits after `/status/` in a post's URL. Keep it as a string: it exceeds 2^53, and parsing it as a number corrupts it.
- `404` when the post does not exist, was deleted, or is not public. A `404` costs nothing.
- A batch takes 1 to 100 ids in one comma-separated `ids` value, with no spaces. Posts come back in the order requested. An id that cannot be returned is listed in `meta.notFound` instead of failing the request, and is not billed.
- The edit history lists every version of an edited post, newest first, including the current one. An empty list means the post exists and was never edited. X allows edits only in the first hour after posting.
- A post that carries an X Article has only a link as its `text`. Read `article` on the post, or use the [Articles endpoint](twitter-articles-api.md).
- X truncates the text of a repost. Read the original's full text and counts in `retweetedPost`.
- A single post and its counts can be up to 1 hour old. Weir keeps a short-lived copy of each answer, and a repeat inside that window returns the copy and is still billed.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. `GET /v1/x/posts/{id}` counts as 1 request, `GET /v1/x/posts` as 2 and `GET /v1/x/posts/{id}/edits` as 1.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Replies, quotes and reposters of a post](tweet-replies-quotes-reposters-api.md)
- [The thread a post belongs to](twitter-thread-api.md)
- [The X Article a post carries](twitter-articles-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_x_post`, `get_x_posts` and `get_x_post_edits`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Read this post and tell me how many likes and views it has: https://x.com/NASA/status/2113776971603689874"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
