# Weir pricing: Twitter (X) and Reddit API cost per 1,000 results (November 2026)

Weir is prepaid and billed per result returned, not per request. An X (Twitter) post costs 1 credit, an X profile 2 credits and a Reddit post or comment 3 credits, plus 1 credit per successful call. Every account gets 5,000 free credits every month with no card, and prepaid packs start at $5 for 25,000 credits and never expire. That is about $0.105 to $0.21 per 1,000 X posts from search.

Prices as of 12 November 2026, in US dollars before sales tax or VAT. The live price page is https://weirapp.io/pricing, and packs are sold at https://weirapp.io/buy.

## Credit packs

| Pack | Credits | Price per 1,000 credits |
| --- | --- | --- |
| $5 | 25,000 | $0.20 |
| $20 | 120,000 | $0.167 |
| $50 | 340,000 | $0.147 |
| $200 | 1,600,000 | $0.125 |
| $1,000 | 10,000,000 | $0.10 |

Packs are bought once and never expire. There is no subscription and no invoice at the end of the month: when the balance runs out, calls stop. The free 5,000 credits arrive with the first call of each month, are spent before anything bought, and do not roll over.

## What each result costs

| Result | Credits each | Per 1,000, smallest pack | Per 1,000, largest pack |
| --- | --- | --- | --- |
| X post | 1 | $0.20 | $0.10 |
| X profile | 2 | $0.40 | $0.20 |
| X account in a list (followers, following, reposters, members) | 1 | $0.20 | $0.10 |
| X List | 2 | $0.40 | $0.20 |
| X Space | 2 | $0.40 | $0.20 |
| Reddit post | 3 | $0.60 | $0.30 |
| Reddit comment | 3 | $0.60 | $0.30 |
| Reddit community | 1 | $0.20 | $0.10 |
| Reddit user | 1 | $0.20 | $0.10 |

Each successful call also costs 1 credit, even when it returns nothing. It is added to the results, not a floor: a search that returns 20 X posts costs 21 credits, and one that matches nothing costs 1.

## What 1,000 results cost

The per-call credit is included. The smallest and largest packs give the two prices.

| 1,000 of | Fetched as | Credits | At the $5 pack | At the $1,000 pack |
| --- | --- | --- | --- | --- |
| [X posts from search](endpoints/twitter-search-api.md) | 50 calls of about 20 posts | 1,050 | $0.21 | $0.105 |
| [X posts and replies of one account](endpoints/twitter-user-timeline-api.md) | 50 calls of 20 posts, and one profile lookup | 1,052 | $0.21 | $0.105 |
| [X profiles by id](endpoints/twitter-user-lookup-api.md) | 10 calls of 100 ids | 2,010 | $0.402 | $0.201 |
| [X profiles by handle](endpoints/twitter-user-lookup-api.md) | 1,000 calls of one profile | 3,000 | $0.60 | $0.30 |
| [X followers of one account](endpoints/twitter-followers-api.md) | 15 calls of about 70 accounts, and one profile lookup | 1,017 | $0.203 | $0.102 |
| [Reddit posts from search](endpoints/reddit-search-api.md) | 10 calls of 100 posts | 3,010 | $0.602 | $0.301 |
| [Reddit comments from a subreddit](endpoints/subreddit-posts-comments-api.md) | 10 calls of 100 comments | 3,010 | $0.602 | $0.301 |

The account row reads posts together with replies, because X keeps only the newest 800 or so posts on an account's Posts tab and the newest 3,200 on posts and replies.

## Three worked examples

### 1,000 X posts from search: 1,050 credits

`POST /v1/x/search` costs 1 credit per call plus 1 credit per post, and X serves about 20 posts a page. 1,000 posts are 50 calls: 50 × 1 + 1,000 × 1 = 1,050 credits. That is $0.21 at the $5 pack and $0.105 at the $1,000 pack. The free 5,000 credits cover 238 such pages a month: 4,760 posts.

### 100 X profiles: 201 credits in one call, 300 one per call

`GET /v1/x/users` takes up to 100 numeric ids in one call and costs 1 credit per call plus 2 credits per profile: 1 + 100 × 2 = 201 credits. Fetched one per call with `GET /v1/x/users/{user}`, which also takes a handle, each lookup is 1 + 2 = 3 credits, so 100 profiles cost 100 × 3 = 300 credits. An id that cannot be returned is not billed.

### 1,000 Reddit comments: 3,010 credits

