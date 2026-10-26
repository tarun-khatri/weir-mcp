"""Tests for tools/_weir.py. Standard library only: python -m unittest discover -s tests"""

import io
import json
import sys
import unittest
import urllib.error
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from tools import _weir  # noqa: E402
from tools._weir import (  # noqa: E402
    WeirError,
    as_int,
    call,
    iso_instant,
    reddit_comments_text,
    reddit_post_id,
    reddit_posts_text,
    usernames,
    x_post_id,
    x_posts_text,
    x_user,
)


class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class PastedLinks(unittest.TestCase):
    def test_x_post_ids(self):
        self.assertEqual(x_post_id("https://x.com/NASA/status/1878432157392445440?s=20"), "1878432157392445440")
        self.assertEqual(x_post_id("https://twitter.com/jack/statuses/20"), "20")
        self.assertEqual(x_post_id(" 1878432157392445440 "), "1878432157392445440")
        with self.assertRaises(WeirError):
            x_post_id("https://x.com/NASA")

    def test_x_users(self):
        self.assertEqual(x_user("@NASA"), "NASA")
        self.assertEqual(x_user("https://x.com/OpenAIDevs/with_replies"), "OpenAIDevs")
        self.assertEqual(x_user("11348282"), "11348282")
        with self.assertRaises(WeirError):
            x_user("not a name!")

    def test_reddit_post_ids(self):
        self.assertEqual(reddit_post_id("https://www.reddit.com/r/SaaS/comments/1vdo8we/pricing/"), "1vdo8we")
        self.assertEqual(reddit_post_id("https://redd.it/1vdo8we"), "1vdo8we")
        self.assertEqual(reddit_post_id("t3_1vdo8we"), "1vdo8we")
        with self.assertRaises(WeirError):
            reddit_post_id("https://www.reddit.com/r/SaaS/")

    def test_form_values(self):
        self.assertEqual(iso_instant("2026-10-01"), "2026-10-01T00:00:00Z")
        self.assertEqual(iso_instant("2026-10-01T09:00:00+09:00"), "2026-10-01T09:00:00+09:00")
        self.assertIsNone(iso_instant(" "))
        self.assertEqual(usernames("NASA, @SpaceX  esa"), ["NASA", "SpaceX", "esa"])
        self.assertEqual(usernames(None), [])
        self.assertEqual(as_int("20"), 20)
        self.assertEqual(as_int(20.0), 20)
        self.assertIsNone(as_int(""))
        self.assertIsNone(as_int("many"))


class Calls(unittest.TestCase):
    def test_post_sends_the_key_and_leaves_out_empty_fields(self):
        seen = {}

        def fake_urlopen(request, timeout):
            seen["request"] = request
            seen["timeout"] = timeout
            return FakeResponse(b'{"data": [], "meta": {"requestId": "r1"}}')

        with mock.patch.object(_weir.urllib.request, "urlopen", fake_urlopen):
            result = call("key-123", "POST", "/v1/x/search", body={"query": "nasa", "fromUsers": [], "language": None, "limit": 20})

        request = seen["request"]
        self.assertEqual(result["meta"]["requestId"], "r1")
        self.assertEqual(request.full_url, "https://api.weirapp.io/v1/x/search")
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(request.get_header("Authorization"), "Bearer key-123")
        self.assertEqual(json.loads(request.data), {"query": "nasa", "limit": 20})
        self.assertEqual(seen["timeout"], _weir.TIMEOUT_SECONDS)

    def test_get_puts_parameters_in_the_query_string(self):
        seen = {}

        def fake_urlopen(request, timeout):
            seen["request"] = request
            return FakeResponse(b'{"data": []}')

        with mock.patch.object(_weir.urllib.request, "urlopen", fake_urlopen):
            call("k", "GET", "/v1/x/posts/20/replies", query={"sort": "latest", "limit": 20, "cursor": None})

        self.assertEqual(seen["request"].full_url, "https://api.weirapp.io/v1/x/posts/20/replies?sort=latest&limit=20")
        self.assertIsNone(seen["request"].data)

    def test_api_errors_carry_weirs_code_and_message(self):
        def fake_urlopen(request, timeout):
            body = io.BytesIO(b'{"error": {"code": "insufficient_credits", "message": "The account is out of credits."}}')
            raise urllib.error.HTTPError(request.full_url, 402, "Payment Required", {}, body)

        with mock.patch.object(_weir.urllib.request, "urlopen", fake_urlopen):
            with self.assertRaises(WeirError) as caught:
                call("k", "GET", "/v1/usage")
        self.assertEqual(caught.exception.status, 402)
        self.assertEqual(caught.exception.code, "insufficient_credits")
        self.assertIn("out of credits", str(caught.exception))
        self.assertNotIn("k", caught.exception.code)

    def test_a_missing_key_is_refused_before_any_request(self):
        with mock.patch.object(_weir.urllib.request, "urlopen") as urlopen:
            with self.assertRaises(WeirError) as caught:
                call("", "GET", "/v1/whoami")
        urlopen.assert_not_called()
        self.assertEqual(caught.exception.code, "missing_key")


class Text(unittest.TestCase):
    def test_x_posts(self):
        text = x_posts_text([
            {"author": {"username": "NASA"}, "createdAt": "2026-10-26T14:05:00.000Z", "likeCount": 1234, "text": "Liftoff!", "url": "https://x.com/NASA/status/1"},
            {"author": {}, "createdAt": None, "likeCount": None, "text": "No counts", "url": ""},
        ])
        self.assertIn("@NASA · 2026-10-26 14:05 UTC · 1,234 likes\nLiftoff!\nhttps://x.com/NASA/status/1", text)
        self.assertIn("@? ·  UTC · ? likes", text)
        self.assertEqual(x_posts_text([]), "No posts.")

    def test_reddit(self):
        posts = reddit_posts_text([
            {"subreddit": "SaaS", "author": "founder", "score": 42, "numComments": 7, "title": "Usage pricing?", "permalink": "/r/SaaS/comments/1vdo8we/usage_pricing/"},
        ])
        self.assertIn("r/SaaS · u/founder · 42 points · 7 comments\nUsage pricing?\nhttps://www.reddit.com/r/SaaS/comments/1vdo8we/usage_pricing/", posts)
        comments = reddit_comments_text([
            {"author": "a", "score": 10, "body": "Top level", "depth": 0},
            {"author": "b", "score": 2, "body": "A reply\nover two lines", "depth": 1},
        ])
        self.assertEqual(comments, "u/a (10): Top level\n  u/b (2): A reply over two lines")


if __name__ == "__main__":
    unittest.main()
