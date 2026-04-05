# /start — Begin a work session

Run this at the beginning of every session. It loads all project context,
checks the current state, and gets you focused and ready to work.

## Steps

1. Greet Luuk and confirm today's date.

2. State clearly:
   "I will only work inside: /Users/luuklindenkamp/claude-projects/[project-name]. Everything else is off-limits."

3. Read these files in order:
   - CLAUDE.md — project rules, stack, active sprint
   - PROGRESS.md — current status and what was last worked on
   - COORDINATION.md — what is currently in progress and what was left mid-task

4. Summarize for Luuk:
   - What this project is (one sentence)
   - What the current active sprint is
   - What was last worked on and where it was left off
   - Whether there is an immediate next action from COORDINATION.md

5. Run: git log --oneline -5
   Run: git status
   Report:
   - The last 5 commits in plain English
   - Whether there are unsaved changes from a previous session
   - If there are unsaved changes: ask Luuk whether to commit or discard them

6. Ask: "What would you like to work on today?"
   If Luuk is unsure, suggest:
   - Continue the active sprint (list remaining tasks)
   - Start a new sprint (call the Planner)
   - Fix something broken (call the Debugger)
   - Review recent work (call the Reviewer)
