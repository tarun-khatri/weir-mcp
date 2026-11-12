# X (Twitter) account location: About this account API

`GET /v1/x/users/{user}/about` returns what X shows under "About this account": the country X attributes the account to, how it connects to X, how many times its username has changed, and identity verification. It is useful for judging whether an account is what it claims to be. A lookup by username costs 3 credits (1 for the call and 2 for the profile), and 5 when `{user}` is a numeric id.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/users/{user}/about` | Get an X account's "About this account" details | The account's about details | 1 per call + 2 per X profile | `get_x_user_about` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/x/users/{user}/about`

`user` goes in the path.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `user` | path | string | yes | A username, with or without the `@`, or a numeric account id. An all-digit value is read as an id. |

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/x/users/NASA/about' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/x/users/NASA/about"
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

account = page["data"]
print(account["username"], (account["aboutProfile"] or {}).get("accountBasedIn"), (account["aboutProfile"] or {}).get("source"), account["createdAt"])
print("credits charged:", charged)
```

## Response fields you will use most

`GET /v1/x/users/{user}/about` answers `200` with a `data` object and a `meta` object. The account's about details.

| Field | Type | Meaning |
| --- | --- | --- |
| `data.username` | string | Handle without the `@` prefix. |
| `data.createdAt` | string (date-time) | When the account was created. |
| `data.aboutProfile.accountBasedIn` | string or null | The country X attributes the account to. |
| `data.aboutProfile.locationAccurate` | boolean or null | Whether X considers `accountBasedIn` accurate. |
| `data.aboutProfile.source` | string or null | How the account connects to X, in X's own words, such as an app store. |
| `data.aboutProfile.usernameChanges` | object | An object with `count`, `lastChangedAt`. |
| `data.verificationInfo` | object or null | An object with `isIdentityVerified`, `verifiedSince`. |
| `data.profileImageShape` | string or null | `Circle` for people, `Square` for organisations, `Hexagon` for some others. |
| `data.verified` | boolean | Whether the account is verified. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXUserAbout`](https://docs.weirapp.io/reference/x/getXUserAbout).

## Limits and caveats

- `aboutProfile.accountBasedIn` is the country X attributes the account to, and `aboutProfile.locationAccurate` says whether X considers it accurate. Both are X's own statements, not Weir's.
- `aboutProfile` and `verificationInfo` can be `null`, so check before reading inside them.
- `404` when the account does not exist, or is protected.
- A numeric id costs one more profile lookup, so pass the username when you have it.
- A free browser tool does the same check for up to 10 accounts at a time: https://weirapp.io/tools/x-account-location-checker
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. A call here counts as 1 request.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Profile lookup](twitter-user-lookup-api.md)
- [Followers and following](twitter-followers-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tool for this page is `get_x_user_about`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Where does X say @NASA is based, and has the account changed its username?"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
