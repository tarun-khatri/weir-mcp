# Response shapes

> Part of the Weir docs for public Reddit and X (Twitter) data. Copied from https://docs.weirapp.io/response-shapes on 12 November 2026. That page is always the current version.

Each platform returns its own fields, under its own names. Nothing is renamed, nothing is dropped
to make the shapes match.

## A Reddit post

```json
{
  "id": "1t4k9x2",
  "subreddit": "saas",
  "title": "Our checkout has been failing since Tuesday",
  "selftext": "We've had three customers report…",
  "author": "eng_at_acme",
  "permalink": "/r/saas/comments/1t4k9x2/…",
  "url": "https://www.reddit.com/r/saas/comments/1t4k9x2/…",
  "score": 212,
  "upvoteRatio": 0.94,
  "numComments": 47,
  "over18": false,
  "createdUtc": 1785582262,
  "createdAt": "2026-07-30T11:04:22.000Z"
}
```

- `score` is upvotes minus downvotes. It can be negative, and Reddit fuzzes it.
- `author` is a username string. A deleted author is the literal `"[deleted]"`.
- `createdUtc` and `createdAt` are the same instant, in both formats.

## An X post

```json
{
  "id": "1948372615540293",
  "text": "Three of our customers hit the same checkout failure today.",
  "url": "https://x.com/patio11/status/1948372615540293",
  "lang": "en",
  "conversationId": "1948372615540293",
  "inReplyToId": null,
  "author": {
    "id": "9412",
    "username": "patio11",
    "name": "Patrick McKenzie",
    "verified": true,
    "followersCount": 412903
  },
  "likeCount": 1876,
  "retweetCount": 233,
  "replyCount": 134,
  "viewCount": 91204,
  "createdAt": "2026-07-30T11:44:51.000Z"
}
```

- `id` is a string because it exceeds 2^53. Parsing it as a number corrupts it.
- Counts are nullable. `null` means X did not report it, not zero.

## Three things that will trip you up

**`author` is a string on Reddit, an object on X.** `post.author` versus `post.author.username`.
Do not write one accessor for both.

**There is no shared engagement field.** A Reddit `score` and an X `likeCount` are different
measurements. There is no exchange rate between an upvote and a like.

**Only `id`, `url`, and `createdAt` are carried by both.** Everything else belongs to one platform.

## Searching both platforms

Two calls, in parallel. Each succeeds or fails on its own.

```ts
const search = (platform: "reddit" | "x") =>
  fetch(`https://api.weirapp.io/v1/${platform}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WEIR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "checkout failures", limit: 25 }),
  }).then((response) => response.json());

const [reddit, x] = await Promise.allSettled([search("reddit"), search("x")]);
```

`allSettled` rather than `all`, so X being down does not throw away the Reddit results.

There is no combined endpoint. Two unrelated shapes in one response is harder to use than two
responses holding one each, and a combined call could not let X fail without taking Reddit with
it.

## Sorting is per platform

Each sorts against its own corpus in its own vocabulary. Reddit takes `relevance | hot | top |
new | comments`, X takes `latest | top`. There is no cross-platform ranking, because there is no
shared score to rank by.

## How fresh the data is

Weir keeps a short-lived copy of each answer, shared by every account, so the same request made
twice in a row costs X only one read. A repeat inside the window returns that copy, still billed,
so counts can trail the live site by up to the window:

| Data                                  | Fresh within        |
| ------------------------------------- | ------------------- |
| X search, quotes                      | 3 minutes           |
| X timelines, replies, threads         | 10 minutes          |
| X profiles (follower and post counts) | 30 minutes          |
| X followers and following lists       | 30 minutes          |
| A single X post and its counts        | 1 hour              |
| Reddit search                         | 10 minutes          |
| A Reddit post / its comments          | 1 hour / 15 minutes |

To track a count over time, read it once a day or once an hour: a tighter loop sees the same
number until the window ends.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
