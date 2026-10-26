# Submitting Weir to the Docker MCP Catalog

Owner steps. About 20 minutes, with Docker Desktop installed. Two entries are ready here:

- `weir/`: the data server, `https://api.weirapp.io/mcp`, with OAuth sign-in.
- `weir-docs/`: the docs server, `https://docs.weirapp.io/api/mcp`, with no sign-in.

Each folder has the three files Docker asks for a remote server: `server.yaml`, `tools.json` (always
`[]` for a remote server) and `readme.md`. They follow `CONTRIBUTING.md` in
https://github.com/docker/mcp-registry, section "Adding a Remote MCP Server".

## Steps

1. Fork https://github.com/docker/mcp-registry and clone your fork.
2. Copy `docker/weir` and `docker/weir-docs` from this repository into the fork's `servers/` folder.
3. Optional local test (needs Go, Task and Docker Desktop):

   ```
   task catalog -- weir
   docker mcp catalog import $PWD/catalogs/weir/catalog.yaml
   docker mcp server enable weir
   ```

4. Open one pull request, titled `Add Weir (X and Reddit data) and Weir Docs remote servers`, with
   this description:

   > Adds two remote MCP servers from Weir (https://weirapp.io).
   >
   > - **weir**: public X (Twitter) and Reddit data over Streamable HTTP at
   >   https://api.weirapp.io/mcp. OAuth 2.1 with dynamic client registration; a new account signs up
   >   in the browser and gets 5,000 free credits a month, so reviewers can test without
   >   credentials from us. Read-only tools. Docs: https://docs.weirapp.io/mcp
   > - **weir-docs**: search and read Weir's documentation at https://docs.weirapp.io/api/mcp. No
   >   authentication. Docs: https://docs.weirapp.io/agent-setup

5. If Docker asks for test credentials, use their form (linked in CONTRIBUTING.md) rather than the
   pull request.
