import assert from "node:assert/strict";
import { test } from "node:test";

import { configPath, formatPost, formatUser, parseArgs, postIdOf, userOf } from "../bin/weir.js";

test("parses flags with values, boolean flags and positionals", () => {
  const { positional, flags } = parseArgs(["x", "search", "artemis OR moon", "--from", "NASA", "--limit=5", "--json"]);
  assert.deepEqual(positional, ["x", "search", "artemis OR moon"]);
  assert.deepEqual(flags, { from: "NASA", limit: "5", json: true });
  assert.throws(() => parseArgs(["x", "search", "--from"]), /needs a value/);
});

test("reads handles, ids and profile links", () => {
  assert.equal(userOf("@NASA"), "NASA");
  assert.equal(userOf("https://x.com/github/status/1"), "github");
  assert.equal(userOf("11348282"), "11348282");
  assert.throws(() => userOf("not a handle!"));
  assert.throws(() => userOf("../v1/usage"));
});

test("reads post ids from links and bare ids", () => {
  assert.equal(postIdOf("https://x.com/NASA/status/2119136607009734978?s=20"), "2119136607009734978");
  assert.equal(postIdOf("2119136607009734978"), "2119136607009734978");
  assert.throws(() => postIdOf("https://x.com/NASA"));
});

test("keeps the config in the platform's usual place", () => {
  assert.equal(configPath({ WEIR_CONFIG: "/tmp/weir.json" }, "linux"), "/tmp/weir.json");
  assert.match(configPath({ XDG_CONFIG_HOME: "/cfg" }, "linux").replace(/\\/g, "/"), /^\/cfg\/weir\/config\.json$/);
  assert.match(configPath({ APPDATA: "C:/Users/a/AppData/Roaming" }, "win32").replace(/\\/g, "/"), /Roaming\/weir\/config\.json$/);
});

test("prints a post and a profile on a few readable lines", () => {
  const post = formatPost({
    createdAt: "2026-11-07T18:35:13.000Z",
    author: { username: "NASA" },
    likeCount: 736,
    retweetCount: 160,
    replyCount: 95,
    viewCount: 139361,
    text: "Do you want to be an astronaut?\n\nApplications are open.",
    url: "https://x.com/NASA/status/2119136607009734978",
  });
  assert.match(post, /^2026-11-07 18:35  @NASA  likes 736 · reposts 160 · replies 95 · views 139,361/);
  assert.match(post, /Do you want to be an astronaut\? Applications are open\./);
  const user = formatUser({ username: "github", name: "GitHub", followersCount: 2600000, statusesCount: 9000, createdAt: "2008-02-11T04:41:50.000Z", description: "How people build software.", url: "https://x.com/github" });
  assert.match(user, /^@github \(GitHub\) · 2,600,000 followers · 9,000 posts · joined 2008-02-11/);
});
