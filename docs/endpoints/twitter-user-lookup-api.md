# X (Twitter) user lookup API: profiles by handle or id

`GET /v1/x/users/{user}` returns one public X profile by username or numeric id: name, bio, follower, following and post counts, verified flag, creation date and pinned posts. `GET /v1/x/users` looks up as many as 100 numeric ids in one call, and `POST /v1/x/users/search` finds accounts by name, username or bio. One profile costs 3 credits (1 for the call and 2 for the profile), a full batch of 100 costs 201, and account search costs 1 credit per call plus 1 per account returned.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/users/{user}` | Get a public X profile | An X profile, in X's own field names | 1 per call + 2 per X profile | `get_x_user` |
| `GET /v1/x/users` | Get up to 100 public X profiles by id | The profiles found, in request order | 1 per call + 2 per X profile | `get_x_users` |
| `POST /v1/x/users/search` | Search X accounts | Matching accounts | 1 per call + 1 per X account listed | `search_x_users` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/x/users/{user}`

`user` goes in the path.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `user` | path | string | yes | A username, with or without the `@`, or a numeric account id. An all-digit value is read as an id. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/x/users` | `ids` (query, required) |
| `POST /v1/x/users/search` | `query` (body, required), `limit` (body), `cursor` (body) |

Types and limits of each are in the reference: [`getXUsers`](https://docs.weirapp.io/reference/x/getXUsers), [`searchXUsers`](https://docs.weirapp.io/reference/x/searchXUsers).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/x/users/NASA' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/x/users/NASA"
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
print(user["name"], user["followersCount"], user["createdAt"])
print("credits charged:", charged)
```

## Response fields you will use most

`GET /v1/x/users/{user}` answers `200` with a `data` object and a `meta` object. An X profile, in X's own field names.

| Field | Type | Meaning |
| --- | --- | --- |
| `data.id` | string | The numeric account id, as a string. |
| `data.username` | string | Handle without the `@` prefix. |
| `data.name` | string | Display name. |
| `data.description` | string or null | The bio, or `null`. |
| `data.location` | string or null | The location the profile shows, or `null`. |
| `data.verified` | boolean | Whether the account is verified. |
| `data.followersCount`, `followingCount`, `statusesCount` | integer | Followers, accounts followed, and posts published. |
| `data.createdAt` | string (date-time) | When the account was created. |
| `data.protected` | boolean | True when only approved followers can see this account's posts. Its posts, replies, media, and relationship lists are then not available through this API. |
| `data.pinnedPostIds` | array of string | Ids of the posts pinned to the top of the profile, usually zero or one. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXUser`](https://docs.weirapp.io/reference/x/getXUser).

## Limits and caveats

- `{user}` takes a username, with or without the `@`, or a numeric account id. An all-digit value is read as an id.
- A protected account's profile is public on X, so it is returned. Its posts are not.
- `404` when the account does not exist, is suspended, or is withheld in the country Weir reads from. A `404` costs nothing.
- Profiles are cached for up to 30 minutes, so the counters can trail x.com by that much.
- The batch endpoint takes numeric ids only: 1 to 100 in one comma-separated `ids` value, with no spaces. Profiles come back in the order requested, and an id that cannot be returned is listed in `meta.notFound` and not billed.
- Account search is ranked by X's people search and returns at most 20 accounts a call. Use it to turn a person or brand name into a username.
- Where X says an account is based is on a separate endpoint: [About this account](twitter-account-location-api.md).
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. `GET /v1/x/users/{user}` counts as 1 request, `GET /v1/x/users` as 2 and `POST /v1/x/users/search` as 2.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Account location and username changes](twitter-account-location-api.md)
- [Followers and following](twitter-followers-api.md)
- [An account's posts](twitter-user-timeline-api.md)
- Worked example in Python, Node.js and cURL: https://docs.weirapp.io/examples/x-profile

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_x_user`, `get_x_users` and `search_x_users`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "How many followers does @github have on X, and when was the account created?"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
