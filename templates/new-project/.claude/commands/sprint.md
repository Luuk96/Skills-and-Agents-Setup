# /sprint — Plan and build a feature or goal

Run this to start a focused build cycle: explore → plan → design → build → review → commit.
Use $arguments to describe the goal, e.g.: /sprint Add a user profile screen

## Steps

### Phase 0 — Set the goal
If $arguments is provided, use it as the sprint goal.
If not, ask Luuk: "What do you want to build or achieve in this sprint?"

### Phase 1 — Explore (always do this before planning)
Before writing a single plan or line of code:
1. Read CLAUDE.md for project context and tech stack
2. Read PROGRESS.md for current state
3. Read COORDINATION.md for anything in progress
4. Read ECOSYSTEM.md for existing field names and schemas
5. Scan the src/ folder to understand what already exists
6. Search for any existing code related to the sprint goal
7. Identify: what exists, what is missing, what must not be broken

Summarize findings: "Here is what already exists and what needs to be built."

### Phase 2 — Plan (Planner agent)
Call the Planner agent with:
- The sprint goal
- Findings from the Explore phase
- The tech stack from CLAUDE.md

Receive: a sprint plan with tasks, order, and definition of done.
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

### Phase 4 — Build
Implement tasks from the sprint plan in order.
After each task:
- In interactive mode: confirm with Luuk before moving to the next task
- In autonomous mode: complete all tasks, then report back

Rules during build:
- Comment all new code
- Check ECOSYSTEM.md before naming any new fields
- Never duplicate code that already exists — check first with Grep
- If a task reveals unexpected complexity, stop and check in with Luuk

### Phase 5 — Verify
After building, test the work:
- Run any available tests
- Describe to Luuk how to manually verify the feature works
- Wait for confirmation before committing

### Phase 6 — Review (Reviewer agent)
Call the Reviewer with all changed files and the original sprint plan.
Receive: review report with verdict (approved / needs fixes).
If fixes needed: apply them, then re-verify.

### Phase 7 — Commit
- Update PROGRESS.md with what was built
- Update COORDINATION.md (clear completed tasks, set next action)
- Stage specific files and commit with a descriptive message
- Offer to push to GitHub
