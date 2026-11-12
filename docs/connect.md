# Add Twitter (X) and Reddit data to Claude, ChatGPT, Cursor, Codex and VS Code

Weir is a remote MCP server at `https://api.weirapp.io/mcp`. Add it to an AI app once, and the app can search and read public X (Twitter) and Reddit data: posts, replies, threads, profiles, followers, Lists, subreddits and comments. There is nothing to install and no key to paste, because the app signs in with OAuth in your browser. Every account gets 5,000 free credits every month, with no card.

| App | How to add Weir |
| --- | --- |
| Claude (web, desktop, mobile) | [One-click link](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), then confirm |
| ChatGPT | Add a custom MCP server at chatgpt.com/plugins ([steps](#chatgpt)) |
| Cursor | [One-click link](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9) |
| Codex | `codex mcp add weir --url https://api.weirapp.io/mcp` |
| Claude Code | `claude mcp add --transport http weir https://api.weirapp.io/mcp` |
| VS Code (GitHub Copilot) | A short `mcp.json` ([steps](#vs-code)) |

## Claude

One click: [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp). The link opens Claude's own dialog with the name and URL filled in, and nothing is added until you confirm there. Then sign in on Weir's consent screen and approve.

By hand:

1. On Pro and Max, open **Customize**, then **Connectors**, then **+ Add**, then **Add custom connector**. On Team and Enterprise, open **Organization settings**, then **Connectors**, then **Add**, then **Custom**, then **Web**. On Team, only Owners can add one.
2. Name it `Weir` and paste the URL `https://api.weirapp.io/mcp`.
3. Leave the authentication settings as Claude detects them, and connect. Sign in to Weir and approve.

It works in Claude on the web, Claude Desktop and the mobile apps: the connector is added once and follows your account. The Free plan allows one custom connector.

## ChatGPT

1. Open [chatgpt.com/plugins](https://chatgpt.com/plugins), click **+**, and choose **Add custom MCP server**.
2. Name it `Weir`, paste the MCP URL `https://api.weirapp.io/mcp`, and choose **OAuth** for authentication.
3. Accept the warning, choose **Create as a plugin**, and install it. Sign in to Weir and approve when asked.
4. In a chat, mention `@Weir` to use it.

Custom MCP servers are available on ChatGPT Business and Enterprise/Edu, on the web. Pro accounts can connect one with read and fetch permissions. On Business, only admins and owners can add one. You do not need to turn on developer mode first.

## Cursor

One click: [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9). Cursor asks you to sign in the first time it connects.

By hand, put this in `~/.cursor/mcp.json`, or in `.cursor/mcp.json` for one project ([`configs/cursor.mcp.json`](../configs/cursor.mcp.json)):

```json
{
  "mcpServers": {
    "weir": {
      "url": "https://api.weirapp.io/mcp"
    }
  }
}
```

Cursor signs in with OAuth. It ignores an API key in this file while the server offers sign-in.

## Codex

```bash
codex mcp add weir --url https://api.weirapp.io/mcp
codex mcp login weir
```

The first command adds the server and the second signs you in, once. One config serves the Codex CLI, the IDE extension and the ChatGPT desktop app. To write the config by hand instead, see [`configs/codex.config.toml`](../configs/codex.config.toml).

## Claude Code

```bash
claude mcp add --transport http weir https://api.weirapp.io/mcp
```

Then run `/mcp` inside Claude Code and choose Weir to sign in. A browser opens: approve the connection. This repository is also a Claude Code plugin that adds the server together with a skill: see [Install in one command](../README.md#install-in-one-command).

## VS Code

For GitHub Copilot in VS Code, put this in `.vscode/mcp.json`, or in your user `mcp.json` ([`configs/vscode.mcp.json`](../configs/vscode.mcp.json)). The top-level key is `servers`, and the transport has to be stated:

```json
{
  "servers": {
    "weir": {
      "type": "http",
      "url": "https://api.weirapp.io/mcp"
    }
  }
}
```

Or from a terminal:

```bash
code --add-mcp '{"name":"weir","type":"http","url":"https://api.weirapp.io/mcp"}'
```

Start the server and sign in when VS Code asks.

## Without a browser: CI and headless runs

Anything that runs without a person at a browser sends a Weir API key to the same URL, as `Authorization: Bearer <key>`. Create a key at https://weirapp.io/dashboard/keys, keep it in the `WEIR_API_KEY` environment variable, and never commit it. In Claude Code:

```bash
claude mcp add --transport http weir https://api.weirapp.io/mcp --header "Authorization: Bearer $WEIR_API_KEY"
```

## Check that it works

Ask the app: "What's my Weir usage?" It should call `get_usage`, which is free, and answer with your credit balance.

## What the app can do, and what it costs

Every connection gets 45 tools: search, posts, replies, threads, profiles, followers, Lists, Spaces and Articles on X, search, subreddits, posts, comments and users on Reddit, and your own usage and monitors. A connection that was granted monitor or webhook access when it was approved gets 11 more, to create and change monitors and webhooks. Each tool costs the same credits as its endpoint, and a failed or refused call costs nothing. The [endpoint pages](README.md#endpoints) list every tool with its price, and [Pricing](pricing.md) shows what 1,000 results cost.

Weir reads public data only and is read-only: it never posts, likes, follows or sends messages. It is independent and not affiliated with X or Reddit.

## Other apps

Setup for more clients and frameworks is on the docs site: https://docs.weirapp.io/mcp, https://docs.weirapp.io/mcp-coding-agents and https://docs.weirapp.io/mcp-chat-apps. The guide in this folder is [Connect with MCP](guides/mcp.md).

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
