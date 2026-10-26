from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from tools._weir import WeirError, as_int, call, reddit_comments_text, reddit_post_id


class GetRedditCommentsTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        try:
            post = reddit_post_id(tool_parameters.get("post", ""))
            result = call(
                self.runtime.credentials.get("weir_api_key", ""),
                "GET",
                f"/v1/reddit/posts/{post}/comments",
                query={
                    "sort": tool_parameters.get("sort") or "confidence",
                    "limit": as_int(tool_parameters.get("limit")) or 50,
                    "depth": as_int(tool_parameters.get("depth")) or 3,
                },
            )
        except WeirError as error:
            yield self.create_text_message(str(error))
            return
        yield self.create_json_message(result)
        yield self.create_text_message(reddit_comments_text(result.get("data") or []))
