# X (Twitter) Articles API

`GET /v1/x/posts/{id}/article` returns the X Article a post carries: its title, cover image, and the full body as plain text, Markdown and X's own blocks, with every image and video in it. Pass the id of the post that shares the Article. A lookup costs 2 credits: 1 for the call and 1 for the post.

## Endpoints

Base URL `https://api.weirapp.io`. Send your API key as `Authorization: Bearer <key>`.

| Endpoint | What it does | Returns | Price in credits | MCP tool |
| --- | --- | --- | --- | --- |
| `GET /v1/x/posts/{id}/article` | Read an X Article | The Article, with the post and author that carry it | 1 per call + 1 per X post | `get_x_article` |

Prices are per successful call. A failed or refused call costs nothing.

## Parameters of `GET /v1/x/posts/{id}/article`

`id` goes in the path.

| Parameter | In | Type | Required | Meaning |
| --- | --- | --- | --- | --- |
| `id` | path | string | yes | Numeric post id: the digits after `/status/` in a post's URL. |

## Example: curl

Create a key at https://weirapp.io/dashboard/keys (it is shown once) and put it in `WEIR_API_KEY`.

```bash
export WEIR_API_KEY="weir_live_..."
export POST_ID="..."   # the number in the x.com/.../status/ link of the post that shares the Article
curl --request GET \
  --url "https://api.weirapp.io/v1/x/posts/$POST_ID/article" \
  --header "Authorization: Bearer $WEIR_API_KEY"
```

## Example: Python (standard library)

```python
import json
import os
import urllib.error
import urllib.request

post_id = os.environ["POST_ID"]  # the number in the x.com/.../status/ link of the post that shares the Article
url = f"https://api.weirapp.io/v1/x/posts/{post_id}/article"
request = urllib.request.Request(
    url,
    headers={
        "Authorization": "Bearer " + os.environ["WEIR_API_KEY"],
        "User-Agent": "weir-docs-example",
    },
)
try:
    with urllib.request.urlopen(request, timeout=60) as response:
        page = json.load(response)
        charged = response.headers["x-credits-charged"]
except urllib.error.HTTPError as error:
    # 402 is out of credits: do not retry. 429 and 503 can be retried after Retry-After.
    raise SystemExit(f"{error.code}: {json.load(error)['error']['message']}")

article = page["data"]
print(article["title"], article["publishedAt"], article["markdown"])
print("credits charged:", charged)
```

## Response fields you will use most

`GET /v1/x/posts/{id}/article` answers `200` with a `data` object and a `meta` object. The Article, with the post and author that carry it.

| Field | Type | Meaning |
| --- | --- | --- |
| `data.id` | string | The Article's own id, distinct from the id of the post carrying it. |
| `data.title` | string | The Article's title. |
| `data.previewText` | string or null | The opening lines X shows in a feed. |
| `data.text` | string or null | The full body as plain text. |
| `data.markdown` | string or null | The full body as Markdown (headings, emphasis, lists, quotes, code, links, images, and embedded posts) for reading or for a model. Null wherever `text` is. |
| `data.blocks` | array of object or null | The body in X's own block structure. Null wherever `text` is. |
| `data.media` | array of object | Images and videos in the body, in order. Empty in lists of posts. |
| `data.coverImage` | object or null | An object with `id`, `type`, `url`, `width`, `height`. |
| `data.publishedAt`, `updatedAt` | string or null | When it was published and last updated, or `null`. |
| `data.postId` | string | The post that carries the Article. |
| `data.author` | object | An object with `id`, `username`, `name`, `verified`, `followersCount`, `profileImageUrl`. |
| `meta.requestId` | string | Quote it in a support request. |

Every field, with its type, is in the reference: [`getXArticle`](https://docs.weirapp.io/reference/x/getXArticle).

## Limits and caveats

- Pass the id of the post that shares the Article: the number in its x.com/.../status/ link. An x.com/i/article/ link carries the Article's own id, which is not a post id.
- A post that carries an Article has only a link as its text, so read the body here or in `article` on the post.
- `404` when the post does not exist or is not an Article.
- In lists of posts, such as search results and timelines, `article.text`, `article.markdown` and `article.blocks` are `null`: X sends only the preview there. Get the post, or its Article, for the body.
- One call returns the whole Article. There is no `cursor`.
- **Out of credits is `402`**, with code `quota_exceeded`. It is not retryable. It clears when the month's free credits return on the 1st (UTC), or when someone adds credits at https://weirapp.io/buy.
- **Rate limiting is `429`** and is retryable: wait for `Retry-After`, then send the same request. The free tier allows 30 requests a minute and any purchase raises that to 120. A call here counts as 1 request.
- **When X is busy or unreachable** the call returns `503`, costs nothing, and can be retried after `Retry-After`.
- **What a call cost.** A failed or refused call costs nothing. Every response reports what it charged in the `x-credits-charged` header and what is left in `x-credits-remaining`.
- **Public data, read-only.** Weir never posts, likes, follows or sends messages on X or Reddit, and it cannot read private or protected content. It is independent and not affiliated with either platform.

## Related

- [The post that carries the Article](tweet-lookup-api.md)
- [Threads](twitter-thread-api.md)
- [Search](twitter-search-api.md)

## Use it from an AI app

The same endpoints are tools on Weir's remote MCP server, `https://api.weirapp.io/mcp`. Each tool is named after the operation it calls and costs the same credits. The tool for this page is `get_x_article`. The app signs in with OAuth in your browser the first time, so there is no API key to paste.

- **Claude:** [open Claude's Add custom connector dialog with Weir filled in](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Weir&connectorUrl=https%3A%2F%2Fapi.weirapp.io%2Fmcp), check it and confirm.
- **Cursor:** [add Weir to Cursor](https://cursor.com/en/install-mcp?name=weir&config=eyJ1cmwiOiJodHRwczovL2FwaS53ZWlyYXBwLmlvL21jcCJ9).
- **Codex:** `codex mcp add weir --url https://api.weirapp.io/mcp`
- **Claude Code:** `claude mcp add --transport http weir https://api.weirapp.io/mcp`
- **ChatGPT, VS Code and other apps:** see [Connect an AI app](../connect.md).

Then ask in plain words. For example: "Read this X Article and give me its key claims: (paste the link of the post that shares it)"

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
