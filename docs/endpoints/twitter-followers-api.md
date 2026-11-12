# Twitter followers API and following API

`GET /v1/x/users/{user}/followers` returns the accounts that follow an X (Twitter) account, and `GET /v1/x/users/{user}/following` returns the accounts it follows. Each account comes back as a full profile: username, name, bio, follower and following counts and verified flag. A call costs 1 credit plus 1 credit per account returned, and the first page adds 2 credits for the profile lookup, so a first page of about 70 followers costs about 73 credits.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/users/{user}/followers` | Get an X account's followers | Followers, in X's order | 1 per call + 2 per X profile + 1 per X account listed | `get_x_user_followers` |
| `GET /v1/x/users/{user}/following` | Get the accounts an X account follows | Followed accounts, in X's order | 1 per call + 2 per X profile + 1 per X account listed | `get_x_user_following` |
| `GET /v1/x/users/{user}/affiliates` | Get an organisation's affiliated X accounts | Affiliated accounts | 1 per call + 2 per X profile + 1 per X account listed | `get_x_user_affiliates` |
| `GET /v1/x/users/{user}/subscriptions` | Get the creators an X account subscribes to | Subscribed-to creators | 1 per call + 2 per X profile + 1 per X account listed | `get_x_user_subscriptions` |

Prices are per successful call. A failed or refused call costs nothing. The 2 credits per X profile pay for the lookup that finds the account. They are charged on the first page only: later pages carry the account in the cursor.

## Parameters of `GET /v1/x/users/{user}/followers`

`user` goes in the path and the others go in the query string.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `user` | path | string | yes | A username, with or without the `@`, or a numeric account id. An all-digit value is read as an id. |
| `cursor` | query | string | no | Opaque cursor from the previous page's `meta.nextCursor`. Pass it back unchanged, with the same path and query parameters; a cursor from another request is rejected with 400. |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/x/users/{user}/following` | `user` (path, required), `cursor` (query) |
| `GET /v1/x/users/{user}/affiliates` | `user` (path, required), `limit` (query), `cursor` (query) |
| `GET /v1/x/users/{user}/subscriptions` | `user` (path, required), `limit` (query), `cursor` (query) |

Types and limits of each are in the reference: [`getXUserFollowing`](https://docs.weirapp.io/reference/x/getXUserFollowing), [`getXUserAffiliates`](https://docs.weirapp.io/reference/x/getXUserAffiliates), [`getXUserSubscriptions`](https://docs.weirapp.io/reference/x/getXUserSubscriptions).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/x/users/XDevelopers/followers' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/x/users/XDevelopers/followers"
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
    print(account["username"], account["followersCount"], account["verified"])
print("credits charged:", charged)
print("next cursor:", page["meta"].get("nextCursor"))
```

## Response fields you will use most

`GET /v1/x/users/{user}/followers` answers `200` with a `data` array and a `meta` object. Followers, in X's order.

| Field | Type | Meaning |
| --- | --- | --- |
| `data[].id` | string | The numeric account id, as a string. |
| `data[].username` | string | Handle without the `@` prefix. |
| `data[].name` | string | Display name. |
| `data[].description` | string or null | The bio, or `null`. |
| `data[].location` | string or null | The location the profile shows, or `null`. |
| `data[].verified` | boolean | Whether the account is verified. |
| `data[].followersCount`, `followingCount`, `statusesCount` | integer | Followers, accounts followed, and posts published. |
| `data[].createdAt` | string (date-time) | When the account was created. |
| `data[].protected` | boolean | True when only approved followers can see this account's posts. Its posts, replies, media, and relationship lists are then not available through this API. |
| `data[].pinnedPostIds` | array of string | Ids of the posts pinned to the top of the profile, usually zero or one. |
| `meta.nextCursor` | string or null | Cursor for the next page. `null` means there is no next page. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXUserFollowers`](https://docs.weirapp.io/reference/x/getXUserFollowers).

## Limits and caveats

- X chooses the page size, about 70 accounts, so followers and following take no `limit`. Page with `cursor` until `meta.nextCursor` is `null`.
- 1,000 followers take about 15 calls and cost about 1,017 credits: 15 for the calls, 2 for the profile lookup and 1,000 for the accounts. That is about $0.102 to $0.203, depending on the credit pack.
- Accounts come in the order X lists them: mostly most recent first, though X can place some accounts out of that order.
- A protected account returns `404`: its posts and connections are visible only to accounts it approved. An account that does not exist is also `404`.
- `GET /v1/x/users/{user}/affiliates` lists the accounts a Verified Organization names as affiliated with it. It is empty for accounts that are not Verified Organizations.
- `GET /v1/x/users/{user}/subscriptions` lists the creators an account pays to subscribe to, where it has not hidden them. It is often empty.
- Follower and following lists can be up to 30 minutes old. Weir keeps a short-lived copy of each answer, and a repeat inside that window returns the copy and is still billed.
- **Paging.** Send `meta.nextCursor` back as `cursor`, with every other parameter unchanged. `meta.nextCursor: null` is the only stop condition: a page can come back empty with more results behind it.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. `GET /v1/x/users/{user}/followers` counts as 3 requests, `GET /v1/x/users/{user}/following` as 3, `GET /v1/x/users/{user}/affiliates` as 2 and `GET /v1/x/users/{user}/subscriptions` as 2.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Profile lookup, for the follower count alone](twitter-user-lookup-api.md)
- [List members](twitter-lists-api.md)
- [Pricing](../pricing.md)
- Worked example in Python, Node.js and cURL: https://docs.weirapp.io/examples/x-followers

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_x_user_followers`, `get_x_user_following`, `get_x_user_affiliates` and `get_x_user_subscriptions`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Who are the newest followers of @XDevelopers? Show the ones with the most followers."

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
