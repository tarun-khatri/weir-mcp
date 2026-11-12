# Weir docs: Reddit and X (Twitter) data API and MCP server

Weir is a REST API (`https://api.weirapp.io`) and a remote MCP server (`https://api.weirapp.io/mcp`) for public Reddit and X data. It is billed per result returned, and every account gets 5,000 free credits every month. These pages cover every endpoint: what it returns, its parameters, its price, and a curl and a Python example.

## Start here

- [Connect an AI app](connect.md): one-click links and commands for Claude, ChatGPT, Cursor, Codex and VS Code.
- [Pricing](pricing.md): credit packs, the price of each result and of every endpoint, with worked examples.

## Endpoints

### X endpoints

- [Twitter (X) search API](endpoints/twitter-search-api.md): Search public X posts by keyword, phrase, account, hashtag, language, date and engagement.
- [Get tweets by user: X (Twitter) user timeline API](endpoints/twitter-user-timeline-api.md): An account's posts, posts with replies, media posts and highlights, newest first.
- [Twitter followers API and following API](endpoints/twitter-followers-api.md): The accounts that follow an X account, the accounts it follows, its affiliates and subscriptions.
- [Tweet replies, quotes and reposters API](endpoints/tweet-replies-quotes-reposters-api.md): The replies under one X post, the posts that quote it, and the accounts that reposted it.
- [X (Twitter) thread API](endpoints/twitter-thread-api.md): The author's whole thread around any post in it, in reading order.
- [Get tweet by ID: X (Twitter) post lookup API](endpoints/tweet-lookup-api.md): One X post by id, up to 100 posts in one call, and the edit history of a post.
- [X (Twitter) user lookup API: profiles by handle or id](endpoints/twitter-user-lookup-api.md): One X profile by handle or id, up to 100 profiles by id in one call, and account search.
- [X (Twitter) Lists API](endpoints/twitter-lists-api.md): A public X List: its details, its members and its timeline.
- [X (Twitter) Spaces API](endpoints/twitter-spaces-api.md): One X Space: its title, state, schedule, host, speakers and audience counts.
- [X (Twitter) Articles API](endpoints/twitter-articles-api.md): The long-form X Article a post carries, as plain text, Markdown and blocks.
- [X (Twitter) account location: About this account API](endpoints/twitter-account-location-api.md): Where X says an account is based, how it connects, and its username changes.

### Reddit endpoints

- [Reddit search API](endpoints/reddit-search-api.md): Search Reddit posts by keyword, search inside one subreddit, and find subreddits by topic.
- [Subreddit posts and comments API](endpoints/subreddit-posts-comments-api.md): A subreddit's posts by hot, new, rising, top or controversial, its newest comments, and its details.
- [Reddit post and comments API](endpoints/reddit-post-comments-api.md): One Reddit post, its comment tree page by page, and a bulk refresh of posts and comments.
- [Reddit user API](endpoints/reddit-user-api.md): A Reddit account's public profile, the posts it submitted and the comments it made.

### Monitors, webhooks and account

- [Monitors and webhooks API](endpoints/monitors-webhooks-api.md): Saved queries that run on a schedule and report only what is new, with signed webhook deliveries.
- [Account, usage and limits API](endpoints/account-usage-limits-api.md): Free endpoints for the credit balance, the tier's limits and the key's identity, plus health checks.

## Guides

- [Quickstart](guides/quickstart.md): A working search in five minutes, with no card.
- [Authentication](guides/authentication.md): API keys, OAuth for MCP clients, scopes, expiry and rotation.
- [Billing and credits](guides/billing.md): Credits, packs, tiers, what is free and what happens when credits run out.
- [Errors](guides/errors.md): The one shape every error takes, the status codes, and which ones to retry.
- [Pagination](guides/pagination.md): Cursors, the one stop condition, and how far back an X account goes.
- [Connect with MCP](guides/mcp.md): The remote MCP server: how clients authorize, the tool list and troubleshooting.
- [Monitors and webhooks](guides/monitors.md): Monitors, schedules, webhooks, and how to verify a delivery's signature.
- [Response shapes](guides/response-shapes.md): What a Reddit post and an X post look like, and how fresh the data is.

## About these pages

They were generated on 12 November 2026 from the API contract (https://api.weirapp.io/openapi.json), which has 58 operations and 56 MCP tools, and from the docs site. When a page and the docs site disagree, https://docs.weirapp.io is the current version.

Weir reads public data only and is read-only: it never posts, likes, follows or sends messages. It is independent and not affiliated with X or Reddit.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
