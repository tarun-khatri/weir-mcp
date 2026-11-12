# Reddit user API

`GET /v1/reddit/users/{username}` returns a Reddit account's public profile: karma, account age, moderator and Premium status, and the profile's bio and follower count. Two sibling endpoints list the posts the account has submitted and the comments it has made, newest first by default. The profile costs 2 credits a lookup, and each post or comment costs 3 credits plus 1 credit per call.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/reddit/users/{username}` | Get a Reddit account's public profile | The profile, in Reddit's own field names | 1 per call + 1 per Reddit user | `get_reddit_user` |
| `GET /v1/reddit/users/{username}/posts` | List the posts an account has submitted | Posts, in Reddit's own field names | 1 per call + 3 per Reddit post | `get_reddit_user_posts` |
| `GET /v1/reddit/users/{username}/comments` | List the comments an account has made | Comments, in Reddit's own field names | 1 per call + 3 per Reddit comment | `get_reddit_user_comments` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/reddit/users/{username}`

`username` goes in the path.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `username` | path | string | yes | Username without the `u/` prefix. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/reddit/users/{username}/posts` | `username` (path, required), `sort` (query), `time` (query), `includeNsfw` (query), `limit` (query), `cursor` (query) |
| `GET /v1/reddit/users/{username}/comments` | `username` (path, required), `sort` (query), `time` (query), `includeNsfw` (query), `limit` (query), `cursor` (query) |

Types and limits of each are in the reference: [`getRedditUserPosts`](https://docs.weirapp.io/reference/reddit/getRedditUserPosts), [`getRedditUserComments`](https://docs.weirapp.io/reference/reddit/getRedditUserComments).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
export REDDIT_USER="..."   # the account's name, without u/
curl --request GET \
  --url "https://api.weirapp.io/v1/reddit/users/$REDDIT_USER" \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

reddit_user = os.environ["REDDIT_USER"]  # the account's name, without u/
url = f"https://api.weirapp.io/v1/reddit/users/{reddit_user}"
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

user = page["data"]
print(user["name"], user["totalKarma"], user["createdAt"], user["isMod"])
print("credits charged:", charged)
```

## Response fields you will use most

`GET /v1/reddit/users/{username}` answers `200` with a `data` object and a `meta` object. The profile, in Reddit's own field names.

| Field | Type | Meaning |
| --- | --- | --- |
| `data.name` | string | Username without the `u/` prefix. |
| `data.id` | string or null | Base-36 account id without `t2_`. Null for a suspended account. |
| `data.isSuspended` | boolean | Suspended by Reddit: the profile shows nothing else. |
| `data.createdAt` | string or null | When the account was created, or `null` for a suspended account. |
| `data.linkKarma` | integer or null | Karma from posts. |
| `data.commentKarma` | integer or null | Karma from comments. |
| `data.totalKarma` | integer or null | Total karma. |
| `data.isMod` | boolean or null | Moderates at least one community. |
| `data.isGold` | boolean or null | Has Reddit Premium. |
| `data.isEmployee` | boolean or null | A Reddit employee. |
| `data.url` | string | Absolute URL of the profile. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getRedditUser`](https://docs.weirapp.io/reference/reddit/getRedditUser).

## Limits and caveats

- A suspended account is returned with `isSuspended: true` and its counters `null`, because that is all Reddit shows. An account that does not exist is a `404`.
- On the posts and comments endpoints, a suspended account is a `404` with `details.reason` `suspended`.
- Reddit lets people hide some or all of their activity from their profile. An empty page for an account with karma usually means hidden, not inactive.
- Pages stop at about 1,000 items, Reddit's own ceiling.
- `time` applies to the `top` and `controversial` orderings only.
- Each comment carries the post it belongs to in `linkTitle` and `linkPermalink`.
- To be told when an account posts, create a `reddit_user` [monitor](monitors-webhooks-api.md) instead of polling.
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. `GET /v1/reddit/users/{username}` counts as 1 request, `GET /v1/reddit/users/{username}/posts` as 2 and `GET /v1/reddit/users/{username}/comments` as 2.
- **When Reddit is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X (Twitter) or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Search Reddit posts](reddit-search-api.md)
- [One post and its comments](reddit-post-comments-api.md)
- [Watch one Reddit account](monitors-webhooks-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_reddit_user`, `get_reddit_user_posts` and `get_reddit_user_comments`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Look up this Reddit account: how old is it, how much karma does it have, and what does it post about? (give the username)"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
