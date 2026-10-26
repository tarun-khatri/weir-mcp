# Weir MCP server — Reddit and X (Twitter) data for AI agents

Weir is a remote MCP server that gives Claude, ChatGPT, Cursor, VS Code, Codex and any other MCP
client read-only access to public Reddit and X (Twitter) data: search, posts, comment threads,
profiles, followers, Lists, Spaces and long-form X Articles, plus monitors that report what is new.

```
https://api.weirapp.io/mcp
```

Streamable HTTP. Clients sign in with OAuth on first use, so there is no key to paste; headless
runs can send an API key as a bearer token instead. No Reddit or X account or API key is needed.

- Website: https://weirapp.io
- Docs: https://docs.weirapp.io/mcp
- Official MCP Registry: `io.weirapp/weir`
- Pricing: 5,000 free credits every month, then prepaid credits; failed calls are free.

This repository holds a Claude Code plugin, a Gemini CLI extension, an agent skill and ready-made
client configurations. The server itself is hosted; there is nothing to run.

## Install in one command

| Where | Command |
| --- | --- |
| Claude Code (plugin: the server plus a skill that tells Claude when to use it) | `/plugin marketplace add tarun-khatri/weir-mcp`, then `/plugin install weir@weir` |
| Gemini CLI (extension: the server plus `GEMINI.md`) | `gemini extensions install https://github.com/tarun-khatri/weir-mcp` |
| Any agent that reads skills | `npx skills add tarun-khatri/weir-mcp` |

Each one signs you in with OAuth in the browser the first time a tool runs. Step-by-step guide: https://weirapp.io/integrations/agent-skills

## Set it up by hand

| Client | How |
| --- | --- |
| Claude (web, desktop, mobile) | Customize → Connectors → + Add → Add custom connector, URL `https://api.weirapp.io/mcp` (Team/Enterprise: Organization settings → Connectors) |
| Claude Code | `claude mcp add --transport http weir https://api.weirapp.io/mcp`, then `/mcp` to sign in |
| ChatGPT | Plugins → Add custom MCP server, URL `https://api.weirapp.io/mcp` (plan permitting) |
| Cursor | [`configs/cursor.mcp.json`](configs/cursor.mcp.json) in `~/.cursor/mcp.json` |
| VS Code (Copilot) | [`configs/vscode.mcp.json`](configs/vscode.mcp.json) in `.vscode/mcp.json` |
| Codex | [`configs/codex.config.toml`](configs/codex.config.toml) in `~/.codex/config.toml`, then `codex mcp login weir` |
| Devin Desktop | [`configs/devin-desktop.mcp_config.json`](configs/devin-desktop.mcp_config.json) |
| CI / headless (API key) | [`configs/claude-code.mcp.json`](configs/claude-code.mcp.json) with `WEIR_API_KEY` in the environment |

Full, current instructions for every client: https://docs.weirapp.io/mcp-coding-agents and
https://docs.weirapp.io/mcp-chat-apps

Check it works: ask your assistant "What's my Weir usage?" — it calls `get_usage`, which is free.

## Tools

Every endpoint of the REST API is also a tool. Highlights:

- **Reddit:** `search_reddit`, `search_subreddit`, `get_reddit_post`, `get_reddit_comments`,
  `get_subreddit`, `get_subreddit_posts`, `get_subreddit_comments`, `get_reddit_user`, `lookup_reddit`
- **X:** `search_x`, `get_x_post`, `get_x_thread`, `get_x_replies`, `get_x_quotes`, `get_x_article`,
  `get_x_user`, `get_x_user_posts`, `get_x_user_followers`, `get_x_list_posts`, `get_x_space`
- **Account and monitors:** `get_usage`, `get_limits`, `list_monitors`, `list_monitor_results`

All data tools are read-only and annotated as such. Tools accept pasted links as well as ids.

## Example prompts

- "What are developers on r/SaaS saying about usage-based pricing this month? Summarise the top threads."
- "Read the replies to https://x.com/… and group the main objections."
- "Read this X Article and give me the key claims: https://x.com/…/status/…"
- "Find recent X posts from @OpenAI with at least 500 likes about agents."

## Notes

Weir reads public data only and never posts, likes or messages. It is independent and not
affiliated with Reddit or X. Support: support@weirapp.io
