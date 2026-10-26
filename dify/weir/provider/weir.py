from typing import Any

from dify_plugin import ToolProvider
from dify_plugin.errors.tool import ToolProviderCredentialValidationError

from tools._weir import WeirError, call


class WeirProvider(ToolProvider):
    def _validate_credentials(self, credentials: dict[str, Any]) -> None:
        # /v1/whoami is free: it checks the key without spending a credit.
        try:
            call(credentials.get("weir_api_key", ""), "GET", "/v1/whoami")
        except WeirError as error:
            raise ToolProviderCredentialValidationError(str(error)) from error
