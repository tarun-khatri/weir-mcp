# Monitors and webhooks

> Part of the Weir docs for public Reddit and X (Twitter) data. Copied from https://docs.weirapp.io/monitors on 12 November 2026. That page is always the current version.

A monitor watches something on a schedule and reports only what is new.

```bash
curl --request POST \
  --url https://api.weirapp.io/v1/monitors \
  --header "Authorization: Bearer $WEIR_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Checkout complaints",
    "target": {
      "kind": "search",
      "query": "checkout failing",
      "sources": ["reddit", "x"]
    },
    "schedule": "daily"
  }'
```

## What you can watch

`target.kind` decides what a monitor polls.

| Kind | Watches | Fields |
| --- | --- | --- |
| `search` | A phrase, across sources | `query`, `sources` |
| `subreddit` | One community's new posts | `subreddit`, optional `query`, optional `includeNsfw` |
| `subreddit_comments` | One community's new comments | `subreddit`, optional `query`, optional `includeNsfw` |
| `reddit_user` | One Reddit account's posts and comments | `username`, optional `include`, optional `includeNsfw` |
| `x_user` | One account's posts | `handle` |
| `reddit_thread` | New comments on one Reddit post | `postId` |
| `x_thread` | New replies to one X post | `postId` |

Leave `query` off a `subreddit` target to be told about every new post in the community. A `subreddit` or
`subreddit_comments` target takes one community or up to 10 joined with `+` (`saas+startups`).

A `subreddit_comments` monitor with a `query` filters the comment stream itself, because Reddit
cannot search comments: every word must appear, `"quoted phrases"` match whole, `-word` must not
appear, and `OR` in capitals separates alternatives. Matching ignores case and respects word
boundaries, so `ai` does not match "said". Each run reads the newest 300 comments, so a community
busier than that between runs loses the oldest of them; choose `hourly` for busy communities.

A `search` target reads one page of the newest X matches per run, about 20 posts. A query that
matches more than that between runs loses the oldest, so choose `hourly` or narrow the query.

```json
{ "kind": "subreddit", "subreddit": "saas" }
{ "kind": "x_user", "handle": "naval" }
{ "kind": "reddit_thread", "postId": "https://www.reddit.com/r/saas/comments/1vdo8we/slug/" }
```

Identifiers are normalised, so paste whatever you have. A URL, an `r/` prefix, an `@`, and a `t3_`
fullname all work.

Thread, `subreddit_comments` and `reddit_user` watches return comments (a `reddit_user` watch
returns posts too); the others return posts. Each result says which it is in `itemType`.

An `x_user` monitor resolves the handle once and follows the account by its numeric id after that,
so it keeps working if the account is renamed.

| Schedule | Runs                                            |
| -------- | ----------------------------------------------- |
| `manual` | Only when you call `POST /v1/monitors/{id}/run` |
| `hourly` | Every hour. Paid tiers only                     |
| `daily`  | Every day (the default)                         |
| `weekly` | Every week                                      |

How many monitors you can keep depends on your tier: one on the free tier, more on paid tiers.
`GET /v1/limits` returns the number for your account. Going over returns `409`.

## "New" means new content, not a new id

Results are deduplicated by a hash of the content, not by the platform's post id.

That is the reason to use a monitor rather than a cron job around a search. An edited post keeps
its id; a re-post gets a fresh one. Deduplicating by id alerts you twice for the second and never
for the first.

## Reading results

```bash
curl --url "https://api.weirapp.io/v1/monitors/$MONITOR_ID/results" \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

`/runs` gives the execution history, including failures and what they collected before failing.

Both are free, and so is triggering a run. Each run is billed like the same call made by hand: a
1-credit minimum plus the new results it stores, at the API's per-result rates. An account watch
also pays for one profile lookup, on its first run only. A triggered run answers `202` with a job id and runs in the
background, so read `/runs` for the outcome rather than expecting results in the response.

## Webhooks

Be told instead of polling:

```bash
curl --request POST \
  --url https://api.weirapp.io/v1/webhooks \
  --header "Authorization: Bearer $WEIR_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Ops channel",
    "url": "https://hooks.example.com/weir",
    "events": ["monitor.result.created"]
  }'
```

The signing secret is returned **once**. Point a monitor at the webhook with its `webhookId`.

| Event                    | Sent when                                                       |
| ------------------------ | --------------------------------------------------------------- |
| `monitor.result.created` | A run found something new. One delivery per run, up to 25 items |
| `webhook.test`           | You call `POST /v1/webhooks/{id}/test`                          |

You can also subscribe to `monitor.run.failed`, but no deliveries are sent for it yet. Read a
monitor's `/runs` to catch a run that failed.

How many webhooks you can keep depends on your tier, the same way as monitors.

## Alerts in Slack, Discord or Telegram

Use the chat app's incoming-webhook URL as the webhook's `url`. Weir then sends each delivery there
as a short message instead of the signed JSON event: the monitor's name, how many results are new,
and up to five of them with their links.

| App      | The URL to use                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| Slack    | An incoming webhook: `https://hooks.slack.com/services/…`                                                            |
| Discord  | A channel webhook, from the channel's Integrations settings: `https://discord.com/api/webhooks/…`                    |
| Telegram | Your bot's `sendMessage` URL with the chat's id: `https://api.telegram.org/bot<token>/sendMessage?chat_id=<chat id>` |

