# weir: X (Twitter) and Reddit data from your terminal

`weir` is the command line for [Weir](https://weirapp.io), a pay-per-result API for public X (Twitter)
and Reddit data. Search posts with X's own operators, read profiles, timelines, threads and replies,
check where an account is based, and pull subreddit posts and comments, without an X or Reddit
account.

```bash
npm install -g weirapp-cli
weir login                      # paste a free API key from https://weirapp.io/dashboard/keys
weir x search "artemis OR moon" --from NASA --limit 2
```

What that printed on 8 November 2026 (second post shortened):

```text
2026-11-07 22:52  @NASA  likes 0 · reposts 305 · replies 0 · views 44,096
  RT @NASAMoonBase: New awards. New mission updates. More progress toward a Moon Base. …
  https://x.com/NASA/status/2119201242320904516

2026-11-07 22:00  @NASA  likes 1,169 · reposts 209 · replies 125 · views 421,335
  LIVE: @NASAAdmin and agency leaders are sharing our latest updates on the Moon Base, …
  https://x.com/NASA/status/2119188276049228152
2 results
credits charged: 3 · remaining: …
```

Needs Node.js 18 or later. No dependencies.

## Commands

| Command | What it does |
| --- | --- |
| `weir login [--key KEY]` | Saves your API key (or set `WEIR_API_KEY`) |
| `weir logout` | Forgets the saved key |
| `weir whoami`, `weir usage`, `weir limits` | Your workspace, credits and rate limits (free) |
| `weir x search <query>` | Search posts: `--from a,b --lang en --since ISO --until ISO --sort latest\|top --limit N --pages N --original` |
| `weir x user <handle>` | A profile, by handle, numeric id or x.com link |
| `weir x about <handle>` | "About this account": where X says it is based, how it connects, username changes |
| `weir x posts <handle>` | An account's latest posts (`--limit N --pages N`) |
| `weir x post <id\|link>` | One post |
| `weir x thread <id\|link>` | The author's whole thread |
| `weir x replies <id\|link>` | Replies to a post |
| `weir x followers <handle>` | Followers (`--pages N`) |
| `weir reddit search <query>` | Search Reddit (`--subreddit name --sort --time --limit N`) |
| `weir reddit posts <subreddit>` | A subreddit's posts (`--sort hot\|new\|top`) |
| `weir reddit post <id>`, `weir reddit comments <id>` | One post, its comments |
| `weir monitors list` | Your monitors |
| `weir api <METHOD> <path> [json]` | Any endpoint, e.g. `weir api GET /v1/x/users/NASA/about` |

Add `--json` to any command for the raw JSON, ready for `jq`:

```bash
weir x posts NASA --limit 20 --json | jq '.data[] | {createdAt, likeCount, url}'
```

## Pricing

Every account gets 5,000 free credits each month, no card. A call costs 1 credit, plus 1 per X post,
2 per profile and 3 per Reddit post or comment. Failed calls cost nothing. Prepaid packs never expire:
[weirapp.io/pricing](https://weirapp.io/pricing). The CLI prints what each command cost.

## Also from Weir

- **AI agents:** the same data as a remote MCP server for ChatGPT, Claude, Cursor and others:
  `https://api.weirapp.io/mcp` ([setup](https://docs.weirapp.io/mcp))
- **REST API:** [docs.weirapp.io](https://docs.weirapp.io) and the
  [OpenAPI file](https://api.weirapp.io/openapi.json)
- **Free tools:** [weirapp.io/tools](https://weirapp.io/tools)

Weir reads public data only and never posts, likes or follows. It is not affiliated with X Corp. or
Reddit, Inc. MIT licensed. Support: support@weirapp.io
