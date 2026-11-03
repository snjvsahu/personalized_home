# personalized_home

Pilot for a telecom self-care personalized home screen. Backend services and model code live at the repository root. The web client is isolated under `frontend/` so both tracks can move in parallel.

## Frontend

See [frontend/README.md](frontend/README.md) for how to install, run, test, and build the home screen.

The decision API the client expects is documented in [frontend/docs/api-contract.md](frontend/docs/api-contract.md). TypeScript types for that payload are in [frontend/src/types/homeDecision.ts](frontend/src/types/homeDecision.ts).
