# CLAUDE.md — Agent Dashboard

## What this is
A live observability dashboard for Luuk's Claude Code agent ecosystem.
It shows every agent, workflow, task, skill invocation, handoff, and event in real time.

## Structure
```
dashboard/
├── packages/core/      → shared TypeScript types (all entities + events)
├── packages/sdk/       → DashboardSDK — what agents import to emit events
├── packages/backend/   → Node.js + SQLite + WebSocket server (port 3001)
├── packages/frontend/  → React + Tailwind dashboard UI (port 5173)
├── events/             → watched folder for file-based event emission
├── data/               → SQLite database (gitignored)
└── ECOSYSTEM.md        → full instrumentation contract (read this first)
```

## How to start
```bash
npm install
npm run build -w packages/core
npm run build -w packages/sdk
npm run dev -w packages/backend     # terminal 1
npm run dev -w packages/frontend    # terminal 2
npm run mock -w packages/backend    # optional: fills dashboard with mock data
```

## Key design rules
- Events are the source of truth — state is always derived from events
- Never mutate events in the database
- The SDK (packages/sdk) is the only thing agents should import
- All TypeScript interfaces live in packages/core — never duplicate them
- The backend runs on port 3001, the frontend on port 5173

## Adding a new agent
1. Import DashboardSDK from @dashboard/sdk
2. Follow the contract in ECOSYSTEM.md
3. Call agentStarted(), heartbeat(), and agentStopped() at minimum

## Adding a new event type
1. Add the type string to EventType in packages/core/src/types/event.ts
2. Add a payload interface
3. Add a handler in packages/backend/src/projection/StateProjector.ts
4. Add an SDK method in packages/sdk/src/DashboardSDK.ts
5. Update ECOSYSTEM.md

## For Luuk
Everything in ECOSYSTEM.md is the contract. If you want to instrument a new agent or workflow,
read that file first — it shows exactly what to call and when.
