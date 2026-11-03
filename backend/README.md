# Personalized Home — Backend

Decision service for telecom self-care **home** and **self-care home** screens. It selects a hero banner, an optional notification, and an ordered quick-link grid (up to 8 slots, configurable per line of business / LOB).

There is no `frontend/docs/api-contract.md` in this repository yet; this README documents the contract the backend implements. When the frontend contract lands, align field names and enums with that document.

## Architecture

```
Client → POST /v1/decisions
           ↓
    CustomerProfileProvider (mock)
           ↓
    ContentStore (seed example data)
           ↓
    Eligibility rules (filter ineligible offers/links)
           ↓
    Ranker interface (RulesBasedRanker today; ML from decision-engine/ later)
           ↓
    Ordered slots + tracking IDs
```

- **Content** (offers, notifications, quick-link definitions) lives in `src/content/` and is independent of ranking logic.
- **Eligibility** always runs before ranking so customers never see offers they cannot purchase.
- **Ranking** is behind the `Ranker` interface in `src/ranking/ranker.ts`.

## Run locally

Requirements: Node.js 20+.

```bash
cd backend
npm install
npm test
npm run dev
```

- API base: `http://localhost:3000`
- OpenAPI UI: `http://localhost:3000/docs`
- Health: `GET /health`

Production build:

```bash
npm run build
npm start
```

Docker:

```bash
docker build -t personalized-home-backend ./backend
docker run -p 3000:3000 personalized-home-backend
```

## API contract

### POST `/v1/decisions`

Request body:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerId` | string | yes | Opaque customer id (mock profiles below) |
| `lob` | `prepaid` \| `postpaid` \| `fixed` | yes | Line of business |
| `channel` | `mobile_app` \| `web` \| `ussd` | yes | Surface requesting the decision |
| `context` | object | no | `locale`, `appVersion`, `screen` (`home` \| `self_care_home`), plus passthrough keys |

Response: `decisionId`, echo of `customerId`, `lob`, `channel`, `generatedAt`, and `slots[]`.

Each slot includes:

- `slotType`: `hero_banner` \| `notification` \| `quick_link`
- `payload`: type-specific content (titles, deep links, etc.)
- `tracking`: `{ trackingId, contentId, slotType, rank, decisionId }` for analytics and future ML training joins

**Example**

```bash
curl -s -X POST http://localhost:3000/v1/decisions \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId": "cust-prepaid-active",
    "lob": "prepaid",
    "channel": "mobile_app",
    "context": { "screen": "home" }
  }'
```

### Quick-link configuration (back office)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/lobs/:lob/quick-links` | Read config for one LOB |
| PUT | `/v1/lobs/:lob/quick-links` | Replace config (`maxSlots` 1–8, `links[]`) |
| GET | `/v1/quick-links` | List all LOB configs |

Link objects: `id`, `label`, optional `icon`, `deepLink`, `priority`, `enabled`, `eligibility` (same rule shape as content).

### POST `/v1/events`

Batch log **impressions** and **clicks** for model training.

```json
{
  "events": [
    {
      "eventType": "impression",
      "trackingId": "<uuid from decision slot>",
      "decisionId": "<uuid>",
      "customerId": "cust-prepaid-active",
      "slotType": "hero_banner",
      "contentId": "offer-prepaid-data-boost",
      "metadata": { "screen": "home" }
    }
  ]
}
```

Returns `202` with `{ accepted, events }`.

## Mock customer profiles

| customerId | Behavior |
|------------|----------|
| `cust-prepaid-active` | Active prepaid, low balance notification, data offer hero |
| `cust-postpaid-premium` | Premium postpaid, bill-due notification, roaming hero |
| `cust-fixed-fiber` | Fixed line, fiber upgrade hero |
| `cust-suspended` | Suspended — no eligible hero/offers requiring active status |

## Example content

Seed data in `src/content/seed-data.ts` is marked with `_example: true`. Replace via a real CMS integration by implementing `ContentStore` without changing decision logic.

## Plugging in ML ranking

Implement `Ranker` and inject it in `buildApp()` in `src/server.ts`. The decision-engine workspace can expose an HTTP or gRPC ranker adapter that implements the same interface.

## Tests

```bash
npm test
```

Covers eligibility filtering, decision assembly, HTTP routes, and event ingestion.