For Telegram, create a bot with @BotFather, add it to the chat, and put the chat's id in the URL.
`POST /v1/webhooks/{id}/test` sends a test message, so you can check the channel before a monitor
runs. Discord messages never ping anyone, whatever a post says.

Treat these URLs as secrets: anyone who has one can post to your channel. The chat apps don't check
Weir's signature, so there is nothing to verify on that side.

## What a delivery looks like

A `POST` with a JSON body and three headers:

```
weir-signature: 5f2b…   (hex HMAC-SHA256)
weir-timestamp: 1800000000
weir-event-id: evt_…
```

```json
{
  "id": "evt_…",
  "type": "monitor.result.created",
  "createdAt": "2026-07-30T11:04:22.000Z",
  "data": {
    "monitorId": "…",
    "runId": "…",
    "kind": "search",
    "itemType": "post",
    "newResults": 3,
    "results": []
  }
}
```

`results` holds each platform's own record, exactly as the API returns it.

## Verifying a delivery

The signature is `HMAC-SHA256(secret, "{timestamp}.{eventId}.{rawBody}")`, hex encoded, where
`timestamp` is the `weir-timestamp` header, `eventId` the `weir-event-id` header, and `rawBody` the
body exactly as received. The key is the whole secret as text, `whsec_` prefix included. This is
not the Standard Webhooks scheme, which base64-decodes the secret and orders the parts differently,
so a Standard Webhooks library rejects every Weir delivery: verify with the code below.

All three parts are signed on purpose: the body alone could be replayed forever, the timestamp
bounds that window, and the event id stops one valid signature being lifted onto another delivery
inside it. Reject a timestamp more than five minutes from now, and compare in constant time.

**Use the raw body.** Parsing and re-serializing JSON reorders keys, which changes the string and
breaks the signature. This is the most common reason a correct secret still fails.

Node, with Express:

```ts
import { createHmac, timingSafeEqual } from "node:crypto";
import express from "express";

function verifyWeir(raw: Buffer, signature: string, timestamp: string, eventId: string): boolean {
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", process.env.WEIR_WEBHOOK_SECRET!)
    .update(`${timestamp}.${eventId}.`)
    .update(raw)
    .digest("hex");
  return (
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
}

const app = express();

app.post("/weir", express.raw({ type: "application/json" }), (request, response) => {
  const valid = verifyWeir(
    request.body,
    request.header("weir-signature") ?? "",
    request.header("weir-timestamp") ?? "",
    request.header("weir-event-id") ?? "",
  );
  if (!valid) return response.status(400).end();

  response.status(200).end();
  const event = JSON.parse(request.body.toString("utf8"));
  console.log(event.id, event.type); // process it here, deduplicating on event.id
});
```

`express.raw`, not `express.json`, so the body arrives as the bytes that were signed.

Python:

```python
import hashlib
import hmac
import os
import time


def verify_weir(raw_body: bytes, signature: str, timestamp: str, event_id: str) -> bool:
    try:
        if abs(time.time() - int(timestamp)) > 300:
            return False
    except ValueError:
        return False
    message = f"{timestamp}.{event_id}.".encode() + raw_body
    secret = os.environ["WEIR_WEBHOOK_SECRET"].encode()
    expected = hmac.new(secret, message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected.encode(), signature.encode())
```

Pass the raw bytes: `request.get_data()` in Flask, `await request.body()` in Starlette and FastAPI.

Go:

```go
package webhooks

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"time"
)

// VerifyWeir reports whether a delivery was signed with the webhook's secret.
func VerifyWeir(rawBody []byte, signature, timestamp, eventID, secret string) bool {
	issued, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return false
	}
	if age := time.Now().Unix() - issued; age > 300 || age < -300 {
		return false
	}
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(timestamp + "." + eventID + "."))
	mac.Write(rawBody)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}
```

Read the body with `io.ReadAll(r.Body)` before decoding it.

## Delivery behaviour

- **At least once.** A delivery can arrive more than once. `weir-event-id` stays the same when a
  delivery is retried, so deduplicate on it.
- **Retries back off over about nine hours**: roughly 1 minute, 5 minutes, 30 minutes, 2 hours,
  and 6 hours after each failure. Every attempt is recorded at `GET /v1/webhook-deliveries`.
- **Respond within 10 seconds.** Return `2xx` first, then do the work.
- **A `4xx` other than `429` is not retried.** It says the request itself was refused, and sending
  it again would be refused the same way.
- **Redirects are not followed.** A `302` is a failure. A public URL redirecting to an internal one
  is the standard way to turn a webhook into request forgery.
- **A persistently failing endpoint is disabled** after 20 failures in a row. One success clears
  the streak.

`POST /v1/webhooks/{id}/test` sends a real signed delivery, free. Its `data` is empty, and calls
within the same minute send one delivery between them.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
