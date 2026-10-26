"""
Weir's REST API (https://docs.weirapp.io), called with the standard library only, so the plugin
installs nothing beyond dify_plugin.

Also turns the links people paste into the ids the API takes, and posts and comments into short
text an agent can read alongside the JSON.
"""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

API = "https://api.weirapp.io"
TIMEOUT_SECONDS = 60
USER_AGENT = "weir-dify-plugin/0.0.1 (+https://weirapp.io)"


class WeirError(Exception):
    """A refused or failed call, with Weir's error code and message. Never holds the key."""

    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(f"{message} ({code}, HTTP {status})" if status else f"{message} ({code})")
        self.status = status
        self.code = code


def _present(value: Any) -> bool:
    return value is not None and value != "" and value != []


def call(
    api_key: str,
    method: str,
    path: str,
    *,
    query: dict[str, Any] | None = None,
    body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """One API call. Empty parameters are left out, so the API applies its own defaults."""
    if not api_key:
        raise WeirError(401, "missing_key", "Add your Weir API key in the plugin's credentials.")
    params = {name: value for name, value in (query or {}).items() if _present(value)}
    url = f"{API}{path}" + (f"?{urllib.parse.urlencode(params)}" if params else "")
    data = None
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
    }
    if body is not None:
        data = json.dumps({name: value for name, value in body.items() if _present(value)}).encode()
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        try:
            detail = json.load(error).get("error", {})
        except (ValueError, AttributeError):
            detail = {}
        raise WeirError(
            error.code,
            str(detail.get("code") or "http_error"),
            str(detail.get("message") or error.reason or "The request failed."),
        ) from None
    except urllib.error.URLError as error:
        raise WeirError(0, "network_error", f"Could not reach Weir: {error.reason}") from None


# ---------------------------------------------------------------------------------- Pasted links


def x_post_id(value: str) -> str:
    """The id from a post link (https://x.com/NASA/status/123) or the id itself."""
    text = (value or "").strip()
    match = re.search(r"/status(?:es)?/(\d{1,19})", text) or re.fullmatch(r"(\d{1,19})", text)
    if not match:
        raise WeirError(400, "bad_post", "Give an X post link or its numeric id.")
    return match.group(1)


def x_user(value: str) -> str:
    """A username from @name, name, a profile link or a numeric account id."""
    text = (value or "").strip()
    match = re.search(r"(?:x|twitter)\.com/@?([A-Za-z0-9_]{1,50})", text)
    name = match.group(1) if match else text.lstrip("@")
    if not re.fullmatch(r"[A-Za-z0-9_]{1,50}", name):
        raise WeirError(400, "bad_user", "Give an X username, a profile link or a numeric id.")
    return name


def reddit_post_id(value: str) -> str:
    """The id from a post link (.../comments/1vdo8we/..., redd.it/1vdo8we) or the id itself."""
    text = (value or "").strip()
    match = (
        re.search(r"/comments/([A-Za-z0-9]{1,13})", text)
        or re.search(r"redd\.it/([A-Za-z0-9]{1,13})", text)
        or re.fullmatch(r"(?:t3_)?([A-Za-z0-9]{1,13})", text)
    )
    if not match:
        raise WeirError(400, "bad_post", "Give a Reddit post link or its id.")
    return match.group(1)


def iso_instant(value: str | None) -> str | None:
    """A date-time for since/until: a bare date (2026-10-01) becomes its start in UTC."""
    text = (value or "").strip()
    if not text:
        return None
    return f"{text}T00:00:00Z" if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text) else text


def as_int(value: Any) -> int | None:
    """A whole number from a form field, which Dify may hand over as a float or a string."""
    if value is None or value == "":
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def usernames(value: str | None) -> list[str]:
    """Usernames from a comma- or space-separated list, without the @."""
    return [name.lstrip("@") for name in re.split(r"[\s,]+", value or "") if name.lstrip("@")]


# ----------------------------------------------------------------------------------------- Text


def _count(value: Any) -> str:
    return f"{value:,}" if isinstance(value, int) else "?"


def x_posts_text(posts: list[dict[str, Any]]) -> str:
    """One block per post: who, when, likes, the text and the link."""
    if not posts:
        return "No posts."
    blocks = []
    for post in posts:
        author = (post.get("author") or {}).get("username") or "?"
        when = str(post.get("createdAt") or "")[:16].replace("T", " ")
        blocks.append(
            f"@{author} · {when} UTC · {_count(post.get('likeCount'))} likes\n"
            f"{post.get('text') or ''}\n{post.get('url') or ''}"
        )
    return "\n\n".join(blocks)


def _reddit_url(permalink: str | None) -> str:
    link = permalink or ""
    return f"https://www.reddit.com{link}" if link.startswith("/") else link


def reddit_posts_text(posts: list[dict[str, Any]]) -> str:
    """One block per post: where, who, score, comments, the title and the link."""
    if not posts:
        return "No posts."
    return "\n\n".join(
        f"r/{post.get('subreddit') or '?'} · u/{post.get('author') or '?'} · "
        f"{_count(post.get('score'))} points · {_count(post.get('numComments'))} comments\n"
        f"{post.get('title') or ''}\n{_reddit_url(post.get('permalink'))}"
        for post in posts
    )


def reddit_comments_text(comments: list[dict[str, Any]]) -> str:
    """Comments in thread order, indented by depth."""
    if not comments:
        return "No comments."
    lines = []
    for comment in comments:
        indent = "  " * max(int(comment.get("depth") or 0), 0)
        body = " ".join(str(comment.get("body") or "").split())
        lines.append(
            f"{indent}u/{comment.get('author') or '?'} ({_count(comment.get('score'))}): {body}"
        )
    return "\n".join(lines)
