# Twitter (X) search API

`POST /v1/x/search` searches public X (Twitter) posts by keyword, phrase, account, hashtag, language, date and engagement. It returns the matching posts in X's own field names, each with its author, text, counts, media and links. It costs 1 credit per call plus 1 credit per post returned: about $0.105 to $0.21 per 1,000 posts at about 20 posts a page, depending on the credit pack.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `POST /v1/x/search` | Search public X posts with composable filters | X posts, in X's own field names | 1 per call + 1 per X post | `search_x` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `POST /v1/x/search`

These go in a JSON body.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `query` | body | string | no | Words that must all appear, in any order. X search operators pass through as typed, so filters without a field of their own work here: `filter:media`, `url:example.com`, `conversation_id:123`, `-filter:replies`. A full-width colon or minus after an operator name (`filter：videos`) is read as the plain one. Up to 200 characters. |
| `phrase` | body | string | no | An exact phrase that must appear. Up to 200 characters. |
| `anyWords` | body | array of string | no | At least one of these words must appear. Up to 20 items. |
| `excludeWords` | body | array of string | no | None of these words may appear. Up to 20 items. |
| `hashtags` | body | array of string | no | Posts carrying any of these hashtags, with or without the `#` (a full-width `＃` works too). X also matches posts that only have the words, so those are left out: a page can come back with fewer posts than `limit`, and `meta.nextCursor` still leads on. Up to 10 items. |
| `fromUsers` | body | array of string | no | Posted by any of these usernames. Up to 10 items. |
| `toUsers` | body | array of string | no | Replying to any of these usernames. Up to 10 items. |
| `mentions` | body | array of string | no | Mentioning any of these usernames. Up to 10 items. |
| `language` | body | string | no | Language X detected, as a BCP-47 tag such as `en`. Indonesian (`id`) and Hebrew (`he`) are searched by the codes X still uses, `in` and `iw`, which is also what posts carry in `lang`. A region is dropped: `pt-BR` searches Portuguese. Up to 12 characters. |
| `minLikes` | body | integer | no | At least this many likes. |
| `minReplies` | body | integer | no | At least this many replies. |
| `minReposts` | body | integer | no | At least this many reposts. |
| `onlyLinks` | body | boolean | no | Only posts containing a link. |
| `onlyOriginal` | body | boolean | no | Exclude replies. |
| `onlyReplies` | body | boolean | no | Only replies. |
| `onlyText` | body | boolean | no | Exclude posts with links. |
| `since` | body | string (date-time) | no | Posted at or after this instant: ISO 8601 with `Z` or an offset, such as `2026-10-22T00:00:00+09:00`. Exact to the millisecond. |
| `until` | body | string (date-time) | no | Posted before this instant: ISO 8601 with `Z` or an offset. |
| `quotedPostId` | body | string | no | Only posts quoting this post. `GET /v1/x/posts/{id}/quotes` is the dedicated endpoint for this. |
| `listId` | body | string | no | Only posts by members of this public List. |
| `sinceId` | body | string | no | Only posts newer than this post id, exclusive. The way to resume a feed: pass the newest id already seen. |
| `untilId` | body | string | no | Only posts older than this post id, exclusive. |
| `sort` | body | string | no | `latest` is newest first; `top` is X's own engagement ranking. One of `latest`, `top`. Default `latest`. |
| `limit` | body | integer | no | Most posts to return. X serves about 20 per page at most. 1 to 100. Default `25`. |
| `cursor` | body | string | no | Opaque cursor from the previous page's `meta.nextCursor`. Pass it back unchanged, with the same path and query parameters; a cursor from another request is rejected with 400. |

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request POST \
  --url 'https://api.weirapp.io/v1/x/search' \
  --header "Authorization: Bearer $WEIR_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"query":"moon","fromUsers":["NASA"],"sort":"latest","limit":20}'
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/x/search"
body = {"query": "moon", "fromUsers": ["NASA"], "sort": "latest", "limit": 20}
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
    print(post["createdAt"], post["author"]["username"], post["likeCount"], post["url"])
print("credits charged:", charged)
print("next cursor:", page["meta"].get("nextCursor"))
```

## Response fields you will use most

`POST /v1/x/search` answers `200` with a `data` array and a `meta` object. X posts, in X's own field names.

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

Every field, with its type, is in the reference: [`searchX`](https://docs.weirapp.io/reference/x/searchX).

## Limits and caveats

- At least one of `query`, `phrase`, `hashtags`, `fromUsers`, `toUsers`, `mentions`, `listId` or `quotedPostId` is required. Every filter narrows the result.
- X serves about 20 posts a page at most, so a higher `limit` still returns about 20. 100 posts take about five calls and cost about 105 credits.
- A cursor is bound to the exact request it came from. Change any filter and the call returns `400`, so a changed search starts again without a cursor.
- X search operators pass through `query` as typed, such as `filter:media` or `-filter:replies`. The operators are listed at https://weirapp.io/x-search-operators.
- To read only what is new, pass the newest post id you already have as `sinceId`. To walk back in time, pass the oldest as `untilId`.
- X search does not return every post. To read one account's recent posts in order, use the [user timeline endpoints](twitter-user-timeline-api.md).
- X truncates the text of a repost. Read the original's full text and counts in `retweetedPost`.
- Search results can be up to 3 minutes old. Weir keeps a short-lived copy of each answer, and a repeat inside that window returns the copy and is still billed.
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. A call here counts as 2 requests.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Get tweets by user](twitter-user-timeline-api.md)
- [Replies, quotes and reposters of one post](tweet-replies-quotes-reposters-api.md)
- [Pagination guide](../guides/pagination.md)
- Worked example in Python, Node.js and cURL: https://docs.weirapp.io/examples/search-x-posts

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tool for this page is `search_x`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Find the latest posts from @NASA about the Moon and list them with links."

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
