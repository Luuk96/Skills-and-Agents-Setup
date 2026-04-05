# Workflow: Sprint

## Purpose
A sprint is one focused cycle of work: plan → build → review → commit.
This workflow chains the Planner, Architect, and Reviewer agents together
so that building a feature is structured, not chaotic.

## When to use
- When starting a new feature or goal
- When Luuk says "let's plan the next thing to build"
- At the start of a session when the current sprint is done

---

## Phase 1 — Plan (Planner agent)

### What happens
The Planner agent takes the goal and breaks it into tasks.

### Input needed
- What is the goal? (what should work when this sprint is done?)
- What already exists that's relevant?

### Output
A sprint plan with tasks, order of operations, and definition of done.
This gets pasted into CLAUDE.md under "Active sprint".

### Autonomous mode
If Luuk says "work it out", the Planner reads CLAUDE.md and PROGRESS.md
to determine the logical next sprint automatically.

---

## Phase 2 — Design (Architect agent)

### What happens
The Architect reads the sprint plan and designs the technical structure.

### Input needed
- The sprint plan from Phase 1
- The existing project structure (read the src/ folder)
- The tech stack (from CLAUDE.md)

### Output
An architecture plan: which files to create, which to modify, and how data flows.
This gets pasted into the sprint notes or CLAUDE.md.

### Skip condition
If the sprint is very small (e.g. fixing one function, changing one screen),
skip this phase and go straight to building.

---

## Phase 3 — Build

### What happens
Claude (as the general coding agent) implements the tasks from the sprint plan,
following the architecture from Phase 2.

### Rules during build
- Work through tasks in the order defined by the Planner
- After each task, confirm with Luuk before moving to the next (in interactive mode)
- In autonomous mode, complete all tasks and report back at the end
- Always add comments to new code explaining what it does

---

## Phase 4 — Review (Reviewer agent)

### What happens
The Reviewer reads all changed files and checks for quality, correctness, and completeness.

### Input needed
- All files created or changed during Phase 3
- The original sprint plan (to check that everything was built)

### Output
A review report. Any critical issues must be fixed before Phase 5.

---

## Phase 5 — Commit

Run the End Session workflow (or just the commit steps from it):
- Update PROGRESS.md
- Stage and commit all changed files
- Write a clear commit message summarizing the sprint

---

## Sprint complete

Tell Luuk:
```
Sprint complete! Here's what was built:
- [list of tasks completed]

Committed as: "[commit message]"

Next sprint options:
- [suggest logical next goal based on PROGRESS.md]
- Or tell me what you want to build next.
```
