# X (Twitter) thread API

`GET /v1/x/posts/{id}/thread` returns the thread an X post belongs to, in reading order: the author's earlier posts it continues from, the post itself, and the author's continuation below it. Pass the id of any post in the thread. It costs 1 credit per call plus 1 credit per post returned.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/posts/{id}/thread` | Get the author's thread containing a post | The thread, first post first | 1 per call + 1 per X post | `get_x_thread` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/x/posts/{id}/thread`

`id` goes in the path.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `id` | path | string | yes | Numeric post id: the digits after `/status/` in a post's URL. |

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/x/posts/2112560726397092239/thread' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/x/posts/2112560726397092239/thread"
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
    print(post["createdAt"], post["text"])
print("credits charged:", charged)
```

## Response fields you will use most

`GET /v1/x/posts/{id}/thread` answers `200` with a `data` array and a `meta` object. The thread, first post first.

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
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXThread`](https://docs.weirapp.io/reference/x/getXThread).

## Limits and caveats

- Other people's replies are not included. Use the [replies endpoint](tweet-replies-quotes-reposters-api.md) for those.
- The thread is assembled from X's first page of the conversation. A thread long enough for X to fold behind "Show more" ends at the fold.
- One call returns the thread. There is no `limit` and no `cursor`.
- `404` when the post does not exist.
- The id is the digits after `/status/` in a post's URL. Keep it as a string: it exceeds 2^53, and parsing it as a number corrupts it.
- A thread can be up to 10 minutes old. Weir keeps a short-lived copy of each answer, and a repeat inside that window returns the copy and is still billed.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. A call here counts as 2 requests.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Other people's replies to a post](tweet-replies-quotes-reposters-api.md)
- [One post by id](tweet-lookup-api.md)
- [Long-form X Articles](twitter-articles-api.md)
- Worked example in Python, Node.js and cURL: https://docs.weirapp.io/examples/x-thread

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tool for this page is `get_x_thread`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Read this whole thread and summarise it: https://x.com/NASA/status/2112560726397092239"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
