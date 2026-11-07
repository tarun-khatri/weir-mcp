# Weir for Hermes Agent

Public X (Twitter) and Reddit data for Hermes, through Weir's hosted MCP server at
`https://api.weirapp.io/mcp`. Ask Hermes to search X or Reddit, read a profile, a timeline, a
thread, replies, a List or a subreddit, and it calls Weir's tools.

This is a portable Agent Plugins v1 package: `plugin.json`, `mcp.json` and one skill
(`skills/weir/SKILL.md`). It contains no code, no executables and no stored credentials.

## Install

```bash
hermes plugins install weir --no-enable
hermes plugins enable weir
```

On first use Hermes shows Weir's sign-in link. Sign in or create a free account in the browser,
approve access, and Hermes stores the token itself (OAuth 2.1 with PKCE; Weir supports both a
client ID metadata document and dynamic client registration, so there is no key to paste).

## What it can do

- **X:** search posts with X's own operators, read posts, threads, replies, quotes, profiles,
  "About this account" details, timelines, media, followers, following and List members.
- **Reddit:** search Reddit or one subreddit, read subreddits, posts, comments and users.
- **Account:** check the credit balance, limits and identity (free calls).
- **Monitors (optional):** create, update or delete a monitor that watches a search, an account
  or a subreddit. These tools appear only if you grant the `monitors:write` scope at sign-in.

Every data tool is annotated read-only. The package marks the `weir` server `untrusted`, so
Hermes asks before any call that is not read-only (the monitor writes) and refuses those calls in
unattended runs.

## Cost

Weir bills per result in credits. A free account gets 5,000 credits every month, no card. A call
costs 1 credit, plus 1 per X post, 2 per profile and 3 per Reddit post or comment; a failed call
costs nothing. Paid packs never expire. See <https://weirapp.io/pricing>.

## Disclosure

- Every tool call goes to `api.weirapp.io`. The search terms, handles, links and subreddits you
  ask about are sent to Weir to run the lookup.
- Weir reads public data only and is read-only on X and Reddit: it never posts, likes, follows or
  votes.
- Weir is not affiliated with, endorsed by or licensed by X Corp. or Reddit, Inc.; access to
  their data can change.
- Reddit blocks some reads at times; Weir then returns an error and charges nothing.
- The tool set is served by the remote server at runtime and is not part of the pinned files.

Docs: <https://docs.weirapp.io/mcp> · Privacy: <https://weirapp.io/privacy> · Terms:
<https://weirapp.io/terms> · Support: support@weirapp.io
