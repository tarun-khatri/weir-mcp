# Get tweets by user: X (Twitter) user timeline API

`GET /v1/x/users/{user}/posts` returns an X account's own posts and reposts, newest first, by username or numeric id. Sibling endpoints return its posts together with its replies, its posts with media, and the posts it highlights. Each call costs 1 credit plus 1 credit per post returned, and the first page adds 2 credits for the profile lookup that finds the account.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/users/{user}/posts` | Get a public X user timeline | Timeline posts, in X's own field names | 1 per call + 2 per X profile + 1 per X post | `get_x_user_posts` |
| `GET /v1/x/users/{user}/replies` | Get an X account's posts and replies | Posts and replies, newest first | 1 per call + 2 per X profile + 1 per X post | `get_x_user_replies` |
| `GET /v1/x/users/{user}/media` | Get an X account's posts with media | Posts with media, newest first | 1 per call + 2 per X profile + 1 per X post | `get_x_user_media` |
| `GET /v1/x/users/{user}/highlights` | Get the posts an X account highlights | Highlighted posts | 1 per call + 2 per X profile + 1 per X post | `get_x_user_highlights` |

Prices are per successful call. A failed or refused call costs nothing. The 2 credits per X profile pay for the lookup that finds the account. They are charged on the first page only: later pages carry the account in the cursor.

## Parameters of `GET /v1/x/users/{user}/posts`

`user` goes in the path and the others go in the query string.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `user` | path | string | yes | A username, with or without the `@`, or a numeric account id. An all-digit value is read as an id. |
| `limit` | query | integer | no | Most posts to return. X may return fewer. 1 to 20. Default `20`. |
| `cursor` | query | string | no | Opaque cursor from the previous page's `meta.nextCursor`. Pass it back unchanged, with the same path and query parameters; a cursor from another request is rejected with 400. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/x/users/{user}/replies` | `user` (path, required), `limit` (query), `cursor` (query) |
| `GET /v1/x/users/{user}/media` | `user` (path, required), `limit` (query), `cursor` (query) |
| `GET /v1/x/users/{user}/highlights` | `user` (path, required), `limit` (query), `cursor` (query) |

Types and limits of each are in the reference: [`getXUserReplies`](https://docs.weirapp.io/reference/x/getXUserReplies), [`getXUserMedia`](https://docs.weirapp.io/reference/x/getXUserMedia), [`getXUserHighlights`](https://docs.weirapp.io/reference/x/getXUserHighlights).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/x/users/NASA/posts?limit=20' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.parse
import urllib.request

url = "https://api.weirapp.io/v1/x/users/NASA/posts"
url += "?" + urllib.parse.urlencode({"limit": 20})
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
    print(post["createdAt"], post["likeCount"], post["url"])
print("credits charged:", charged)
print("next cursor:", page["meta"].get("nextCursor"))
```

## Response fields you will use most

`GET /v1/x/users/{user}/posts` answers `200` with a `data` array and a `meta` object. Timeline posts, in X's own field names.

| Field | Type | Meaning |
| --- | --- | --- |
| `data[].id` | string | Numeric post id, as a string. It exceeds 2^53. |
| `data[].text` | string | Full post text, untruncated. |
| `data[].url` | string | Link to the post on x.com. |
| `data[].createdAt` | string (date-time) | When it was posted. |
| `data[].lang` | string or null | BCP-47 language tag detected by X. |
| `data[].author` | object | An object with `id`, `username`, `name`, `verified`, `followersCount`, `profileImageUrl`. |
| `data[].likeCount`, `retweetCount`, `replyCount`, `quoteCount`, `viewCount`, `bookmarkCount` | integer or null | Counts as X reports them. `null` means X did not report it, not zero. |
| `data[].media` | array of object | Attached photos, videos, and GIFs, in display order. |
| `data[].entities` | object | An object with `hashtags`, `mentions`, `urls`. |
| `data[].quotedPost` | object or null | The post this one quotes, when it is a quote post. |
| `data[].retweetedPost` | object or null | Set when this post is a repost. Read the original's text and counts here: X truncates a repost's own `text` to `RT @user: …`. |
| `data[].article` | object or null | Set when the post is an X Article; its `text` is then only a link to it. |
| `meta.nextCursor` | string or null | Cursor for the next page. `null` means there is no next page. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXUserPosts`](https://docs.weirapp.io/reference/x/getXUserPosts).

## Limits and caveats

- X keeps only the newest 800 or so posts on an account's Posts tab. Where they end, `data` is empty and `meta.nextCursor` is `null`.
- `GET /v1/x/users/{user}/replies` reaches further: X keeps the newest 3,200 posts and replies there.
- For anything older, use [search](twitter-search-api.md) with `fromUsers` and `untilId` set to the oldest post id you already have.
- `limit` is at most 20 on all four endpoints, and X may return fewer. With `limit=20` a full first page costs 23 credits and each later page 21 credits.
- A pinned post comes first, on the first page only. While you page, each page is filled up to `limit` from the next one X serves, so a short page before the end is rare.
- A protected account returns `404`: its posts and connections are visible only to accounts it approved. An account that does not exist is also `404`.
- Only accounts with X Premium can highlight posts, so `GET /v1/x/users/{user}/highlights` returns an empty list for other accounts.
- On `GET /v1/x/users/{user}/media`, the media URLs are in each post's `media`.
- X truncates the text of a repost. Read the original's full text and counts in `retweetedPost`.
- Timelines can be up to 10 minutes old. Weir keeps a short-lived copy of each answer, and a repeat inside that window returns the copy and is still billed.
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. Each call here counts as 2 requests.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Search, for posts older than a timeline reaches](twitter-search-api.md)
- [Profile lookup](twitter-user-lookup-api.md)
- [Pagination guide](../guides/pagination.md)
- Worked example in Python, Node.js and cURL: https://docs.weirapp.io/examples/x-user-posts

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_x_user_posts`, `get_x_user_replies`, `get_x_user_media` and `get_x_user_highlights`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Read the last 20 posts from @NASA and tell me which got the most likes."

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
