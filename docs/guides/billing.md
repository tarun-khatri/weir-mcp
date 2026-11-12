# Billing and credits

> Part of the Weir docs for public Reddit and X (Twitter) data. Copied from https://docs.weirapp.io/billing on 12 November 2026. That page is always the current version.

Weir is prepaid. You hold a balance of credits, every successful call spends some, and there is no
subscription and no invoice at the end of the month. When the balance runs out, calls stop: you
can never be billed for more than you bought.

## What a call costs

You pay for results returned, not requests made.

| Result                                                         | Credits |
| -------------------------------------------------------------- | ------- |
| X post                                                         | 1       |
| X profile                                                      | 2       |
| X account in a list (followers, following, reposters, members) | 1       |
| X List                                                         | 2       |
| X Space                                                        | 2       |
| Reddit post                                                    | 3       |
| Reddit comment                                                 | 3       |
| Reddit community                                               | 1       |
| Reddit user                                                    | 1       |

A successful call also costs **a 1-credit minimum**, even when it returns nothing: reaching a
platform is the expensive part whether or not it had an answer. It is added to the results, not a
floor: a search that returns 20 X posts costs 21 credits, and one that matches nothing costs 1.
Every operation publishes its
price in an `x-weir-billing` extension, shown on its
[reference page](https://docs.weirapp.io/reference/reddit/searchReddit).

The 3:1 ratio between Reddit and X is not a pricing lever. Reddit results cost us more to produce,
and it is stated openly because the honest way to compare any two APIs is a rate per thousand
results, which is how [pricing](https://weirapp.io/pricing) publishes it.

## What costs nothing

- **Failed calls.** Anything `400` or above costs nothing, including `503`.
- **Refused calls.** `402` and `429` never charge.
- **The control plane.** Creating, listing, and triggering monitors and webhooks.
- **Introspection.** `/v1/whoami`, `/v1/usage`, `/v1/limits`. Working out why you ran out of
  credit should not spend credit.

## Where credits come from

- **Free grant.** 5,000 credits a month, no card needed. They arrive with your first call of the
  month, expire when the month ends, and do not roll over. One free grant per person: if you own
  several workspaces, your oldest one receives it.
- **Credit packs.** Bought in the dashboard under **Billing** by a workspace owner or admin.
  **Purchased credits never expire.**

| Pack   | Credits    | Per 1,000 X posts | Per 1,000 Reddit posts |
| ------ | ---------- | ----------------- | ---------------------- |
| $5     | 25,000     | $0.20             | $0.60                  |
| $20    | 120,000    | $0.167            | $0.50                  |
| $50    | 340,000    | $0.147            | $0.441                 |
| $200   | 1,600,000  | $0.125            | $0.375                 |
| $1,000 | 10,000,000 | $0.10             | $0.30                  |

Prices are in US dollars, before any sales tax or VAT, which is added at checkout. Card payments
are processed by Dodo Payments, our merchant of record. You can also pay in USDC on Solana; see
below.

Spending always uses the credits that expire soonest first: this month's free grant before
anything you bought.

### Paying with USDC

Every pack can also be paid in **USDC on Solana**, at one USDC per dollar: the $20 pack costs 20
USDC. Under **Billing**, choose **Pay with USDC (Solana)** on a pack. The dashboard shows a
[Solana Pay](https://docs.solanapay.com) request:

- a **QR code** to scan with a mobile wallet (Phantom, Solflare, or any wallet that supports
  Solana Pay), and an **Open in wallet** link for a wallet on the same device;
- the **amount**, the **recipient** address, and a **reference**, each with a copy button.

Scanning or opening the request fills everything in. The transfer carries the request's reference,
which is how Weir finds it on-chain and ties it to your purchase; nothing else about your wallet is
needed. The page updates itself and shows the credits as soon as the transaction is
**finalized** on Solana, usually within a minute of sending it. You can leave the page: the payment
is still found, and your purchase history links back to the request.

Things to know:

- **Only USDC on Solana is accepted** (mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`). USDT,
  SOL, or USDC sent on another chain is not credited and may not be recoverable.
- **Pay the request, not the address.** A transfer typed by hand without the reference cannot be
  matched automatically. If that happens, email billing@weirapp.io with the transaction signature.
- **The request is shown as payable for 30 minutes**, and Weir keeps looking for its transfer for
  24 hours, after which it is marked expired. A transfer that lands later is still credited once it
  is found: open the request again from your purchase history, or contact us.
- **Paying more** than the price buys the pack; the excess is refunded on request. **Paying less**
  adds no credits: the payment is held for review, and we either let you top it up or refund it.
- Your wallet pays the Solana network fee, a fraction of a cent. There is no sales tax line on a
  USDC payment and no Dodo invoice; the on-chain transaction is the receipt.

## Tiers

Rate limits and how many monitors and webhooks a workspace may have rise with what it has bought
in total, net of refunds. They never fall because you spent credits or because time passed.

| Tier   | Lifetime purchases | Requests/minute | Monitors | Webhooks | Hourly monitors |
| ------ | ------------------ | --------------- | -------- | -------- | --------------- |
| Free   | $0                 | 30              | 1        | 1        | No              |
| Tier 1 | $5                 | 120             | 10       | 5        | Yes             |
| Tier 2 | $100               | 300             | 50       | 25       | Yes             |
| Tier 3 | $500               | 600             | 200      | 100      | Yes             |

`GET /v1/limits` returns your workspace's current tier and its limits.

## Reading the meter

```
x-credits-charged: 24
x-credits-remaining: 9976
```

`x-credits-charged` is what that call cost. `x-credits-remaining` is what your workspace can still
spend afterwards. Watch `x-credits-charged` after an unfamiliar call: because rates differ per
platform, a query's price cannot be predicted from the request alone, so reading the header beats
modelling it.

`GET /v1/usage` returns the whole picture: `balance`, what is `reserved` by calls still in flight,
what is `available`, and how much of this month's free grant is left and when it resets.

## Running out

You get [`402`](https://docs.weirapp.io/errors) with code `quota_exceeded`, and **it is not retryable**. It clears in two
ways only: the month's free credits return on the 1st (UTC), or someone adds credits at
https://weirapp.io/buy. Retrying in between never works: a retry loop on a `402` runs until you
stop it.

The error's `message` names the day free credits return and what the smallest pack costs, and
`details` has `buyUrl`, `smallestPack` and `freeCreditsRenewAt` for a client that shows its own
prompt.

We also write to you before it happens. A free account gets one email when 80% of the month's free
credits are used and one when they run out. An account that has bought credits gets one when less
than a fifth of its last pack is left, and one when the balance reaches zero.

Two other refusals look similar and are not:

- **`429` while credits are held.** When several calls run at once on a nearly empty balance, each
  holds what it could cost at its `limit` (or the endpoint's default page) until it finishes. If
  the rest of your balance is held by calls still in flight, the next call gets `429` with
  `Retry-After` and `details.reason: "credits_held"`, and it succeeds once they finish. This one is
  safe to retry. Fewer calls at once, or smaller limits, avoid it.
- **`402` while spending is paused.** If a payment is refunded after its credits were spent, or a
  card payment is disputed, data calls return `402` with `details.reason: "billing_hold"` until it
  is resolved. Contact support@weirapp.io.
- **`402` while free credits are on hold.** The free allowance is one per person. Free accounts that
  look like several accounts run by one person to collect extra free credits get `402` with
  `details.reason: "free_credit_hold"`. Buying any credit pack lifts it at once; if it is wrong,
  email support@weirapp.io from the account's address and it is lifted, usually within a day.
  Accounts that have bought credits are never held.

## Free accounts and shared capacity

X limits how many requests each of our connections may make in a fifteen-minute window. Part of
every window is kept for workspaces that have bought credits, and their calls are served first.
That part is 30% when a window opens, shrinks as the window runs out, and grows when paying
customers are busy. When free accounts together have used their share, a free call gets `429` with
`details.reason: "free_capacity"` and a `Retry-After` of when capacity returns. An account making
its first few calls in a window is served before heavier use, and while free capacity is busy an
account that has already made a large part of it gets `details.reason: "free_account_share"`
instead. Neither happens to an account that has bought any credit pack.

Two refusals can reach any account. When a window is nearly used up, an account that made a large
part of the recent calls gets `details.reason: "heavy_account"`, so it cannot take the last calls
from everyone else. When every window is used up until it reopens, calls get
`details.reason: "source_capacity"` rather than being sent to X, which would refuse them anyway.
All four are `429`, retryable after `Retry-After`, and never charged. Cached answers are never
refused.

Some new email sign-ups start with 1,000 free credits a month instead of 5,000: another recent
account on the same private email domain, one mailbox written in different ways, an address at a
throwaway email service, or a newly registered domain that runs its own mail server. Linking Google
or GitHub under **Billing** in the dashboard, or any purchase, unlocks the full amount at once.
Sign-ups with Google or GitHub always start with 5,000, and so do addresses at the usual mailbox
providers and at universities, however many accounts share them.

To tell, we look up public facts about the domain of the address, never the address itself: which
server receives its mail and, if the domain runs its own mail server, when it was registered. That
takes a few seconds, so a new workspace on its own domain can show 1,000 credits at first and 5,000
a moment later.

## Monitors

A monitor run costs the 1-credit minimum plus the per-result rate for each **new** result it
stores. Results it has already shown you are not charged again, so a run that finds nothing new
costs 1 credit. There is no premium for scheduling.

If a workspace runs out of credits, its monitors pause instead of failing on every run, and the
dashboard shows why. They resume by themselves as soon as credits arrive: a purchase, or next
month's free grant.

## Refunds

An unused credit pack can be refunded within 30 days of purchase; once its credits are being spent
it cannot. The free grant is never refundable. See [the refund policy](https://weirapp.io/refunds).

Refunds of USDC payments are made by hand by support: email billing@weirapp.io from the workspace
owner's address with the purchase date. The USDC is returned in full, on Solana, to the wallet that
sent it, and the pack's credits are taken back when the refund is made.

## Controlling spend

1. **`limit` is per call.** Searching both platforms is two calls, so budget for both.
2. **Filter upstream.** You pay for what was returned, including what you then discard.
3. **Bound your pagination.** See [pagination](https://docs.weirapp.io/pagination).

Docs: https://docs.weirapp.io · Pricing: https://weirapp.io/pricing · Not affiliated with X Corp. or Reddit, Inc.
