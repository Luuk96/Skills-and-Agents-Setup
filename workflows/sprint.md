# Workflow: Sprint

## Purpose
A sprint is one focused cycle of work: explore → plan → design → build → verify → review → commit.
This workflow chains the Planner, Architect, and Reviewer agents together
so that building a feature is structured, not chaotic.

## When to use
- When starting a new feature or goal
- When Luuk says "let's plan the next thing to build"
- At the start of a session when the current sprint is done
- Also available as the /sprint command

---

## Phase 0 — Set the goal

Before anything else, confirm the sprint goal:
- If starting from a session: read COORDINATION.md for "Next immediate action"
- If Luuk describes a goal: restate it in one sentence and confirm
- If unclear: ask one focused question to clarify

---

## Phase 1 — Explore (always do this before planning)

This phase prevents building on wrong assumptions or duplicating existing work.

1. Read CLAUDE.md — project rules, stack, active sprint
2. Read PROGRESS.md — what exists and what's known to be broken
3. Read COORDINATION.md — anything currently in progress
4. Read ECOSYSTEM.md — existing field names, schemas, API contracts
5. Scan src/ folder structure with Glob
6. Use Grep to search for any existing code related to the sprint goal
7. Check git log for recent changes that are relevant

Produce a short "Explore Summary":
```
## Explore Summary
- What already exists related to this goal: [list]
- What needs to be built from scratch: [list]
- Existing code that must not be broken: [list]
- Field names / schemas this sprint will touch: [list from ECOSYSTEM.md]
```

Do not move to Phase 2 until this summary is written.

---

## Phase 2 — Plan (Planner agent)

Hand off to the Planner with:
- The sprint goal
- The Explore Summary
- The tech stack from CLAUDE.md

Receive: sprint plan with tasks, order of operations, and definition of done.
Paste the sprint plan into CLAUDE.md under "Active sprint".

In interactive mode: confirm the plan with Luuk before moving on.
In autonomous mode: proceed immediately, noting that the plan is documented in CLAUDE.md.

---

## Phase 3 — Design (Architect agent)

Skip this phase if:
- The sprint is a single-file change, or
- The sprint is a small fix with no new files needed

Otherwise, hand off to the Architect with:
- The sprint plan from Phase 2
- The Explore Summary from Phase 1
- The tech stack from CLAUDE.md

Receive: architecture plan with file structure, design decisions, data flow.

If new field names or schemas are introduced: update ECOSYSTEM.md now, before building.

---

## Phase 4 — Build

Implement tasks from the sprint plan in order.

Rules during build:
- Work one task at a time
- Comment all new code explaining what it does
- Check ECOSYSTEM.md before naming any new fields or data shapes
- Use Grep before creating any new function — check it doesn't already exist
- In interactive mode: confirm with Luuk after each task before moving to the next
- In autonomous mode: complete all tasks, then report back with a summary

If a task reveals unexpected complexity mid-build:
- Stop immediately
- Explain what was found
- Ask Luuk how to proceed (do not guess and push forward)

---

## Phase 5 — Verify

After building, test the work before review:
1. Run any available tests (`npm test`, `pytest`, etc. — check CLAUDE.md for the right command)
2. Describe to Luuk exactly how to manually verify the feature works
3. List what the expected result is for each verification step

In interactive mode: wait for Luuk to confirm it works before proceeding.
In autonomous mode: document verification steps and proceed, flagging if tests fail.

---

## Phase 6 — Review (Reviewer agent)

Hand off to the Reviewer with:
- All files created or changed during Phase 4
- The original sprint plan

Receive: review report with verdict (Approved / Needs fixes / Blocked).

If fixes needed:
- Critical: fix immediately
- Major: ask Luuk whether to fix now or defer
- Minor: note but allow commit

---

## Phase 7 — Commit

1. Update PROGRESS.md with what was built this sprint
2. Update COORDINATION.md — clear completed tasks, set "Next immediate action"
3. Stage specific files (never git add -A blindly)
4. Commit with format: "[Verb]: [specific description of what was built]"
5. Offer to push to GitHub

---

## Sprint complete

Tell Luuk:
```
Sprint complete! Here's what was built:
- [list of tasks completed]

Verified: [how it was tested]
Committed as: "[commit message]"

Next sprint options:
- [suggest logical next goal based on PROGRESS.md]
- Or tell me what you want to build next.
```
