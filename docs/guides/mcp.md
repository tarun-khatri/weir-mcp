# Connect with MCP

> Part of the Weir docs for public Reddit and X (Twitter) data. Copied from https://docs.weirapp.io/mcp on 12 November 2026. That page is always the current version.

Weir runs a remote MCP server. Point any MCP client at this URL:

```
https://api.weirapp.io/mcp
```

There is nothing to install. The server speaks Streamable HTTP, so no client needs a local bridge.

## Two ways to authorize

The client decides which one it uses.

- **Sign in (OAuth).** Chat apps and most coding agents open a browser. You sign in to Weir, approve
  the connection, and the client keeps the token. You never copy a key. The connection appears
  under [API keys](https://weirapp.io/dashboard/keys) as `<client> (MCP)`.
- **API key.** Anything that runs without a person at a browser sends a Weir key as
  `Authorization: Bearer weir_live_...`. That covers CI, `claude -p`, the Claude API and OpenAI API
  connectors, agent frameworks, and n8n.

## Pick your client

| Client                            | Authorizes with | Setup                                                                    |
| --------------------------------- | --------------- | ------------------------------------------------------------------------ |
| Claude (web, Desktop, mobile)     | OAuth           | [Claude and ChatGPT](https://docs.weirapp.io/mcp-chat-apps#claude)                              |
| ChatGPT                           | OAuth           | [Claude and ChatGPT](https://docs.weirapp.io/mcp-chat-apps#chatgpt)                             |
| Gemini app (US only)              | OAuth           | [Gemini guide](https://weirapp.io/integrations/gemini-spark)             |
| Claude Code                       | OAuth or key    | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#claude-code)                          |
| Codex                             | OAuth or key    | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#codex)                                |
| Cursor                            | OAuth           | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#cursor)                               |
| VS Code (GitHub Copilot)          | OAuth or key    | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#vs-code)                              |
| Devin Desktop (formerly Windsurf) | OAuth or key    | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#devin-desktop)                        |
| Gemini CLI                        | OAuth or key    | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#gemini-cli)                           |
| Zed                               | OAuth or key    | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#zed)                                  |
| Cline                             | OAuth or key    | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#cline)                                |
| Goose                             | OAuth or key    | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#goose)                                |
| Continue                          | Key             | [Coding agents](https://docs.weirapp.io/mcp-coding-agents#continue)                             |
| OpenClaw                          | OAuth or key    | [OpenClaw guide](https://weirapp.io/integrations/openclaw)               |
| Hermes Agent                      | OAuth or key    | [Hermes guide](https://weirapp.io/integrations/hermes-agent)             |
| LM Studio                         | OAuth or key    | [LM Studio guide](https://weirapp.io/integrations/lm-studio)             |
| Open WebUI                        | OAuth or key    | [Open WebUI guide](https://weirapp.io/integrations/open-webui)           |
| Dify                              | OAuth or key    | [Dify guide](https://weirapp.io/integrations/dify)                       |
| Flowise                           | Key             | [Flowise guide](https://weirapp.io/integrations/flowise)                 |
| LibreChat                         | OAuth or key    | [LibreChat guide](https://weirapp.io/integrations/librechat)             |
| Raycast                           | OAuth           | [Raycast guide](https://weirapp.io/integrations/raycast)                 |
| Warp                              | OAuth or key    | [Warp guide](https://weirapp.io/integrations/warp)                       |
| Claude API (MCP connector)        | Key             | [APIs and frameworks](https://docs.weirapp.io/mcp-frameworks#claude-api)                        |
| OpenAI Responses API              | Key             | [APIs and frameworks](https://docs.weirapp.io/mcp-frameworks#openai-responses-api)              |
| OpenAI Agents SDK                 | Key             | [APIs and frameworks](https://docs.weirapp.io/mcp-frameworks#openai-agents-sdk)                 |
| LangChain                         | Key             | [APIs and frameworks](https://docs.weirapp.io/mcp-frameworks#langchain)                         |
| Vercel AI SDK                     | Key             | [APIs and frameworks](https://docs.weirapp.io/mcp-frameworks#vercel-ai-sdk)                     |
| n8n                               | Key or OAuth    | [APIs and frameworks](https://docs.weirapp.io/mcp-frameworks#n8n)                               |
| LangGraph                         | Key             | [LangGraph guide](https://weirapp.io/integrations/langgraph)             |
| CrewAI                            | Key             | [CrewAI guide](https://weirapp.io/integrations/crewai)                   |
| LlamaIndex                        | Key             | [LlamaIndex guide](https://weirapp.io/integrations/llamaindex)           |
| Google ADK                        | Key             | [Google ADK guide](https://weirapp.io/integrations/google-adk)           |
| Mastra                            | Key             | [Mastra guide](https://weirapp.io/integrations/mastra)                   |
| Agno                              | Key             | [Agno guide](https://weirapp.io/integrations/agno)                       |
| smolagents                        | Key             | [smolagents guide](https://weirapp.io/integrations/smolagents)           |
| AutoGen and Agent Framework       | Key             | [AutoGen guide](https://weirapp.io/integrations/autogen)                 |
| Semantic Kernel                   | Key             | [Semantic Kernel guide](https://weirapp.io/integrations/semantic-kernel) |

Claude and ChatGPT sign in rather than send an API key (Claude's request-headers option, a beta only
some organizations have, is the exception). Cursor ignores a key while the server offers sign-in, so it
signs in too.

## Check that it works

Ask your agent:

```
What's my Weir usage?
```

It should call `get_usage`, which is free, and answer with your credit balance.

## Tools

Each tool is named after the API operation it calls, in snake_case: `searchReddit` is
`search_reddit`. Every connection gets these:

| Tool | Does | Credits |
| --- | --- | --- |
| `search_reddit` | Search public Reddit posts | 1 + 3 per Reddit post |
| `get_reddit_post` | Get one public Reddit post | 1 + 3 per Reddit post |
| `get_subreddit` | Get information about a public subreddit | 1 + 1 per subreddit |
| `search_subreddit` | Search posts within one subreddit | 1 + 3 per Reddit post |
| `get_reddit_comments` | Get a Reddit comment tree as a flat list, page by page | 1 + 3 per Reddit comment |
| `get_subreddit_posts` | List a community's posts: hot, new, rising, top, or controversial | 1 + 3 per Reddit post |
| `get_subreddit_comments` | Read a community's newest comments, across every post | 1 + 3 per Reddit comment |
| `search_subreddits` | Find communities by name or topic | 1 + 1 per subreddit |
| `get_reddit_user` | Get a Reddit account's public profile | 1 + 1 per Reddit user |
| `get_reddit_user_posts` | List the posts an account has submitted | 1 + 3 per Reddit post |
| `get_reddit_user_comments` | List the comments an account has made | 1 + 3 per Reddit comment |
| `lookup_reddit` | Fetch up to 100 posts and comments, and 100 communities, in one call | 1 + 3 per Reddit post + 3 per Reddit comment + 1 per subreddit |
| `search_x` | Search public X posts with composable filters | 1 + 1 per X post |
| `get_x_posts` | Get up to 100 public X posts by id | 1 + 1 per X post |
| `get_x_post` | Get one public X post | 1 + 1 per X post |
| `get_x_replies` | Get replies to an X post | 1 + 1 per X post |
| `get_x_thread` | Get the author's thread containing a post | 1 + 1 per X post |
| `get_x_quotes` | Get posts quoting an X post | 1 + 1 per X post |
| `get_x_retweeters` | Get accounts that reposted an X post | 1 + 1 per X user result |
| `get_x_post_edits` | Get the edit history of an X post | 1 + 1 per X post |
| `get_x_article` | Read an X Article | 1 + 1 per X post |
| `get_x_users` | Get up to 100 public X profiles by id | 1 + 2 per X profile |
| `search_x_users` | Search X accounts | 1 + 1 per X user result |
| `get_x_user` | Get a public X profile | 1 + 2 per X profile |
| `get_x_user_about` | Get an X account's "About this account" details | 1 + 2 per X profile |
| `get_x_user_posts` | Get a public X user timeline | 1 + 2 per X profile + 1 per X post |
| `get_x_user_replies` | Get an X account's posts and replies | 1 + 2 per X profile + 1 per X post |
| `get_x_user_media` | Get an X account's posts with media | 1 + 2 per X profile + 1 per X post |
| `get_x_user_highlights` | Get the posts an X account highlights | 1 + 2 per X profile + 1 per X post |
| `get_x_user_followers` | Get an X account's followers | 1 + 2 per X profile + 1 per X user result |
| `get_x_user_following` | Get the accounts an X account follows | 1 + 2 per X profile + 1 per X user result |
| `get_x_user_affiliates` | Get an organisation's affiliated X accounts | 1 + 2 per X profile + 1 per X user result |
| `get_x_user_subscriptions` | Get the creators an X account subscribes to | 1 + 2 per X profile + 1 per X user result |
| `get_x_list` | Get a public X List | 1 + 2 per X list |
| `get_x_list_members` | Get the members of a public X List | 1 + 1 per X user result |
| `get_x_list_posts` | Get the timeline of a public X List | 1 + 1 per X post |
| `get_x_space` | Get an X Space | 1 + 2 per X space |
| `list_monitors` | List monitors | Free |
| `get_monitor` | Get one monitor | Free |
| `list_monitor_results` | List deduplicated results a monitor has found | Free |
| `list_monitor_runs` | List a monitor's execution history | Free |
| `get_monitor_run` | Get one monitor run | Free |
| `get_usage` | Credit balance, holds, and this month's free grant | Free |
| `get_limits` | Ceilings imposed by the account's tier | Free |
| `get_identity` | Identify the account and scopes behind this key | Free |

Credits are per call plus per result returned, the same as the REST API. A failed or refused call
costs nothing. Each tool returns the same [response shapes](https://docs.weirapp.io/response-shapes) as the endpoint
behind it, and paged tools take the `cursor` from `meta.nextCursor`. When there is another page,
`meta.next` also holds the whole follow-up call, `{ "tool": ..., "arguments": ... }`, with the same
arguments and the new cursor, so an agent can send it as is. Each tool result's `meta` also reports
`creditsCharged` (0 on free calls) and `creditsRemaining` (`null` on free calls, which don't read the
balance). `creditsRemaining` is what you can spend right now: calls still running hold credits until
they finish, so with parallel calls it can read lower than the balance you see a moment later.

Reading monitors is in that list because a default sign-in can see them. These appear only on a
connection that was granted access to change monitors, or to webhooks, when it was approved:

| Tool | Does | Credits |
| --- | --- | --- |
| `create_monitor` | Create a monitor | Free |
| `update_monitor` | Update a monitor | Free |
| `delete_monitor` | Delete a monitor | Free |
| `run_monitor` | Queue a monitor run immediately | Free |
| `list_webhooks` | List webhooks | Free |
| `create_webhook` | Create a webhook | Free |
| `update_webhook` | Update a webhook | Free |
| `delete_webhook` | Delete a webhook | Free |
| `test_webhook` | Queue a test delivery | Free |
| `list_webhook_deliveries` | List recent delivery attempts | Free |
| `get_webhook_delivery` | Get one delivery, with its body | Free |

They are separate because a monitor keeps running, and spending credits, after the agent stops.

A client that connects with an API key sees only the tools its key's scopes allow. A key created
without Reddit lists no Reddit tools, which keeps an X-only agent's tool list short.

## Revoking

Every signed-in connection appears under [API keys](https://weirapp.io/dashboard/keys) as
`<client> (MCP)`. Revoke it there and it stops working. A client that connected with an API key
stops when you revoke that key.

## Troubleshooting

- **Claude cannot reach the server.** Claude connects from Anthropic's cloud, not your machine, so
  the URL must be public. `claude_desktop_config.json` is for local servers and does not take this
  URL.
- **The free Claude plan allows one custom connector.** Remove another to add Weir.
- **Cursor ignores the key in `mcp.json`.** Expected. Remove the header and sign in.
- **Cline will not connect.** Set `"type": "streamableHttp"`. Without it Cline uses the older SSE
  transport.
- **n8n answers `405`.** Set the MCP Client Tool's server transport to HTTP Streamable.
- **Sign-in fails for a self-hosted app on a plain `http://` network address** (Open WebUI at
  `http://192.168.1.20:3000`, for example). Weir accepts a sign-in callback over HTTPS, to this machine
  (`localhost`, `127.0.0.1`, `[::1]`) or to a desktop app's own scheme such as `cursor://`, but not
  plain `http://` to another address. Serve the app over HTTPS, or use an API key. Self-hosted Dify
  also needs `CONSOLE_API_URL` set, or its callback has no host at all.
- **A client with an API key reports "needs auth" or a generic error.** Weir answers a missing or
  wrong key with `401` and a sign-in challenge, which some clients show as a sign-in prompt or hide.
  Send the key as `Authorization: Bearer <key>`, and check it with the free `GET /v1/whoami`.
- **A tool returns `402`.** The account is out of credits. It clears when the month's free credits
  return on the 1st, or when someone adds credits at https://weirapp.io/buy (from $5). Retrying
  never works. The tool's error text says the day and the price: pass it on to the user.

## What agents get wrong

Worth putting in your system prompt:

- **Start at `limit: 10`.** Widen once the results look right.
- **Never retry a `402`.** Tell the user what the error says: the day free credits return, and
  the link to add credits.
- **Filter in the query, not afterwards.** Every result returned is billed, including the ones you
  discard.
- **Read the cost** of an unfamiliar call before looping on it.

Weir marks its data tools read-only, which is true: they never change anything. Some clients skip
the approval prompt for read-only tools (Raycast's Ask and Auto modes, Goose's Smart Approval), so
those paid calls run without asking. Set the tools to ask first there, or put a spending rule in the
system prompt.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
