# Monitors and webhooks API

A monitor is a saved query that runs on a schedule and reports only what is new: a keyword search across Reddit and X (Twitter), a subreddit's posts or comments, one account's posts, or the replies to one thread. A webhook sends each run's new results to your URL as a signed POST, so you do not have to poll. Creating, listing and triggering monitors and webhooks is free, and a run costs 1 credit plus the normal per-result price for each new result it stores.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `POST /v1/monitors` | Create a monitor | The created monitor | Free | `create_monitor` |
| `GET /v1/monitors` | List monitors | Monitors belonging to this account | Free | `list_monitors` |
| `GET /v1/monitors/{id}` | Get one monitor | The monitor | Free | `get_monitor` |
| `PATCH /v1/monitors/{id}` | Update a monitor | The updated monitor | Free | `update_monitor` |
| `DELETE /v1/monitors/{id}` | Delete a monitor | The monitor was deleted | Free | `delete_monitor` |
| `POST /v1/monitors/{id}/run` | Queue a monitor run immediately | The run was queued, or was already queued | Free | `run_monitor` |
| `GET /v1/monitors/{id}/results` | List deduplicated results a monitor has found | Results, newest first | Free | `list_monitor_results` |
| `GET /v1/monitors/{id}/runs` | List a monitor's execution history | Runs, newest first | Free | `list_monitor_runs` |
| `GET /v1/monitors/{id}/runs/{runId}` | Get one monitor run | The run | Free | `get_monitor_run` |
| `POST /v1/webhooks` | Create a webhook | The created webhook and its one-time signing secret | Free | `create_webhook` |
| `GET /v1/webhooks` | List webhooks | Webhooks belonging to this account. Secrets are never returned | Free | `list_webhooks` |
| `PATCH /v1/webhooks/{id}` | Update a webhook | The updated webhook | Free | `update_webhook` |
| `DELETE /v1/webhooks/{id}` | Delete a webhook | The webhook was deleted | Free | `delete_webhook` |
| `POST /v1/webhooks/{id}/test` | Queue a test delivery | A signed test event was queued | Free | `test_webhook` |
| `GET /v1/webhook-deliveries` | List recent delivery attempts | Delivery attempts, newest first | Free | `list_webhook_deliveries` |
| `GET /v1/webhook-deliveries/{id}` | Get one delivery, with its body | The delivery | Free | `get_webhook_delivery` |

Every endpoint on this page is free.

## Parameters of `POST /v1/monitors`

These go in a JSON body.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `name` | body | string | yes | A name for the monitor. Up to 120 characters. |
| `target` | body | object | yes | What the monitor watches. `search` runs a keyword search across sources; `subreddit` watches one community, with a keyword or without; `x_user` watches one account's posts; `reddit_thread` and `x_thread` watch one conversation for new replies. Identifiers are normalised, so a pasted URL, an `r/` prefix, or an `@` handle are all accepted. |
| `schedule` | body | string | no | How often it runs. One of `manual`, `hourly`, `daily`, `weekly`. Default `daily`. |
| `webhookId` | body | string or null | no | The webhook that receives what each run finds. |

### What a monitor can watch

`target.kind` decides what a monitor watches. Each kind takes its own fields inside `target`.

| Kind | Watches | Fields |
| --- | --- | --- |
| `search` | A phrase, across sources | `query`, `sources` |
| `subreddit` | One community's new posts | `subreddit`, optional `query`, optional `includeNsfw` |
| `subreddit_comments` | One community's new comments | `subreddit`, optional `query`, optional `includeNsfw` |
| `reddit_user` | One Reddit account's posts and comments | `username`, optional `include`, optional `includeNsfw` |
| `x_user` | One account's posts | `handle` |
| `reddit_thread` | New comments on one Reddit post | `postId` |
| `x_thread` | New replies to one X post | `postId` |

### Parameters of the other endpoints

| Endpoint | Parameters |
| --- | --- |
| `GET /v1/monitors` | `limit` (query) |
| `GET /v1/monitors/{id}` | `id` (path, required) |
| `PATCH /v1/monitors/{id}` | `id` (path, required), `name` (body), `target` (body), `schedule` (body), `webhookId` (body), `status` (body) |
| `DELETE /v1/monitors/{id}` | `id` (path, required) |
| `POST /v1/monitors/{id}/run` | `id` (path, required) |
| `GET /v1/monitors/{id}/results` | `id` (path, required), `limit` (query) |
| `GET /v1/monitors/{id}/runs` | `id` (path, required), `limit` (query) |
| `GET /v1/monitors/{id}/runs/{runId}` | `id` (path, required), `runId` (path, required) |
| `POST /v1/webhooks` | `name` (body, required), `url` (body, required), `events` (body) |
| `GET /v1/webhooks` | `limit` (query) |
| `PATCH /v1/webhooks/{id}` | `id` (path, required), `name` (body), `url` (body), `events` (body), `status` (body) |
| `DELETE /v1/webhooks/{id}` | `id` (path, required) |
| `POST /v1/webhooks/{id}/test` | `id` (path, required) |
| `GET /v1/webhook-deliveries` | `limit` (query), `webhookId` (query) |
| `GET /v1/webhook-deliveries/{id}` | `id` (path, required) |

