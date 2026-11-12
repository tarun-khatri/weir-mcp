# Errors

> Part of the Weir docs for public Reddit and X (Twitter) data. Copied from https://docs.weirapp.io/errors on 12 November 2026. That page is always the current version.

Every failure has the same shape:

```json
{
  "error": {
    "code": "quota_exceeded",
    "message": "This account is out of credits. Retrying will not clear this. Free monthly credits renew on 1 December (UTC). To keep going now, $5 buys 25,000 credits that never expire: https://weirapp.io/buy",
    "retryable": false,
    "details": {
      "reason": "insufficient_credits",
      "available": 0,
      "required": 1,
      "buyUrl": "https://weirapp.io/buy",
      "smallestPack": { "priceUsd": 5, "credits": 25000 },
      "freeCreditsRenewAt": "2026-12-01T00:00:00.000Z"
    }
  },
  "meta": { "requestId": "req_01J…" }
}
```

**Branch on `retryable`**, not on a status-code list you maintain yourself.

`meta.requestId` is on every response and in the `x-request-id` header. Quote it in support
requests.

## Status codes

| Status | Code                  | Meaning                                      | Retry?                        |
| ------ | --------------------- | -------------------------------------------- | ----------------------------- |
| `400`  | `bad_request`         | Malformed. `details` names the field.        | No. Fix it.                   |
| `401`  | `unauthorized`        | Key missing, malformed, revoked, or expired. | No.                           |
| `402`  | `quota_exceeded`      | **Out of credits.**                          | **No.** See below.            |
| `403`  | `insufficient_scope`  | Key lacks a [scope](https://docs.weirapp.io/authentication#scopes). | No. Issue a key with it.      |
| `404`  | `not_found`           | No such resource, or not public.             | No.                           |
| `409`  | `conflict`            | A limit would be exceeded, such as monitors. | No. Remove one first.         |
| `413`  | `bad_request`         | Body over the size limit.                    | No.                           |
| `429`  | `rate_limit_exceeded` | **Rate limited.**                            | **Yes**, after `Retry-After`. |
| `500`  | `internal_error`      | Our fault.                                   | Yes, with backoff.            |
| `503`  | `source_unavailable`  | A platform was busy or unreachable.          | Yes, after `Retry-After`.     |
| `504`  | `timeout`             | Outlived its deadline.                       | Yes, after `Retry-After`.     |

None of these costs credits. A refused or failed call is never charged.

## `402` and `429` are opposites

Both mean "not right now". Treating them the same is the most expensive mistake against this API.

**`429` is temporary.** You are going too fast. Wait for `Retry-After` and the same request works.

**`402` is not.** The account is out of credits. It clears in two ways only: the month's free credits return on the 1st (UTC), or a person adds credits at https://weirapp.io/buy. Retrying never works. The smallest pack is $5 for 25,000
credits. A retry loop on `402` runs until you stop it and never succeeds.

The error says both ways out. `message` names the day free credits return and the price of the
smallest pack, in a sentence you can show a person as it is. `details` carries the same as fields:
`buyUrl`, `smallestPack` (`priceUsd`, `credits`) and `freeCreditsRenewAt`. An agent that hits a
`402` should stop and tell its user what the message says, link included.

`/v1/usage`, `/v1/limits`, and `/v1/whoami` stay reachable at `402`, so you can always find out why.

## Rate limits

Every metered response carries the current state:

```
ratelimit-limit: 30
ratelimit-remaining: 27
ratelimit-reset: 1800000060
```

| Header                | Meaning                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `ratelimit-limit`     | Requests allowed per minute.                                     |
| `ratelimit-remaining` | Requests left in the current window.                             |
| `ratelimit-reset`     | When the current one-minute window ends, in Unix seconds.        |
| `Retry-After`         | On a `429`, `503` or `504`: seconds to wait before trying again. |

The limit is a rolling minute, so budget frees up gradually rather than all at once at
`ratelimit-reset`. Use `Retry-After` to decide when to try again.

Endpoints are weighted by how much upstream work they do. A search counts as 2 requests and a
comment tree as 4, while a single lookup counts as 1. Each operation's
[reference page](https://docs.weirapp.io/reference/reddit/searchReddit) states its weight. It is the work being limited,
not the request count.

The free tier allows 30 requests a minute. Paid tiers allow more. `/v1/limits` returns the exact
figure for your account.

## When a platform is down

You get `503` with `source_unavailable`, and nothing is charged.

The response says when to try again, in the `Retry-After` header and as `retryAfterSeconds` in the
error's `details`. When X has said when its limit window reopens, that is the time given; otherwise
it is a short default. Retrying sooner only meets the same answer.

Each platform is its own endpoint, so one being down never affects the other. Fall back to the
other platform, or retry with backoff.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
