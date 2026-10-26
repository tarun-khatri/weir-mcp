from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from tools._weir import WeirError, call, x_post_id, x_posts_text


class GetXThreadTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        try:
            post = x_post_id(tool_parameters.get("post", ""))
            result = call(
                self.runtime.credentials.get("weir_api_key", ""),
                "GET",
                f"/v1/x/posts/{post}/thread",
            )
        except WeirError as error:
            yield self.create_text_message(str(error))
            return
        yield self.create_json_message(result)
        yield self.create_text_message(x_posts_text(result.get("data") or []))
