# X (Twitter) Spaces API

`GET /v1/x/spaces/{id}` returns one X Space, a live audio room: its title, state, schedule, host, speakers and audience counts, and whether a replay is available. The state is `NotStarted`, `Running` or `Ended`. A lookup costs 3 credits: 1 for the call and 2 for the Space.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/spaces/{id}` | Get an X Space | One X Space | 1 per call + 2 per X Space | `get_x_space` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/x/spaces/{id}`

`id` goes in the path and the others go in the query string.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `id` | path | string | yes | Space id: the code after `/i/spaces/` in a Space's URL. |
| `listeners` | query | string | no | Include the listener list. Off by default: it can be long, and it names individuals who only listened. One of `true`, `false`. Default `false`. |

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
export SPACE_ID="..."   # the code after /i/spaces/ in the Space's URL
curl --request GET \
  --url "https://api.weirapp.io/v1/x/spaces/$SPACE_ID" \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

space_id = os.environ["SPACE_ID"]  # the code after /i/spaces/ in the Space's URL
url = f"https://api.weirapp.io/v1/x/spaces/{space_id}"
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

space = page["data"]
print(space["title"], space["state"], space["startedAt"], space["participantCount"])
print("credits charged:", charged)
```

## Response fields you will use most

`GET /v1/x/spaces/{id}` answers `200` with a `data` object and a `meta` object. One X Space.

| Field | Type | Meaning |
| --- | --- | --- |
| `data.id` | string | The Space id. |
| `data.url` | string | `https://x.com/i/spaces/{id}`. |
| `data.title` | string or null | The Space's title, or `null`. |
| `data.state` | string or null | X's lifecycle state, such as `NotStarted`, `Running`, or `Ended`. |
| `data.scheduledStart`, `startedAt`, `endedAt` | string or null | When it is scheduled, when it started and when it ended. Each is `null` until it applies. |
| `data.creator` | object or null | An object with `id`, `username`, `name`, `verified`, `followersCount`, `profileImageUrl`. |
| `data.totalLiveListeners`, `totalReplayWatched`, `participantCount` | integer or null | Audience counts, or `null` when X does not report them. |
| `data.isSpaceAvailableForReplay` | boolean or null | Whether a replay is available. |
| `data.participants.admins` | array of object | Hosts and co-hosts. |
| `data.participants.speakers` | array of object | The speakers. |
| `data.participants.listeners` | array of object | Empty unless listeners were requested with `listeners=true`. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXSpace`](https://docs.weirapp.io/reference/x/getXSpace).

## Limits and caveats

- The id is the code after `/i/spaces/` in a Space's URL.
- Listeners are included only with `listeners=true`. It is off by default: the list can be long, and it names individuals who only listened.
- `404` when the Space does not exist.
- One call returns the Space. There is no `cursor`.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. A call here counts as 1 request.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [The host's profile](twitter-user-lookup-api.md)
- [Search posts about a Space](twitter-search-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tool for this page is `get_x_space`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "What is this X Space about, who hosted it and how many people listened? (paste the Space's link)"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
