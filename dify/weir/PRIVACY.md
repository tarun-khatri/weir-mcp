# Privacy

This plugin stores nothing. It runs inside your Dify installation and passes each tool call to Weir's API at `https://api.weirapp.io` over HTTPS.

## What is sent to Weir

- Your Weir API key, in the `Authorization` header, so Weir knows which account to charge.
- The tool's inputs: search words and filters, a post link or id, an X username, a Reddit community name, and the result limits.

Nothing else from your Dify app, conversation or knowledge base is sent.

## What Weir keeps

Weir keeps request logs: which endpoint was called, when, the status, the credits charged, the client's user agent, and one-way hashes of the IP address and of the search text, not the values themselves. The logs are deleted after 30 to 60 days. The full policy is at https://weirapp.io/privacy.

## What comes back

Public X and Reddit data: posts, replies, profiles and comments that anyone can see on those sites. The plugin returns them to your workflow and does not store them.

## Contact

support@weirapp.io