A Reddit comment costs 3 credits. `GET /v1/reddit/subreddits/{name}/comments` returns up to 100 comments a call, so 1,000 comments are 10 calls: 10 × 1 + 1,000 × 3 = 3,010 credits, or $0.602 at the $5 pack and $0.301 at the $1,000 pack. From one post's comment tree, `GET /v1/reddit/posts/{id}/comments` returns up to 500 comments on the first page and up to 100 on each later page, so the same 1,000 comments take 6 calls and cost 3,006 credits.

## The price of every endpoint

Read from the `x-weir-billing` extension of the API contract, where each operation publishes its price.

| Endpoint | Price in credits | Documented in |
| --- | --- | --- |
| `POST /v1/reddit/search` | 1 per call + 3 per Reddit post | [Reddit search API](endpoints/reddit-search-api.md) |
| `GET /v1/reddit/posts/{id}` | 1 per call + 3 per Reddit post | [Reddit post and comments API](endpoints/reddit-post-comments-api.md) |
| `GET /v1/reddit/subreddits/{name}` | 1 per call + 1 per subreddit | [Subreddit posts and comments API](endpoints/subreddit-posts-comments-api.md) |
| `POST /v1/reddit/subreddits/{name}/search` | 1 per call + 3 per Reddit post | [Reddit search API](endpoints/reddit-search-api.md) |
| `GET /v1/reddit/posts/{id}/comments` | 1 per call + 3 per Reddit comment | [Reddit post and comments API](endpoints/reddit-post-comments-api.md) |
| `GET /v1/reddit/subreddits/{name}/posts` | 1 per call + 3 per Reddit post | [Subreddit posts and comments API](endpoints/subreddit-posts-comments-api.md) |
| `GET /v1/reddit/subreddits/{name}/comments` | 1 per call + 3 per Reddit comment | [Subreddit posts and comments API](endpoints/subreddit-posts-comments-api.md) |
| `POST /v1/reddit/search/subreddits` | 1 per call + 1 per subreddit | [Reddit search API](endpoints/reddit-search-api.md) |
| `GET /v1/reddit/users/{username}` | 1 per call + 1 per Reddit user | [Reddit user API](endpoints/reddit-user-api.md) |
| `GET /v1/reddit/users/{username}/posts` | 1 per call + 3 per Reddit post | [Reddit user API](endpoints/reddit-user-api.md) |
| `GET /v1/reddit/users/{username}/comments` | 1 per call + 3 per Reddit comment | [Reddit user API](endpoints/reddit-user-api.md) |
| `POST /v1/reddit/lookup` | 1 per call + 3 per Reddit post + 3 per Reddit comment + 1 per subreddit | [Reddit post and comments API](endpoints/reddit-post-comments-api.md) |
| `POST /v1/x/search` | 1 per call + 1 per X post | [Twitter (X) search API](endpoints/twitter-search-api.md) |
| `GET /v1/x/posts` | 1 per call + 1 per X post | [Get tweet by ID: X (Twitter) post lookup API](endpoints/tweet-lookup-api.md) |
| `GET /v1/x/posts/{id}` | 1 per call + 1 per X post | [Get tweet by ID: X (Twitter) post lookup API](endpoints/tweet-lookup-api.md) |
| `GET /v1/x/posts/{id}/replies` | 1 per call + 1 per X post | [Tweet replies, quotes and reposters API](endpoints/tweet-replies-quotes-reposters-api.md) |
| `GET /v1/x/posts/{id}/thread` | 1 per call + 1 per X post | [X (Twitter) thread API](endpoints/twitter-thread-api.md) |
| `GET /v1/x/posts/{id}/quotes` | 1 per call + 1 per X post | [Tweet replies, quotes and reposters API](endpoints/tweet-replies-quotes-reposters-api.md) |
| `GET /v1/x/posts/{id}/retweeters` | 1 per call + 1 per X account listed | [Tweet replies, quotes and reposters API](endpoints/tweet-replies-quotes-reposters-api.md) |
| `GET /v1/x/posts/{id}/edits` | 1 per call + 1 per X post | [Get tweet by ID: X (Twitter) post lookup API](endpoints/tweet-lookup-api.md) |
| `GET /v1/x/posts/{id}/article` | 1 per call + 1 per X post | [X (Twitter) Articles API](endpoints/twitter-articles-api.md) |
| `GET /v1/x/users` | 1 per call + 2 per X profile | [X (Twitter) user lookup API: profiles by handle or id](endpoints/twitter-user-lookup-api.md) |
| `POST /v1/x/users/search` | 1 per call + 1 per X account listed | [X (Twitter) user lookup API: profiles by handle or id](endpoints/twitter-user-lookup-api.md) |
| `GET /v1/x/users/{user}` | 1 per call + 2 per X profile | [X (Twitter) user lookup API: profiles by handle or id](endpoints/twitter-user-lookup-api.md) |
| `GET /v1/x/users/{user}/about` | 1 per call + 2 per X profile | [X (Twitter) account location: About this account API](endpoints/twitter-account-location-api.md) |
| `GET /v1/x/users/{user}/posts` | 1 per call + 2 per X profile + 1 per X post | [Get tweets by user: X (Twitter) user timeline API](endpoints/twitter-user-timeline-api.md) |
| `GET /v1/x/users/{user}/replies` | 1 per call + 2 per X profile + 1 per X post | [Get tweets by user: X (Twitter) user timeline API](endpoints/twitter-user-timeline-api.md) |
| `GET /v1/x/users/{user}/media` | 1 per call + 2 per X profile + 1 per X post | [Get tweets by user: X (Twitter) user timeline API](endpoints/twitter-user-timeline-api.md) |
| `GET /v1/x/users/{user}/highlights` | 1 per call + 2 per X profile + 1 per X post | [Get tweets by user: X (Twitter) user timeline API](endpoints/twitter-user-timeline-api.md) |
| `GET /v1/x/users/{user}/followers` | 1 per call + 2 per X profile + 1 per X account listed | [Twitter followers API and following API](endpoints/twitter-followers-api.md) |
| `GET /v1/x/users/{user}/following` | 1 per call + 2 per X profile + 1 per X account listed | [Twitter followers API and following API](endpoints/twitter-followers-api.md) |
| `GET /v1/x/users/{user}/affiliates` | 1 per call + 2 per X profile + 1 per X account listed | [Twitter followers API and following API](endpoints/twitter-followers-api.md) |
| `GET /v1/x/users/{user}/subscriptions` | 1 per call + 2 per X profile + 1 per X account listed | [Twitter followers API and following API](endpoints/twitter-followers-api.md) |
| `GET /v1/x/lists/{id}` | 1 per call + 2 per X List | [X (Twitter) Lists API](endpoints/twitter-lists-api.md) |
| `GET /v1/x/lists/{id}/members` | 1 per call + 1 per X account listed | [X (Twitter) Lists API](endpoints/twitter-lists-api.md) |
| `GET /v1/x/lists/{id}/posts` | 1 per call + 1 per X post | [X (Twitter) Lists API](endpoints/twitter-lists-api.md) |
| `GET /v1/x/spaces/{id}` | 1 per call + 2 per X Space | [X (Twitter) Spaces API](endpoints/twitter-spaces-api.md) |

