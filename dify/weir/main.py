from dify_plugin import DifyPluginEnv, Plugin

# Weir answers most calls in seconds; a large Reddit comment tree can take longer.
plugin = Plugin(DifyPluginEnv(MAX_REQUEST_TIMEOUT=120))

if __name__ == "__main__":
    plugin.run()
