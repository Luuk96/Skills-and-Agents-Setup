# COORDINATION.md — Skills and Agents Setup

Short-term working memory. Read this at the start of every session.

---

## Currently in progress

Nothing. Session 3 is complete.

---

## Decisions made this session

- Built the full observability dashboard as a permanent foundation layer for all future projects
- Event-driven architecture chosen: events are the source of truth, state is always derived
- SQLite for local-first storage — no external dependencies
- CompositeEmitter: HTTP-first with file fallback so events are never lost
- Monorepo with npm workspaces: core, sdk, backend, frontend as separate packages
- Agent Network Graph added as Phase 2 of the dashboard
- Repository created and pushed: Luuk96/Skills-and-Agents-Setup

---

## Blocked / waiting on

- Nothing currently blocked.

---

## Files actively being changed

None.

---

## Next immediate action

Run the dashboard to verify it works end-to-end:
1. Terminal 1: cd dashboard && npm run dev -w packages/backend
2. Terminal 2: cd dashboard && npm run dev -w packages/frontend
3. Terminal 3: cd dashboard && npm run mock -w packages/backend
Then open http://localhost:5173 to see the live dashboard.

After that: wire the dashboard into a real project using @dashboard/sdk.

---

## Notes from this session

- The /commands system requires files in .claude/commands/ AND a Claude Code restart
- settings.local.json wires the env-protect hook — if this file is missing, the hook won't run
- MASTER.md is written for an LLM, SUMMARY.md is written for a human — both serve different purposes
- Industry-specific agents (mobile, web, trading, video) are planned for Phase 3
- Dashboard packages: @dashboard/core (types), @dashboard/sdk (agent instrumentation), backend (Express+WS+SQLite), frontend (React+Vite)
- tsconfig-paths required for @dashboard/core alias resolution in ts-node without pre-building
- data/ and chat history/ are local-only — never commit them
