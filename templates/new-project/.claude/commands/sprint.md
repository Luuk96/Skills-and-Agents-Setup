# /sprint — Plan and build a feature or goal

Run this to start a focused build cycle: explore → plan → design → build → verify → review → commit.
Use $arguments to describe the goal, e.g.: /sprint Add a user profile screen

## Steps

### Phase 0 — Set the goal
If $arguments is provided, use it as the sprint goal.
If not, ask Luuk: "What do you want to build or achieve in this sprint?"

### Phase 1 — Explore (always do this before planning)
Before writing a single plan or line of code:
1. Read `agents/registry.yaml` to see all available agents and routing rules
2. Read CLAUDE.md for project context and tech stack
3. Read PROGRESS.md for current state
4. Read COORDINATION.md for anything in progress
5. Read ECOSYSTEM.md for existing field names and schemas (if it exists)
6. Scan the src/ folder to understand what already exists
7. Search for any existing code related to the sprint goal
8. Identify: what exists, what is missing, what must not be broken

Summarize findings: "Here is what already exists and what needs to be built."

### Phase 2 — Plan (Planner agent)
Call the Planner agent with:
- The sprint goal
- Findings from the Explore phase
- The tech stack from CLAUDE.md

Receive: a sprint plan with tasks, order, assigned agents, and definition of done.
Paste the sprint plan into CLAUDE.md under "Active sprint".
Confirm with Luuk before moving on.

### Phase 3 — Design (Architect agent — skip for small tasks)
Skip this phase if the sprint is a single-file change or a small fix.
Otherwise, call the Architect agent with:
- The sprint plan
- Findings from the Explore phase
- The tech stack

Receive: architecture plan with file structure, design decisions, data flow.
Check ECOSYSTEM.md — if new fields or schemas are introduced, add them now.

### Phase 4 — Build (Builder agent)
For each task in the sprint plan, call the Builder agent with:
- The specific task (title, description, definition of done from sprint plan)
- The architecture plan from Phase 3 (or notes from Explore if no Architect was called)
- The tech stack from CLAUDE.md
- ECOSYSTEM.md path (if it exists)

Receive: Build Report with files created/modified, typecheck result, and assumptions.

Rules:
- One task per Builder call — do not batch tasks
- If typecheck fails in the Build Report: call Debugger before moving to Phase 5
- If Builder reports it is blocked: stop and check in with Luuk before continuing
- In interactive mode: confirm with Luuk after each task's Build Report before moving on
- In autonomous mode: complete all tasks, then report back

### Phase 5 — Verify (Verifier agent)
After each task is built, call the Verifier agent with:
- The Build Report from the Builder (files created/modified)
- The task definition from the sprint plan (especially the definition of done)
- The tech stack (so Verifier knows which commands to run)

Receive: Verification Report with PASS or FAIL verdict.

If PASS: move to Phase 6 (Review).
If FAIL:
- Errors or test failures → call Debugger with the exact failure from the Verification Report
- Missing pieces → send back to Builder with specific instruction
- After fix is applied → re-run Verifier before moving on (do not skip re-verification)

### Phase 6 — Review (Reviewer agent)
Only call Reviewer after Verifier has given a PASS verdict.
Call the Reviewer with:
- All files created or modified (from Build Reports)
- The original sprint goal and definition of done

Receive: Code Review Report with verdict (Approved / Needs fixes).
If fixes needed:
- Critical issues: fix immediately (Builder or Debugger), then re-verify and re-review
- Major issues: ask Luuk whether to fix now or defer
- Minor issues: note in PROGRESS.md, allow commit to proceed

### Phase 7 — Commit
- Update PROGRESS.md with what was built this sprint
- Update COORDINATION.md (clear completed tasks, set next action)
- Stage specific files (never git add -A) and commit with a descriptive message
- Offer to push to GitHub
