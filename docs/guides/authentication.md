# Authentication

> Part of the Weir docs for public Reddit and X (Twitter) data. Copied from https://docs.weirapp.io/authentication on 12 November 2026. That page is always the current version.

Two ways in. The REST API takes an API key. The [MCP server](https://docs.weirapp.io/mcp) takes an API key too, or signs
your client in with OAuth so you never handle a key.

## API keys

One header, on every request:

```
Authorization: Bearer weir_live_...
```

Create keys under [API keys](https://weirapp.io/dashboard/keys). A key is shown once, when you
create it. Only its hash is stored, so a lost key cannot be recovered. Create a new one.

A key is a bearer credential: whoever holds it spends your credits. Keep it on a server, in an
environment variable, and out of browser code and public repositories.

Keys labelled test start with `weir_test_`. They work the same way and spend the same credits; the
label only helps you tell keys apart.

## OAuth, for MCP clients

Claude, ChatGPT, Cursor, and most coding agents connect to `https://api.weirapp.io/mcp` with OAuth
2.1. The client opens a browser, you sign in to Weir and approve, and the client keeps the token.
It refreshes the token itself.

The details a client developer needs: clients register themselves, by dynamic client registration
or a Client ID Metadata Document, so there is no client ID to paste. Every client is public (no
secret) and must use PKCE with `S256`. An access token lasts 1 hour; the refresh token lasts 30
days and rotates on every use.

Each approved connection appears under [API keys](https://weirapp.io/dashboard/keys) as
`<client> (MCP)`. Revoke it there to disconnect that client.

A connection can read Reddit and X and see your usage. It gets monitor and webhook access only if
you grant it on the approval screen. Clients that cannot open a browser use an API key on the same
URL instead. [MCP](https://docs.weirapp.io/mcp) lists which client does which.

## `401` and `403`

`401` means the key or token is missing, malformed, revoked, or expired. `403` means it is valid
but lacks a scope. Different problems, different fixes.

## Scopes

Grant the narrowest set that does the job.

| Scope            | Grants                                                     |
| ---------------- | ---------------------------------------------------------- |
| `read:reddit`    | Reddit endpoints                                           |
| `read:x`         | X endpoints                                                |
| `read:social`    | Umbrella. Every platform, including ones added later       |
| `usage:read`     | Usage introspection                                        |
| `monitors:read`  | List and read monitors, runs, and results                  |
| `monitors:write` | Create, change, delete, and trigger monitors. Implies read |
| `webhooks:read`  | List webhooks and deliveries                               |
| `webhooks:write` | Create, change, delete, and test webhooks. Implies read    |

Implication is resolved server-side, so you never list both halves.

`/v1/whoami`, `/v1/usage`, and `/v1/limits` answer any valid key, whatever its scopes, so a key
can always find out why it is being refused.

`read:social` is an umbrella rather than a synonym for "Reddit and X" on purpose: a key holding it
keeps working when a new platform ships. A key holding `read:reddit` and `read:x` does not, because
it said exactly which two it wanted.

## Expiry

Set one. The dashboard defaults to 90 days.

An expired key returns `401` the moment it lapses, with no grace period. "No expiration" exists
because CI needs it, but a key that lives forever outlives the laptop it was pasted onto.

## Rotating

No downtime, because keys are independent:

1. Create the new key with the same scopes.
2. Deploy it.
3. Confirm traffic moved. `/v1/whoami` reports which key id is in use, free.
4. Revoke the old one.

Revocation is immediate.

## Checking a key

```bash
curl --url https://api.weirapp.io/v1/whoami \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

It costs nothing, so it is always safe as a connectivity check.

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
