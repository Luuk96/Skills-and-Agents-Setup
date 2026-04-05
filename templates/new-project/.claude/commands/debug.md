# /debug — Find and fix a broken thing

Run this when something is not working.
Use $arguments to describe the problem, e.g.: /debug Login screen crashes on submit

## Steps

### Step 1 — Gather information
Collect everything before touching any code:
1. The exact error message (ask Luuk to copy it in full if not in $arguments)
2. What Luuk was doing when the error happened
3. What the expected behavior should be
4. Run: git log --oneline -5 (what changed recently?)
5. Run: git diff HEAD~3 (what code changed in the last 3 commits?)

Do not proceed without the exact error message.

### Step 2 — Call the Analyst agent
Hand off to the Analyst with:
- The error message
- The relevant files (based on the error or recent changes)
- The question: "What is causing this error and where exactly?"

Receive: Analysis Report with root cause findings, files, and line numbers.

### Step 3 — Confirm diagnosis
Present the Analyst's findings to Luuk in plain English:
"Here's what I found: [explanation]. The problem is in [file] at [line]."

In interactive mode: ask "Does this match what you expected? Shall I fix it?"
In autonomous mode: proceed directly to Step 4.

### Step 4 — Call the Debugger agent
Hand off to the Debugger with:
- The Analyst's full report
- The exact file and line of the problem
- The expected behavior

Receive: Debug Report with fix applied.

### Step 5 — Verify
Tell Luuk exactly how to test that the fix worked.
In interactive mode: wait for Luuk to confirm before committing.
In autonomous mode: describe verification steps clearly and commit after.

### Step 6 — Call the Reviewer agent (quick pass)
Ask the Reviewer to check only the changed lines for unintended side effects.

### Step 7 — Commit
Once the fix is confirmed:
- Stage only the changed files
- Commit message format: "Fix: [plain English description of what was broken and what was fixed]"
  Example: "Fix: profile screen crash when user has no avatar"
- Update PROGRESS.md (mark the bug as resolved with today's date)
- Update COORDINATION.md
