#!/usr/bin/env node
// weir: the command line for Weir (https://weirapp.io), public X (Twitter) and Reddit data.
// No dependencies; Node.js 18 or later (global fetch). MIT licensed.

import { mkdirSync, readFileSync, writeFileSync, rmSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

const VERSION = "0.1.0";
const DEFAULT_API = "https://api.weirapp.io";

const HELP = `weir ${VERSION}: public X (Twitter) and Reddit data from the command line.

Setup
  weir login [--key KEY]        Save your API key (get one free at https://weirapp.io/signup)
  weir logout                   Forget the saved key
  weir whoami | usage | limits  Who you are, your credits, your rate limits (free)

X (Twitter)
  weir x search <query>         Search posts. Options: --from a,b --lang en --since ISO --until ISO
                                --sort latest|top --limit N --pages N --original
  weir x user <handle>          A profile (handle, id or x.com link)
  weir x about <handle>         "About this account": country, connected via, renames
  weir x posts <handle>         An account's latest posts (--limit N --pages N)
  weir x post <id|link>         One post
  weir x thread <id|link>       The author's whole thread
  weir x replies <id|link>      Replies to a post (--limit N --pages N)
  weir x followers <handle>     Followers (--pages N)

Reddit
  weir reddit search <query>    Search Reddit (--subreddit name --sort --time --limit N)
  weir reddit posts <subreddit> A subreddit's posts (--sort hot|new|top --limit N)
  weir reddit post <id>         One post
  weir reddit comments <id>     A post's comments (--limit N)

More
  weir monitors list            Your monitors
  weir api <METHOD> <path> [json]  Call any endpoint, e.g. weir api GET /v1/x/users/NASA

Flags: --json prints the raw JSON; --api-url URL overrides ${DEFAULT_API}.
Your key comes from --key, then WEIR_API_KEY, then the saved config.
Costs: 1 credit per call plus 1 per X post, 2 per profile, 3 per Reddit post; failed calls are free.
5,000 free credits every month. Docs: https://docs.weirapp.io`;

// ---------- arguments ----------

const FLAGS_WITH_VALUES = new Set([
  "key", "from", "lang", "since", "until", "sort", "limit", "pages", "subreddit", "time", "api-url",
]);

export function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--") {
      positional.push(...argv.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const [name, inline] = arg.slice(2).split(/=(.*)/s);
      if (FLAGS_WITH_VALUES.has(name)) {
        const value = inline ?? argv[i + 1];
        if (value === undefined) throw new UsageError(`--${name} needs a value`);
        flags[name] = value;
        if (inline === undefined) i += 1;
      } else {
        flags[name] = true;
      }
    } else if (arg === "-h") {
      flags.help = true;
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

class UsageError extends Error {}

/** A handle, numeric id or x.com / twitter.com profile link, as the API path takes it. */
export function userOf(value) {
  if (!value) throw new UsageError("Give a handle, a numeric id or a profile link.");
  const link = /(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})(?:[/?#]|$)/i.exec(value);
  const text = (link ? link[1] : value).replace(/^@/, "");
  if (!/^(?:\d{1,20}|[A-Za-z0-9_]{1,15})$/.test(text)) {
    throw new UsageError(`Not a handle, id or profile link: ${value}`);
  }
  return text;
}

/** A post id from a status link, or a bare id. */
export function postIdOf(value) {
  if (!value) throw new UsageError("Give a post id or link.");
  const link = /\/status(?:es)?\/(\d{1,20})/.exec(value);
  const id = link ? link[1] : value.trim();
  if (!/^\d{1,20}$/.test(id)) throw new UsageError(`Not a post id or link: ${value}`);
  return id;
}

function positiveInt(value, name, max) {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > max) throw new UsageError(`--${name} must be 1 to ${max}`);
  return n;
}

// ---------- config ----------

export function configPath(env = process.env, platform = process.platform) {
  if (env.WEIR_CONFIG) return env.WEIR_CONFIG;
  if (platform === "win32" && env.APPDATA) return join(env.APPDATA, "weir", "config.json");
  const base = env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(base, "weir", "config.json");
}

function readConfig() {
  try {
    return JSON.parse(readFileSync(configPath(), "utf8"));
  } catch {
    return {};
  }
}

function writeConfig(config) {
  const path = configPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  try {
    chmodSync(path, 0o600);
  } catch {
    // Windows keeps its own ACLs.
  }
  return path;
}

function apiKey(flags) {
  return flags.key || process.env.WEIR_API_KEY || readConfig().apiKey || null;
}

// ---------- HTTP ----------

async function call(method, path, { flags, body, query } = {}) {
  const key = apiKey(flags);
  if (!key) throw new UsageError("No API key. Run `weir login` or set WEIR_API_KEY.");
  const base = (flags["api-url"] || DEFAULT_API).replace(/\/$/, "");
  const url = new URL(base + path);
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(name, String(value));
  }
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${key}`,
      accept: "application/json",
      "user-agent": `weirapp-cli/${VERSION} (+https://weirapp.io)`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  const charged = Number(response.headers.get("x-credits-charged") ?? 0) || 0;
  if (!response.ok) {
    const message = json?.error?.message ?? `HTTP ${response.status}`;
    const retry = response.headers.get("retry-after");
    throw new ApiError(`${message}${retry ? ` Retry after ${retry} s.` : ""}`, response.status);
  }
  return { json, charged, remaining: response.headers.get("x-credits-remaining") };
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** Follows meta.nextCursor for up to `pages` pages, deduping by id. */
async function paged(method, path, { flags, body, query, pages = 1 }) {
  const items = [];
  const seen = new Set();
  let cursor;
  let charged = 0;
  let remaining = null;
  for (let page = 0; page < pages; page += 1) {
    const result = await call(method, path, {
      flags,
      body: body ? { ...body, ...(cursor ? { cursor } : {}) } : undefined,
      query: body ? query : { ...query, ...(cursor ? { cursor } : {}) },
    });
    charged += result.charged;
    remaining = result.remaining;
    for (const item of result.json?.data ?? []) {
      const id = item.id ?? JSON.stringify(item);
      if (!seen.has(id)) {
        seen.add(id);
        items.push(item);
      }
    }
    cursor = result.json?.meta?.nextCursor;
    if (!cursor) break;
  }
  return { json: { data: items, meta: { nextCursor: cursor ?? null } }, charged, remaining };
}

// ---------- printing ----------

const number = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : "-");
const oneLine = (text, max = 280) => {
  const flat = String(text ?? "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};

export function formatPost(post) {
  const time = String(post.createdAt ?? "").slice(0, 16).replace("T", " ");
  const counts = `likes ${number(post.likeCount)} · reposts ${number(post.retweetCount)} · replies ${number(post.replyCount)} · views ${number(post.viewCount)}`;
  const shown = post.retweetedPost ? `RT @${post.retweetedPost.author?.username}: ${post.retweetedPost.text}` : post.text;
  return `${time}  @${post.author?.username ?? "?"}  ${counts}\n  ${oneLine(shown)}\n  ${post.url ?? ""}`;
}

export function formatUser(user) {
  return `@${user.username} (${user.name}) · ${number(user.followersCount)} followers · ${number(user.statusesCount)} posts · joined ${String(user.createdAt ?? "").slice(0, 10)}${user.protected ? " · protected" : ""}\n  ${oneLine(user.description ?? "")}\n  ${user.url ?? ""}`;
}

function formatAbout(about) {
  const p = about.aboutProfile ?? {};
  const doubt = p.accountBasedIn && p.locationAccurate === false ? " (X: may not be accurate)" : "";
  const renames = p.usernameChanges?.count ?? 0;
  return [
    `@${about.username} (${about.name})`,
    `  Account based in: ${p.accountBasedIn ?? "not shown"}${doubt}`,
    `  Connected via:    ${p.source ?? "not shown"}`,
    `  Username changes: ${renames}${p.usernameChanges?.lastChangedAt ? ` (last ${p.usernameChanges.lastChangedAt.slice(0, 10)})` : ""}`,
    `  Joined:           ${String(about.createdAt ?? "").slice(0, 10)}`,
  ].join("\n");
}

function formatRedditPost(post) {
  const time = String(post.createdAt ?? "").slice(0, 16).replace("T", " ");
  const link = post.permalink ? new URL(post.permalink, "https://www.reddit.com").href : (post.url ?? "");
  return `${time}  r/${post.subreddit ?? "?"}  score ${number(post.score)} · comments ${number(post.numComments)}\n  ${oneLine(post.title)}\n  ${link}`;
}

function formatRedditComment(comment) {
  return `u/${comment.author ?? "?"}  score ${number(comment.score)}\n  ${oneLine(comment.body)}`;
}

function print(result, flags, format) {
  if (flags.json || !format) {
    process.stdout.write(`${JSON.stringify(result.json, null, 2)}\n`);
  } else {
    const data = result.json?.data;
    const items = Array.isArray(data) ? data : [data];
    process.stdout.write(`${items.filter(Boolean).map(format).join("\n\n")}\n`);
    if (Array.isArray(data)) process.stderr.write(`${data.length} result${data.length === 1 ? "" : "s"}\n`);
  }
  if (result.charged || result.remaining) {
    process.stderr.write(`credits charged: ${result.charged}${result.remaining ? ` · remaining: ${result.remaining}` : ""}\n`);
  }
}

// ---------- commands ----------

async function login(flags) {
  let key = flags.key;
  if (!key) {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    key = await new Promise((resolve) => rl.question("Paste your Weir API key (from https://weirapp.io/dashboard/keys): ", (answer) => {
      rl.close();
      resolve(answer.trim());
    }));
  }
  if (!key) throw new UsageError("No key given.");
  const result = await call("GET", "/v1/whoami", { flags: { ...flags, key } });
  const path = writeConfig({ ...readConfig(), apiKey: key });
  const who = result.json?.data ?? {};
  process.stderr.write(`Saved to ${path}.\nSigned in: workspace ${who.accountId ?? "?"}, scopes ${(who.scopes ?? []).join(", ") || "?"}\n`);
}

async function x(sub, args, flags) {
  const limit = positiveInt(flags.limit, "limit", 100);
  const pages = positiveInt(flags.pages, "pages", 20) ?? 1;
  switch (sub) {
    case "search": {
      const query = args.join(" ").trim();
      const fromUsers = flags.from ? String(flags.from).split(",").map((u) => userOf(u.trim())) : undefined;
      if (!query && !fromUsers) throw new UsageError("weir x search <query> [--from handle]");
      const body = {
        ...(query ? { query } : {}),
        ...(fromUsers ? { fromUsers } : {}),
        ...(flags.lang ? { language: flags.lang } : {}),
        ...(flags.since ? { since: new Date(flags.since).toISOString() } : {}),
        ...(flags.until ? { until: new Date(flags.until).toISOString() } : {}),
        ...(flags.original ? { onlyOriginal: true } : {}),
        sort: flags.sort === "top" ? "top" : "latest",
        limit: limit ?? 20,
      };
      return print(await paged("POST", "/v1/x/search", { flags, body, pages }), flags, formatPost);
    }
    case "user":
      return print(await call("GET", `/v1/x/users/${encodeURIComponent(userOf(args[0]))}`, { flags }), flags, formatUser);
    case "about":
      return print(await call("GET", `/v1/x/users/${encodeURIComponent(userOf(args[0]))}/about`, { flags }), flags, formatAbout);
    case "posts":
      return print(await paged("GET", `/v1/x/users/${encodeURIComponent(userOf(args[0]))}/posts`, { flags, query: { limit: Math.min(limit ?? 20, 20) }, pages }), flags, formatPost);
    case "post":
      return print(await call("GET", `/v1/x/posts/${postIdOf(args[0])}`, { flags }), flags, formatPost);
    case "thread":
      return print(await call("GET", `/v1/x/posts/${postIdOf(args[0])}/thread`, { flags }), flags, formatPost);
    case "replies":
      return print(await paged("GET", `/v1/x/posts/${postIdOf(args[0])}/replies`, { flags, query: { limit: limit ?? 20 }, pages }), flags, formatPost);
    case "followers":
      return print(await paged("GET", `/v1/x/users/${encodeURIComponent(userOf(args[0]))}/followers`, { flags, pages }), flags, formatUser);
    default:
      throw new UsageError("weir x search|user|about|posts|post|thread|replies|followers ...");
  }
}

async function reddit(sub, args, flags) {
  const limit = positiveInt(flags.limit, "limit", 100);
  const pages = positiveInt(flags.pages, "pages", 20) ?? 1;
  switch (sub) {
    case "search": {
      const query = args.join(" ").trim();
      if (!query) throw new UsageError("weir reddit search <query> [--subreddit name]");
      const body = {
        query,
        ...(flags.subreddit ? { subreddit: String(flags.subreddit).replace(/^r\//, "") } : {}),
        ...(flags.sort ? { sort: flags.sort } : {}),
        ...(flags.time ? { time: flags.time } : {}),
        limit: limit ?? 25,
      };
      return print(await paged("POST", "/v1/reddit/search", { flags, body, pages }), flags, formatRedditPost);
    }
    case "posts": {
      const name = String(args[0] ?? "").replace(/^r\//, "");
      if (!name) throw new UsageError("weir reddit posts <subreddit>");
      return print(await paged("GET", `/v1/reddit/subreddits/${encodeURIComponent(name)}/posts`, { flags, query: { sort: flags.sort, time: flags.time, limit: limit ?? 25 }, pages }), flags, formatRedditPost);
    }
    case "post":
      if (!args[0]) throw new UsageError("weir reddit post <id>");
      return print(await call("GET", `/v1/reddit/posts/${encodeURIComponent(args[0])}`, { flags }), flags, formatRedditPost);
    case "comments":
      if (!args[0]) throw new UsageError("weir reddit comments <id>");
      return print(await paged("GET", `/v1/reddit/posts/${encodeURIComponent(args[0])}/comments`, { flags, query: { limit: limit ?? 50 }, pages }), flags, formatRedditComment);
    default:
      throw new UsageError("weir reddit search|posts|post|comments ...");
  }
}

export async function main(argv) {
  const { positional, flags } = parseArgs(argv);
  const [command, sub, ...rest] = positional;
  if (flags.version || command === "version") return void process.stdout.write(`${VERSION}\n`);
  if (!command || flags.help || command === "help") return void process.stdout.write(`${HELP}\n`);
  switch (command) {
    case "login":
      return login(flags);
    case "logout":
      rmSync(configPath(), { force: true });
      return void process.stderr.write("Signed out: the saved key is gone.\n");
    case "whoami":
    case "usage":
    case "limits":
      return print(await call("GET", `/v1/${command}`, { flags }), { ...flags, json: true });
    case "x":
      return x(sub, rest, flags);
    case "reddit":
      return reddit(sub, rest, flags);
    case "monitors":
      if (sub !== "list") throw new UsageError("weir monitors list");
      return print(await call("GET", "/v1/monitors", { flags, query: { limit: positiveInt(flags.limit, "limit", 100) } }), { ...flags, json: true });
    case "api": {
      const method = String(sub ?? "").toUpperCase();
      const [path, raw] = rest;
      if (!["GET", "POST", "PATCH", "DELETE"].includes(method) || !path?.startsWith("/")) {
        throw new UsageError("weir api <GET|POST|PATCH|DELETE> </v1/path> [json body]");
      }
      let body;
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          throw new UsageError("The body must be JSON, in quotes.");
        }
      }
      return print(await call(method, path, { flags, body }), { ...flags, json: true });
    }
    default:
      throw new UsageError(`Unknown command: ${command}. Run weir --help.`);
  }
}

const isMain = process.argv[1] && /weir(\.js)?$/.test(process.argv[1].replace(/\\/g, "/"));
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    if (error instanceof UsageError) process.stderr.write(`${error.message}\n`);
    else if (error instanceof ApiError) process.stderr.write(`Error (${error.status}): ${error.message}\n`);
    else process.stderr.write(`Error: ${error?.message ?? error}\n`);
    process.exitCode = error instanceof ApiError && error.status === 402 ? 3 : 1;
  });
}
