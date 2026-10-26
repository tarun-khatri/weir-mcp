# Weir: X and Reddit data

Read public X (Twitter) and Reddit data in Dify workflows and agents, with no X or Reddit account or API key.

## Tools

| Tool | What it returns |
| --- | --- |
| Search X posts | Posts matching words and filters: accounts, language, minimum likes, dates. X search operators such as `from:` and `min_faves:` work in the query. |
| Get replies to an X post | The replies under one post. |
| Get an X thread | The author's whole chain of posts. |
| Get an account's posts | An account's latest posts. |
| Search Reddit | Posts across Reddit or in one community. |
| Get Reddit comments | One post's comment thread, nested by reply level. |

Each tool returns the API's JSON, for workflow nodes, and a short text version, for agents. Post and Reddit tools take a pasted link as well as an id.

## Setup

1. Sign up at [weirapp.io](https://weirapp.io) and create an API key under Dashboard → Keys. Every account gets 5,000 free credits a month; no card is needed.
2. In Dify, open the Weir plugin's settings and paste the key. The plugin checks it with a free call.

## Pricing

Weir is prepaid and charges per result: 1 credit per X post, 3 per Reddit post or comment, plus 1 per request. Failed calls are free. Current prices are at [weirapp.io/pricing](https://weirapp.io/pricing).

## Example

In an agent, ask: "What are people on r/SaaS saying about usage-based pricing this month?" The agent calls **Search Reddit** with `subreddit: SaaS` and `time: month`, then **Get Reddit comments** on the threads worth reading.

## Privacy

The plugin stores nothing and sends only the tool's inputs and your key to `api.weirapp.io`. See [PRIVACY.md](PRIVACY.md).

## Support

- Source: https://github.com/tarun-khatri/weir-mcp/tree/main/dify/weir
- Docs: https://docs.weirapp.io
- Email: support@weirapp.io

Weir is independent and not affiliated with X or Reddit.
