from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from tools._weir import WeirError, as_int, call, iso_instant, usernames, x_posts_text


class SearchXTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        try:
            result = call(
                self.runtime.credentials.get("weir_api_key", ""),
                "POST",
                "/v1/x/search",
                body={
                    "query": tool_parameters.get("query"),
                    "fromUsers": usernames(tool_parameters.get("from_users")),
                    "language": tool_parameters.get("language"),
                    "minLikes": as_int(tool_parameters.get("min_likes")),
                    "since": iso_instant(tool_parameters.get("since")),
                    "until": iso_instant(tool_parameters.get("until")),
                    "sort": tool_parameters.get("sort") or "latest",
                    "limit": as_int(tool_parameters.get("limit")) or 20,
                },
            )
        except WeirError as error:
            yield self.create_text_message(str(error))
            return
        yield self.create_json_message(result)
        yield self.create_text_message(x_posts_text(result.get("data") or []))
