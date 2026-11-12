# Tweet replies, quotes and reposters API

Three endpoints read the conversation around one X (Twitter) post. `GET /v1/x/posts/{id}/replies` returns the replies under it, `GET /v1/x/posts/{id}/quotes` returns the posts that quote it, and `GET /v1/x/posts/{id}/retweeters` returns the accounts that reposted it. Each call costs 1 credit plus 1 credit per reply, quote post or account returned.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/posts/{id}/replies` | Get replies to an X post | Replies, in X's own field names | 1 per call + 1 per X post | `get_x_replies` |
| `GET /v1/x/posts/{id}/quotes` | Get posts quoting an X post | Quote posts, in X's own field names | 1 per call + 1 per X post | `get_x_quotes` |
| `GET /v1/x/posts/{id}/retweeters` | Get accounts that reposted an X post | Accounts that reposted the post | 1 per call + 1 per X account listed | `get_x_retweeters` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/x/posts/{id}/replies`

`id` goes in the path and the others go in the query string.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `id` | path | string | yes | Numeric post id: the digits after `/status/` in a post's URL. |
| `cursor` | query | string | no | Opaque cursor from the previous page's `meta.nextCursor`. Pass it back unchanged, with the same path and query parameters; a cursor from another request is rejected with 400. |
| `sort` | query | string | no | `latest` is newest first; `relevance` and `likes` are X's own rankings, so `likes` is close to, but not strictly, highest `likeCount` first. One of `latest`, `relevance`, `likes`. Default `latest`. |
| `limit` | query | integer | no | Most replies to return. X serves 30 to 40 a page; the rest of the page comes next, through `meta.nextCursor`. 100 returns X's whole page. 1 to 100. Default `20`. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/x/posts/{id}/quotes` | `id` (path, required), `sort` (query), `limit` (query), `cursor` (query) |
| `GET /v1/x/posts/{id}/retweeters` | `id` (path, required), `limit` (query), `cursor` (query) |

Types and limits of each are in the reference: [`getXQuotes`](https://docs.weirapp.io/reference/x/getXQuotes), [`getXRetweeters`](https://docs.weirapp.io/reference/x/getXRetweeters).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/x/posts/2113776971603689874/replies?sort=likes&limit=20' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.parse
import urllib.request

url = "https://api.weirapp.io/v1/x/posts/2113776971603689874/replies"
url += "?" + urllib.parse.urlencode({"sort": "likes", "limit": 20})
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

for reply in page["data"]:
    print(reply["likeCount"], reply["author"]["username"], reply["url"])
print("credits charged:", charged)
print("next cursor:", page["meta"].get("nextCursor"))
```

## Response fields you will use most

`GET /v1/x/posts/{id}/replies` answers `200` with a `data` array and a `meta` object. Replies, in X's own field names.

| Field | Type | Meaning |
| --- | --- | --- |
| `data[].id` | string | Numeric post id, as a string. It exceeds 2^53. |
| `data[].text` | string | Full post text, untruncated. |
| `data[].url` | string | Link to the post on x.com. |
| `data[].createdAt` | string (date-time) | When it was posted. |
| `data[].lang` | string or null | BCP-47 language tag detected by X. |
| `data[].author` | object | An object with `id`, `username`, `name`, `verified`, `followersCount`, `profileImageUrl`. |
| `data[].likeCount`, `retweetCount`, `replyCount`, `quoteCount`, `viewCount`, `bookmarkCount` | integer or null | Counts as X reports them. `null` means X did not report it, not zero. |
| `data[].conversationId` | string or null | The thread this post belongs to. |
| `data[].inReplyToId` | string or null | The post this one replies to, or `null`. |
| `data[].quotedPost` | object or null | The post this one quotes, when it is a quote post. |
| `meta.nextCursor` | string or null | Cursor for the next page. `null` means there is no next page. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXReplies`](https://docs.weirapp.io/reference/x/getXReplies).

## Limits and caveats

- Replies include replies to replies. The post itself, the posts above it and promoted posts are left out.
- X serves 30 to 40 replies a page. `limit` defaults to 20, and `limit=100` returns X's whole page.
- `sort` takes `latest`, `relevance` or `likes`. The last two are X's own rankings, so `likes` is close to, but not strictly, highest `likeCount` first.
- Each quote post carries the post it quotes as `quotedPost`. On quotes, `limit` is at most 20.
- Reposters come as X lists them, and X may cap the list for very widely reposted posts. Who liked a post is not available: X made likes private.
- For the author's own continuation of a post, use the [thread endpoint](twitter-thread-api.md).
- The id is the digits after `/status/` in a post's URL. Keep it as a string: it exceeds 2^53, and parsing it as a number corrupts it.
- Replies can be up to 10 minutes old, and quotes up to 3 minutes. Weir keeps a short-lived copy of each answer, and a repeat inside that window returns the copy and is still billed.
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. `GET /v1/x/posts/{id}/replies` counts as 2 requests, `GET /v1/x/posts/{id}/quotes` as 2 and `GET /v1/x/posts/{id}/retweeters` as 3.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [The author's whole thread](twitter-thread-api.md)
- [The post itself, by id](tweet-lookup-api.md)
- [A monitor that reports new replies to one post](monitors-webhooks-api.md)
- Worked example in Python, Node.js and cURL: https://docs.weirapp.io/examples/x-post-replies

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_x_replies`, `get_x_quotes` and `get_x_retweeters`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Read the replies to this post and group the main reactions: https://x.com/NASA/status/2113776971603689874"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