## What is free

- The first 5,000 credits of every month, with no card.
- Failed calls. Anything `400` or above costs nothing, including `503`.
- Refused calls. `402` and `429` never charge.
- Creating, listing and triggering monitors and webhooks. A monitor run is billed like the same call made by hand, for the new results it stores.
- Looking at your own account: `GET /v1/usage`, `GET /v1/limits` and `GET /v1/whoami`.

In the contract, 19 of the 56 metered operations are free. They are listed on the [monitors and webhooks](endpoints/monitors-webhooks-api.md) and [account](endpoints/account-usage-limits-api.md) pages.

## Rate limits and tiers

Rate limits, and how many monitors and webhooks an account may keep, rise with what it has bought in total, net of refunds. They never fall because credits were spent or time passed.

| Tier | Lifetime purchases | Requests a minute | Monitors | Webhooks | Hourly monitors |
| --- | --- | --- | --- | --- | --- |
| Free | $0 | 30 | 1 | 1 | No |
| Tier 1 | $5 | 120 | 10 | 5 | Yes |
| Tier 2 | $100 | 300 | 50 | 25 | Yes |
| Tier 3 | $500 | 600 | 200 | 100 | Yes |

Calls are weighted by the work they do. A search counts as 2 requests and a Reddit comment tree as 4, while a single lookup counts as 1.

## When credits run out

Calls return `402` with code `quota_exceeded`. It is not retryable. It clears in two ways only: the month's free credits return on the 1st (UTC), or someone adds credits at https://weirapp.io/buy. Rate limiting is a different code, `429`, and that one is retryable after `Retry-After`.

## Paying and refunds

Card payments are processed by Dodo Payments, the merchant of record. Every pack can also be paid in USDC on Solana, at one USDC per dollar. An unused credit pack can be refunded within 30 days of purchase.

More detail: [Billing and credits](guides/billing.md). Refund policy: https://weirapp.io/refunds.

Weir reads public data only and is read-only. It is independent and not affiliated with X or Reddit.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
