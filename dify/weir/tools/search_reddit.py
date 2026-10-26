from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from tools._weir import WeirError, as_int, call, reddit_posts_text


class SearchRedditTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        subreddit = (tool_parameters.get("subreddit") or "").strip().removeprefix("r/")
        try:
            result = call(
                self.runtime.credentials.get("weir_api_key", ""),
                "POST",
                "/v1/reddit/search",
                body={
                    "query": tool_parameters.get("query"),
                    "subreddit": subreddit,
                    "sort": tool_parameters.get("sort") or "relevance",
                    "time": tool_parameters.get("time") or "all",
                    "limit": as_int(tool_parameters.get("limit")) or 25,
                },
            )
        except WeirError as error:
            yield self.create_text_message(str(error))
            return
        yield self.create_json_message(result)
        yield self.create_text_message(reddit_posts_text(result.get("data") or []))
