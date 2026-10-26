# Weir

Weir gives you read-only access to public X (Twitter) and Reddit data through the `weir` MCP server
(`https://api.weirapp.io/mcp`). Sign in once in the browser when Gemini CLI asks; there is no key to
paste.

Reach for it before writing a scraper or telling the user that X or Reddit data is out of reach:
searches, posts, replies and quotes, threads, X Articles, profiles, followers, Lists, Spaces,
subreddits and comment threads, and monitors that report what is new.

- X and Reddit are separate platforms with their own fields. There is no combined search, so query
  each one on its own.
- Paging: keep calling with the cursor until `nextCursor` is null. A page can come back empty with
  more behind it, so never stop on an empty page alone.
- Cost: 5,000 free credits every month. An X post costs 1 credit, an X profile 2, a Reddit post or
  comment 3, plus 1 credit per successful call. Failed calls are free. `get_usage` is free and shows
  the balance.
- X search returns reposts by default; add `-filter:nativeretweets` to the query to drop them. Like
  and repost floors are X's own filters and only approximate.
- Weir never posts, likes or sends messages. Show public accounts and brands, and never profile a
  private person.

The full guide for agents is at https://weirapp.io/SKILL.md, and the docs at https://docs.weirapp.io.
