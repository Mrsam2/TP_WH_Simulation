# AppX Webhook Simulator

A standalone testing tool that mimics the AppX platform by firing signed webhook events to your Tracko backend.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set the webhook secret

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```
APPX_WEBHOOK_SECRET=<the same secret stored in Tracko's .env.local>
```

> **Important:** The HMAC-SHA256 signature is computed server-side only. The secret is never sent to the browser.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

1. Select an event type from the dropdown (or click a Quick Preset).
2. Edit the pre-filled form fields as needed.
3. Click **Send Webhook**.
4. The app calls the internal API route `/api/send-webhook`, which:
   - Computes `X-AppX-Signature: sha256=<HMAC-SHA256(secret, rawBody)>`
   - POSTs to `https://tracko.teachingpariksha.com/api/webhook/appx`
5. The response panel shows the HTTP status, Tracko's response body, the sent payload, and the generated signature.
6. The session log at the bottom tracks the last 10 sent events.

---

## Supported Events

| Event | Description |
|---|---|
| `course.created` | New course published on AppX |
| `course.updated` | Course metadata changed |
| `course.deleted` | Course removed |
| `coupon.created` | New coupon created |
| `coupon.updated` | Coupon modified |
| `coupon.deleted` | Coupon removed |

## Quick Presets

| Preset | What it does |
|---|---|
| Expiry in 3 days | `course.updated` with `expiryDate` = today + 3 days |
| Exam after Expiry | `course.updated` with `examDate` = expiry + 30 days |
| Price Change | `course.updated` with `currentPrice` = 1499 |
| Coupon Expiry Tomorrow | `coupon.created` with `expiryDate` = tomorrow |

---

## Pointing at a different Tracko instance

The target URL is hardcoded in `src/app/api/send-webhook/route.js`:

```js
const TRACKO_WEBHOOK_URL = "https://tracko.teachingpariksha.com/api/webhook/appx";
```

Change it there to target a local or staging instance.

---

## Deploy to Vercel

```bash
vercel
```

Set `APPX_WEBHOOK_SECRET` as an environment variable in the Vercel dashboard (Settings → Environment Variables).
