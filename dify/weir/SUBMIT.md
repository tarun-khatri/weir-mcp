# Submitting the Weir plugin to the Dify Marketplace

Owner steps. About 30 minutes. Everything in this folder is ready; these steps need your accounts.

## 1. Package it (5 minutes)

1. Download Dify's plugin CLI for Windows, `dify-plugin-windows-amd64.exe`, from
   https://github.com/langgenius/dify-plugin-daemon/releases (latest release), and rename it `dify.exe`.
2. From the root of this repository, run:

   ```
   dify.exe plugin package dify/weir
   ```

   It writes `weir.difypkg`. Rename it `weir-0.0.1.difypkg`. `.difyignore` already keeps the
   tests and this file out of the package.

## 2. Test it (15 minutes)

The marketplace asks for a test on Dify Cloud and on the Community Edition.

1. In Dify (https://cloud.dify.ai), open **Plugins → Install plugin → Local package file** and
   choose `weir-0.0.1.difypkg`. If Cloud refuses an unsigned local package, test on a self-hosted
   Community Edition instead, with `FORCE_VERIFYING_SIGNATURE=false` in its `.env`, and say so in
   the PR's "Local validation" section.
2. Open the plugin's settings and paste a Weir API key. A wrong key should be refused; a right one
   accepted (the check is a free call).
3. In a workflow, add **Search X posts** with the query `nasa` and run it. Then try
   **Get Reddit comments** with a Reddit post link. Each should return JSON and text.

## 3. Open the pull request (10 minutes, by hand)

1. Fork https://github.com/langgenius/dify-plugins.
2. In the fork, create the folder `tarun-khatri/weir/` and add `weir-0.0.1.difypkg` and the plugin
   source (this folder's files).
3. Open one pull request with the text below. It is a single, hand-made PR, which is fine for your
   GitHub account.

```markdown
# Plugin Submission

## Plugin information

- **Author**: tarun-khatri
- **Plugin name**: weir
- **Version**: 0.0.1
- **Source repository**: https://github.com/tarun-khatri/weir-mcp/tree/main/dify/weir
- **Contact**: support@weirapp.io

## Submission type

- [x] New plugin
- [ ] Version update

## What changed

Six read-only tools for public X (Twitter) and Reddit data through Weir's API (https://weirapp.io):
search X posts, get the replies to a post, get a thread, get an account's posts, search Reddit, and
get a Reddit post's comments. Users bring their own Weir API key (5,000 free credits a month). The
plugin stores nothing and has no dependency beyond dify_plugin.

## Risk level

- [ ] Low risk
- [x] Medium risk
- [ ] High risk

It calls one fixed, documented HTTPS API, but it sends the user's search terms to it, so Medium.

## Required checks

- [x] I have read and followed the Marketplace submission requirements.
- [x] I have read and comply with the Plugin Development Guidelines.
- [x] I tested this plugin on Dify Community Edition and Dify Cloud, or documented any limitation below.
- [x] The package contains only files needed at runtime.
- [x] The package does not contain secrets, local credentials, `.env` files, `.git` directories, virtual environments, caches, logs, or IDE files.
- [x] The package does not contain executables or bundled binaries.
- [x] The plugin README includes setup steps, usage instructions, required APIs or credentials, connection requirements, and the source repository link.
- [x] The plugin includes `PRIVACY.md`, and `manifest.yaml` references it.
- [x] All user-facing text is primarily in English, with Chinese and Japanese READMEs in `readme/`.

## Security and privacy notes

None of the listed sensitive capabilities. The plugin calls only https://api.weirapp.io, with a
60-second timeout, and its error messages never include the API key. It reads public data only and
never posts.

## Local validation

- `python -m unittest discover -s tests`: 10 tests, OK (HTTP client, link parsing, text output).
- YAML parsed and every referenced file checked.
- `dify plugin package dify/weir`: OK.
- Installed on Dify Cloud / Community Edition and ran Search X posts and Get Reddit comments: (fill in).
```

## After it is listed

Add a "Dify" row to the install table in this repository's README, with the marketplace link.
