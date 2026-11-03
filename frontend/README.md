# Harborline home screen

React, TypeScript, and Vite client for the personalized self-care home pilot. The screen renders a server-driven decision: a hero, a balance and usage summary, up to eight quick links for the line of business, and either a notification or a next-best-offer card.

The decision API is not in this repo yet. `npm run dev` serves **example data** through [Mock Service Worker](https://mswjs.io/). A failed or invalid response falls back to a standard layout. The contract the backend should implement is in [docs/api-contract.md](docs/api-contract.md). Types live in [src/types/homeDecision.ts](src/types/homeDecision.ts).

## Prerequisites

Node.js 22.13 or newer.

## Scripts

From this directory:

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run lint
npm run build
npm run preview  # serves the production bundle
```

`npm run dev` opens the prepaid example (Maya Okonkwo) when the URL has no `customerId`. The production bundle does not include the mock layer. `npm run preview` calls `/api/home/decision` and shows the standard layout until that API exists.

## Example scenarios

These customers are fictional. The UI marks a successful mock response with an "Example data" banner, and every mock payload sets `"example": true`.

| Open | What you get |
| --- | --- |
| `/?customerId=maya-okonkwo` | Prepaid. Low airtime notification and a weekend bundle. |
| `/?customerId=arun-desai` | Postpaid. Bill due and a next-best-offer. |
| `/?customerId=lena-berg` | Broadband. Maintenance notification. |
| `/?customerId=no-such-customer` | 404, then the standard layout. |
| `/?customerId=service-outage` | 503, then the standard layout. |

The "Example scenarios" links on the page are pilot chrome for switching those ids. Shortcut and call-to-action targets stay on this screen and announce that the destination is outside the pilot.

When you add the real API, point same-origin `/api` at it. A Vite `server.proxy` entry in `vite.config.ts` is enough for local development. Remove the dev-only mock startup in `src/main.tsx` once you no longer want example data.

## Layout

```text
src/types/homeDecision.ts     wire contract
src/api/parseHomeDecision.ts  runtime validation
src/api/fetchHomeDecision.ts  GET /api/home/decision
src/view/screenModel.ts       decision view, plus the client fallback
src/mocks/personas.ts         example customers
src/mocks/handlers.ts         mock routes
src/components                slots, loading, and error states
```

## Tests

`npm test` covers slot rendering for each line of business, the eight-tile cap, and the fallback for an unknown customer, a 503, an invalid payload, and a missing id.
