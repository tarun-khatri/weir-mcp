# X (Twitter) Lists API

Three endpoints read a public X List by its numeric id. `GET /v1/x/lists/{id}` returns its name, description, owner and member and follower counts, `GET /v1/x/lists/{id}/members` returns the accounts in it, and `GET /v1/x/lists/{id}/posts` returns recent posts from its members, newest first. Each call costs 1 credit, plus 2 credits for the List record, 1 credit per member or 1 credit per post returned.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/lists/{id}` | Get a public X List | One X List | 1 per call + 2 per X List | `get_x_list` |
| `GET /v1/x/lists/{id}/members` | Get the members of a public X List | Accounts in the List | 1 per call + 1 per X account listed | `get_x_list_members` |
| `GET /v1/x/lists/{id}/posts` | Get the timeline of a public X List | Posts from the List's members, newest first | 1 per call + 1 per X post | `get_x_list_posts` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/x/lists/{id}/members`

`id` goes in the path and the others go in the query string.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `id` | path | string | yes | Numeric List id: the digits after `/i/lists/` in a List's URL. |
| `limit` | query | integer | no | Most accounts to return. X may return fewer. 1 to 100. Default `20`. |
| `cursor` | query | string | no | Opaque cursor from the previous page's `meta.nextCursor`. Pass it back unchanged, with the same path and query parameters; a cursor from another request is rejected with 400. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/x/lists/{id}` | `id` (path, required) |
| `GET /v1/x/lists/{id}/posts` | `id` (path, required), `cursor` (query) |

Types and limits of each are in the reference: [`getXList`](https://docs.weirapp.io/reference/x/getXList), [`getXListPosts`](https://docs.weirapp.io/reference/x/getXListPosts).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
export LIST_ID="..."   # the digits after /i/lists/ in the List's URL
curl --request GET \
  --url "https://api.weirapp.io/v1/x/lists/$LIST_ID/members?limit=20" \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.parse
import urllib.request

list_id = os.environ["LIST_ID"]  # the digits after /i/lists/ in the List's URL
url = f"https://api.weirapp.io/v1/x/lists/{list_id}/members"
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

for account in page["data"]:
    print(account["username"], account["name"], account["followersCount"])
print("credits charged:", charged)
print("next cursor:", page["meta"].get("nextCursor"))
```

## Response fields you will use most

`GET /v1/x/lists/{id}/members` answers `200` with a `data` array and a `meta` object. Accounts in the List.

| Field | Type | Meaning |
| --- | --- | --- |
| `data[].id` | string | The numeric account id, as a string. |
| `data[].username` | string | Handle without the `@` prefix. |
| `data[].name` | string | Display name. |
| `data[].description` | string or null | The bio, or `null`. |
| `data[].location` | string or null | The location the profile shows, or `null`. |
| `data[].verified` | boolean | Whether the account is verified. |
| `data[].followersCount`, `followingCount`, `statusesCount` | integer | Followers, accounts followed, and posts published. |
| `meta.nextCursor` | string or null | Cursor for the next page. `null` means there is no next page. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXListMembers`](https://docs.weirapp.io/reference/x/getXListMembers).

## Limits and caveats

- The id is the digits after `/i/lists/` in a List's URL.
- `404` when the List does not exist or is private.
- Members come in X's order. `limit` defaults to 20 and goes up to 100.
- The List timeline takes no `limit`: X chooses the page size, up to about 100 posts.
- To search only the posts of a List's members, pass its id as `listId` to [search](twitter-search-api.md).
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. `GET /v1/x/lists/{id}` counts as 1 request, `GET /v1/x/lists/{id}/members` as 3 and `GET /v1/x/lists/{id}/posts` as 2.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Search inside a List with `listId`](twitter-search-api.md)
- [Followers and following](twitter-followers-api.md)
- [Profile lookup](twitter-user-lookup-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_x_list`, `get_x_list_members` and `get_x_list_posts`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "List the members of this X List with their follower counts: (paste the List's link)"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
