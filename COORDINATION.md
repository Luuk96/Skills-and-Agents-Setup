# COORDINATION.md — Skills and Agents Setup

Short-term working memory. Read this at the start of every session.

---

## Currently in progress

Nothing. Session 1 is complete.

---

## Decisions made this session

- Universal foundation before industry-specific agents — build what every project needs first
- MASTER.md is the LLM-optimized reference file — update it every time a course is added
- All agents use standardized handoff blocks for inter-agent communication
- .claude/settings.local.json is excluded from Git (local only)

---

## Blocked / waiting on

- /commands require Claude Code restart to become active — restart before next session

---

## Files actively being changed

None.

---

## Next immediate action

Restart Claude Code so /start, /end, /sprint, /debug, /review become active.
Then: add more Anthropic courses to anthropic-courses/ and update SUMMARY.md and MASTER.md.

---

## Notes from this session

- The /commands system requires files in .claude/commands/ AND a Claude Code restart
- settings.local.json wires the env-protect hook — if this file is missing, the hook won't run
- MASTER.md is written for an LLM, SUMMARY.md is written for a human — both serve different purposes
- Industry-specific agents (mobile, web, trading, video) are planned for Phase 2
