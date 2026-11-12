# Account, usage and limits API

Three free endpoints tell an API key about itself. `GET /v1/usage` returns the credit balance, what is held by calls still in flight and what is left of the month's free grant, `GET /v1/limits` returns the rate limit and the monitor and webhook ceilings of the account's tier, and `GET /v1/whoami` returns the account and scopes behind the key. They never cost credits, and they stay reachable when the account is out of credits.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/usage` | Credit balance, holds, and this month's free grant | The account's credits | Free | `get_usage` |
| `GET /v1/limits` | Ceilings imposed by the account's tier | Tier limits | Free | `get_limits` |
| `GET /v1/whoami` | Identify the account and scopes behind this key | Authenticated API identity | Free | `get_identity` |
| `GET /health` | Liveness check | Service is alive | Free, not metered | none |
| `GET /ready` | Readiness check | Dependencies are ready | Free, not metered | none |

Every endpoint on this page is free.

## Parameters of `GET /v1/usage`

This endpoint takes no parameters.

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/limits` | none |
| `GET /v1/whoami` | none |
| `GET /health` | none |
| `GET /ready` | none |

Types and limits of each are in the reference: [`getLimits`](https://docs.weirapp.io/reference/account/getLimits), [`getIdentity`](https://docs.weirapp.io/reference/account/getIdentity), [`getHealth`](https://docs.weirapp.io/reference/system/getHealth), [`getReadiness`](https://docs.weirapp.io/reference/system/getReadiness).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request GET \
  --url 'https://api.weirapp.io/v1/usage' \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/usage"
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
except urllib.error.HTTPError as error:
    # The body is Weir's JSON error: code, message and retryable.
    raise SystemExit(f"{error.code}: {json.load(error)['error']['message']}")

usage = page["data"]
print(usage["available"], usage["balance"], usage["reserved"], usage["tier"])
```

## Response fields you will use most

`GET /v1/usage` answers `200` with a `data` object and a `meta` object. The account's credits.

| Field | Type | Meaning |
| --- | --- | --- |
| `data.balance` | integer | Credits the account holds: what is left of this month's free grant plus everything bought. Purchased credits never expire. |
| `data.reserved` | integer | Credits held by this account's calls still in flight. Each is charged what it returned and gives the rest back when it finishes. |
| `data.available` | integer | balance minus reserved. A billed call is admitted while this covers its minimum charge; below that, calls return 402 until credits are added. |
| `data.freeGrant` | object or null | This month's free credits, which are spent before anything bought and do not roll over. Null for a workspace that does not receive them: each person's oldest workspace does. |
| `data.freeGrant.resetsAt` | string (date-time) | When this month's free credits expire and next month's arrive. |
| `data.tier` | string | Raised by lifetime credit purchases, net of refunds: free, then t1 from $5, t2 from $100, t3 from $500. Spending and time never lower it. |
| `data.spendingPaused` | boolean | True while a refund or payment dispute on the account is resolved. Billed calls return 402 until then; free calls still work. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getUsage`](https://docs.weirapp.io/reference/account/getUsage).

### Limits by tier

`GET /v1/limits` returns the row that applies to the account.

| Tier | Lifetime purchases | Requests a minute | Monitors | Webhooks | Hourly monitors |
| --- | --- | --- | --- | --- | --- |
| Free | $0 | 30 | 1 | 1 | No |
| Tier 1 | $5 | 120 | 10 | 5 | Yes |
| Tier 2 | $100 | 300 | 50 | 25 | Yes |
| Tier 3 | $500 | 600 | 200 | 100 | Yes |

## Limits and caveats

- These three endpoints answer any valid key, whatever its scopes, so a key can always find out why it is being refused.
- `available` is `balance` minus `reserved`. A billed call is admitted while `available` covers its minimum charge. Below that, calls return `402` until credits are added.
- The free grant is 5,000 credits a month. It is spent before anything bought and does not roll over, and `freeGrant.resetsAt` says when the next one arrives.
- The tier follows lifetime purchases, net of refunds: `free`, then `t1` from $5, `t2` from $100 and `t3` from $500. Spending credits and time never lower it.
- Every metered response also reports `x-credits-charged`, `x-credits-remaining`, `ratelimit-limit`, `ratelimit-remaining` and `ratelimit-reset` in its headers.
- `GET /health` and `GET /ready` are liveness and readiness checks. They need no key, are not metered and are not MCP tools.
- A missing, malformed, revoked or expired key is `401`. A valid key that lacks a scope is `403`.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. Each call here counts as 1 request.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X (Twitter) or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Pricing and credit packs](../pricing.md)
- [Billing and credits guide](../guides/billing.md)
- [Authentication and scopes](../guides/authentication.md)
- [Errors and rate limits](../guides/errors.md)
- Worked example in Python, Node.js and cURL: https://docs.weirapp.io/examples/check-usage

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tools for this page are `get_usage`, `get_limits` and `get_identity`. `GET /health` and `GET /ready` are not tools. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "What's my Weir usage?"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
