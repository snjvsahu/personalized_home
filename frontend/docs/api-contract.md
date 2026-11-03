# Home decision API

Contract version **1.0**.

The TypeScript source of truth is [`frontend/src/types/homeDecision.ts`](../src/types/homeDecision.ts). If this note and that file ever disagree, the types win. The client validates the JSON at runtime in [`frontend/src/api/parseHomeDecision.ts`](../src/api/parseHomeDecision.ts) and falls back to a standard layout when the body does not match.

This pilot is unauthenticated. Production must authorize the caller for `customerId` before returning a decision. The client calls the API on the same origin.

## Request

```http
GET /api/home/decision?customerId={customerId}
Accept: application/json
```

| Query | Required | Notes |
| --- | --- | --- |
| `customerId` | yes | Stable customer key. The pilot uses the example ids below. |

Recommended response header: `Cache-Control: no-store`. Decisions are personal and short-lived. The client also sends `cache: no-store` and aborts the request after 8 seconds.

## Success, 200

`Content-Type: application/json`

```ts
interface HomeDecisionResponse {
  contractVersion: '1.0'
  customerId: string
  customerName: string
  lineOfBusiness: 'prepaid' | 'postpaid' | 'broadband'
  serviceLabel: string
  generatedAt: string
  example?: boolean
  slots: {
    hero: HeroSlot
    shortcuts: ShortcutsSlot
    offer: OfferSlot | null
    balance: BalanceSlot
  }
}
```

| Field | Rules |
| --- | --- |
| `contractVersion` | Must be `"1.0"`. Any other value is rejected. |
| `customerId` | Non-empty string. Should match the requested id. |
| `customerName` | Non-empty display name. The client does not look the customer up. |
| `lineOfBusiness` | `prepaid`, `postpaid`, or `broadband`. The client themes the hero from this value and does not accept a color from the API. |
| `serviceLabel` | Non-empty line description, already masked. Example: `Prepaid · 024 000 0198`. |
| `generatedAt` | ISO-8601 timestamp. Shown as "Updated …". |
| `example` | Optional boolean. Set `true` only for synthetic mock payloads. The client shows an "Example data" banner when it is true. Production responses should omit it or send `false`. |
| `slots.hero` | `id`, `title`, and `subtitle` are required. `eyebrow` is optional. |
| `slots.hero` CTA | Omit both `ctaLabel` and `ctaHref`, or send both. |
| `slots.hero` image | Omit both `imageUrl` and `imageAlt`, or send both. `imageAlt` is required whenever `imageUrl` is set. |
| `slots.shortcuts` | `title` plus a `tiles` array. Choose the tiles for the line of business. Send at most **8**. The client renders the first 8 and drops the rest. |
| `slots.shortcuts.tiles[]` | `id`, `label`, `href`, and `icon` are required. `badge` is an optional short status such as `Due`. |
| `slots.offer` | Required key. `null` means there is no card. Otherwise `kind` is `notification` or `next-best-offer`. |
| `slots.balance` | `title` plus `items`. An empty `items` array is valid; the client says no usage was returned. |
| `slots.balance.items[]` | `id`, `label`, and `displayValue` are required. `displayValue` and `displayTotal` are already localized. The client does not format money. |
| `percentRemaining` | Optional number, 0–100, meaning how much is left. Omit it when the row is not a meter. The client clamps the range and shows **Low** at 20 or below. |

Links (`href`, `ctaHref`, `imageUrl`) must be a site path starting with a single `/` (not `//`) or an absolute `http`/`https` URL. Any other scheme, including `javascript:`, fails validation for the whole payload.

One invalid tile, meter, or CTA fails the whole response. The client then shows the standard layout rather than a partial decision. Strings are trimmed; empty strings are rejected.

`lineOfBusiness: "unknown"` is not a server value. The client uses it only for the standard layout it builds itself.

### Shortcut icons

Prefer one of these `icon` names. An unknown name still renders the tile, with a generic mark.

`recharge`, `bundles`, `transfer`, `usage`, `sim`, `offers`, `help`, `history`, `bill`, `plan`, `add-on`, `roaming`, `esim`, `statement`, `speed`, `wifi`, `outage`, `devices`, `upgrade`, `move`, `account`.

## Errors

`Content-Type: application/json`

```ts
interface HomeDecisionErrorBody {
  error: 'customer_id_required' | 'customer_not_found' | 'decision_unavailable'
  message: string
}
```

