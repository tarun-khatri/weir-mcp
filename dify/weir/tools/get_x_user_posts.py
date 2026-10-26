from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from tools._weir import WeirError, as_int, call, x_posts_text, x_user


class GetXUserPostsTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        try:
            user = x_user(tool_parameters.get("user", ""))
            result = call(
                self.runtime.credentials.get("weir_api_key", ""),
                "GET",
                f"/v1/x/users/{user}/posts",
                query={"limit": as_int(tool_parameters.get("limit")) or 20},
            )
        except WeirError as error:
            yield self.create_text_message(str(error))
            return
        yield self.create_json_message(result)
        yield self.create_text_message(x_posts_text(result.get("data") or []))