Types and limits of each are in the reference: [`listMonitors`](https://docs.weirapp.io/reference/monitors/listMonitors), [`getMonitor`](https://docs.weirapp.io/reference/monitors/getMonitor), [`updateMonitor`](https://docs.weirapp.io/reference/monitors/updateMonitor), [`deleteMonitor`](https://docs.weirapp.io/reference/monitors/deleteMonitor), [`runMonitor`](https://docs.weirapp.io/reference/monitors/runMonitor), [`listMonitorResults`](https://docs.weirapp.io/reference/monitors/listMonitorResults), [`listMonitorRuns`](https://docs.weirapp.io/reference/monitors/listMonitorRuns), [`getMonitorRun`](https://docs.weirapp.io/reference/monitors/getMonitorRun), [`createWebhook`](https://docs.weirapp.io/reference/webhooks/createWebhook), [`listWebhooks`](https://docs.weirapp.io/reference/webhooks/listWebhooks), [`updateWebhook`](https://docs.weirapp.io/reference/webhooks/updateWebhook), [`deleteWebhook`](https://docs.weirapp.io/reference/webhooks/deleteWebhook), [`testWebhook`](https://docs.weirapp.io/reference/webhooks/testWebhook), [`listWebhookDeliveries`](https://docs.weirapp.io/reference/webhooks/listWebhookDeliveries), [`getWebhookDelivery`](https://docs.weirapp.io/reference/webhooks/getWebhookDelivery).

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`. This example creates a real monitor that runs every day, and each run spends credits. Delete it with `DELETE /v1/monitors/{id}` when you are done testing.

```bash
export WEIR_API_KEY="weir_live_..."
curl --request POST \
  --url 'https://api.weirapp.io/v1/monitors' \
  --header "Authorization: Bearer $WEIR_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"name":"NASA posts","target":{"kind":"x_user","handle":"NASA"},"schedule":"daily"}'
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

url = "https://api.weirapp.io/v1/monitors"
body = {"name": "NASA posts", "target": {"kind": "x_user", "handle": "NASA"}, "schedule": "daily"}
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
except urllib.error.HTTPError as error:
    # The body is Weir's JSON error: code, message and retryable.
    raise SystemExit(f"{error.code}: {json.load(error)['error']['message']}")

monitor = page["data"]
print(monitor["id"], monitor["status"], monitor["schedule"], monitor["nextRunAt"])
```

## Response fields you will use most

`POST /v1/monitors` answers `201` with a `data` object and a `meta` object. The created monitor.

| Field | Type | Meaning |
| --- | --- | --- |
| `data.id` | string (uuid) | The monitor's id. Use it in the other monitor endpoints. |
| `data.name` | string | The name you gave it. |
| `data.target` | object | What the monitor watches. `search` runs a keyword search across sources; `subreddit` watches one community, with a keyword or without; `x_user` watches one account's posts; `reddit_thread` and `x_thread` watch one conversation for new replies. Identifiers are normalised, so a pasted URL, an `r/` prefix, or an `@` handle are all accepted. |
| `data.schedule` | string | How often it runs. |
| `data.status` | string | Whether it is running, paused or archived. |
| `data.webhookId` | string or null | The webhook it delivers to, or `null`. |
| `data.lastRunAt`, `nextRunAt` | string or null | When it last ran and when it runs next, or `null`. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`createMonitor`](https://docs.weirapp.io/reference/monitors/createMonitor).

## Limits and caveats

- `schedule` is `manual`, `hourly`, `daily` or `weekly`, and defaults to `daily`. Hourly runs need a paid tier.
- The free tier allows 1 monitor and 1 webhook. Any purchase raises that to 10 monitors and 5 webhooks. Going over returns `409`.
- Results are deduplicated by a hash of the content, not by the platform's post id, so an edited or re-posted item never alerts twice.
- `POST /v1/monitors/{id}/run` answers `202` with a job id and runs in the background. Read `GET /v1/monitors/{id}/runs` for the outcome.
- A `search` monitor reads one page of the newest X matches per run, about 20 posts. If a query matches more than that between runs, choose `hourly` or narrow the query.
- A run that finds nothing new costs 1 credit. An account watch also pays for one profile lookup, on its first run only.
- If the account runs out of credits, its monitors pause instead of failing on every run. They resume by themselves when credits arrive.
- A webhook's signing secret is returned once, when the webhook is created, and cannot be retrieved again.
- Each delivery is a POST with `weir-signature`, `weir-timestamp` and `weir-event-id` headers. The signature is a hex HMAC-SHA256 of `{timestamp}.{eventId}.{rawBody}` with the secret. Verify it against the raw body, before parsing.
- Respond within 10 seconds. Failed deliveries are retried over about nine hours, and an endpoint that fails 20 times in a row is disabled.
- A Slack, Discord or Telegram incoming-webhook URL works as the webhook `url`. Weir then sends a short message there instead of the signed JSON event.
- The step-by-step guide, with signature checks in Node, Python and Go, is [Monitors and webhooks](../guides/monitors.md).
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. Each call here counts as 1 request, except `POST /v1/monitors/{id}/run` (4) and `POST /v1/webhooks/{id}/test` (2).
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [Monitors and webhooks guide](../guides/monitors.md)
- [The search a monitor runs on X](twitter-search-api.md)
- [The search a monitor runs on Reddit](reddit-search-api.md)
- [How many monitors and webhooks your tier allows](account-usage-limits-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. Every connection gets `list_monitors`, `get_monitor`, `list_monitor_results`, `list_monitor_runs` and `get_monitor_run`. These appear only on a connection that was granted monitor or webhook access when it was approved: `create_monitor`, `update_monitor`, `delete_monitor`, `run_monitor`, `create_webhook`, `list_webhooks`, `update_webhook`, `delete_webhook`, `test_webhook`, `list_webhook_deliveries` and `get_webhook_delivery`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "List my Weir monitors and show what the newest one found this week."

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