| Status | `error` | When |
| --- | --- | --- |
| 400 | `customer_id_required` | `customerId` is missing or blank. |
| 404 | `customer_not_found` | The id is not a customer this service can decide for. |
| 503 | `decision_unavailable` | A dependency failed. Also use 5xx for other upstream failures. |

The client does not render `message`. It maps the status onto its own copy and shows the standard layout, with a retry action.

## What the client does when this call fails

The standard layout is owned by the client, not returned by this API. It is used when:

- the request times out (8 seconds), fails the network, or returns a non-OK status
- the body is not the 1.0 contract
- a production page is opened without `customerId` (the client does not invent an id)

That layout has a generic hero ("Welcome back"), four shortcuts (bills, usage, help, account), an unavailable balance with no invented figures, and a support notification. It is not marked as example data.

In local `npm run dev` only, a missing `customerId` loads the example id `maya-okonkwo` so the pilot opens on a full home.

## Example data

The worked examples below are **fictional**. They live in [`frontend/src/mocks/personas.ts`](../src/mocks/personas.ts) and are served only by the dev mock layer. Every example object sets `"example": true`.

| `customerId` | Line | Mock result |
| --- | --- | --- |
| `maya-okonkwo` | prepaid | Weekend bundle hero, low airtime notification, 8 prepaid shortcuts. |
| `arun-desai` | postpaid | Bill hero, next-best-offer for Unlimited 5G, bill and plan shortcuts. |
| `lena-berg` | broadband | Healthy fibre hero, maintenance notification, broadband shortcuts. |
| `no-such-customer` | — | 404 `customer_not_found`. |
| `service-outage` | — | 503 `decision_unavailable`. |
| *(omit the parameter)* | — | 400 `customer_id_required`. |

### `maya-okonkwo`

```json
{
  "contractVersion": "1.0",
  "customerId": "maya-okonkwo",
  "customerName": "Maya Okonkwo",
  "lineOfBusiness": "prepaid",
  "serviceLabel": "Prepaid · 024 000 0198",
  "generatedAt": "2026-10-12T08:30:00.000Z",
  "example": true,
  "slots": {
    "hero": {
      "id": "maya-hero",
      "eyebrow": "For your weekend",
      "title": "A weekend bundle is ready",
      "subtitle": "5 GB from Friday to Sunday, based on the last three recharges.",
      "ctaLabel": "See the bundle",
      "ctaHref": "/bundles"
    },
    "balance": {
      "title": "Balance and usage",
      "items": [
        {
          "id": "maya-airtime",
          "label": "Airtime",
          "displayValue": "USD 4.20",
          "hint": "Runs out on Friday"
        },
        {
          "id": "maya-data",
          "label": "Data",
          "displayValue": "0.8 GB",
          "displayTotal": "of 5 GB",
          "percentRemaining": 16,
          "hint": "About a day at your usual pace"
        },
        {
          "id": "maya-validity",
          "label": "Validity",
          "displayValue": "4 days",
          "hint": "Expires Friday"
        }
      ]
    },
    "shortcuts": {
      "title": "Quick links",
      "tiles": [
        { "id": "maya-recharge", "label": "Recharge", "href": "/recharge", "icon": "recharge", "badge": "Low" },
        { "id": "maya-bundles", "label": "Bundles", "href": "/bundles", "icon": "bundles" },
        { "id": "maya-transfer", "label": "Transfer", "href": "/transfer", "icon": "transfer" },
        { "id": "maya-usage", "label": "Usage", "href": "/usage", "icon": "usage" },
        { "id": "maya-sim", "label": "SIM", "href": "/sim", "icon": "sim" },
        { "id": "maya-offers", "label": "Offers", "href": "/offers", "icon": "offers" },
        { "id": "maya-help", "label": "Help", "href": "/help", "icon": "help" },
        { "id": "maya-history", "label": "History", "href": "/history", "icon": "history" }
      ]
    },
    "offer": {
      "id": "maya-offer",
      "kind": "notification",
      "title": "Airtime is nearly gone",
      "body": "USD 4.20 is left on the line. It runs out on Friday unless you recharge.",
      "ctaLabel": "Recharge now",
      "ctaHref": "/recharge"
    }
  }
}
```

Postpaid and broadband examples are the same shape with different slots. Use `arun-desai` and `lena-berg` in the running app, or read those objects in `personas.ts`.
