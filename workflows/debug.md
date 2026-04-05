# Workflow: Debug Session

## Purpose
Run this when something is broken.
It chains the Analyst and Debugger agents to find the root cause and apply the fix
in a structured way — no guessing, no random changes.

## When to use
- When Luuk gets an error message
- When the app crashes or behaves unexpectedly
- When Luuk says "something is broken" or "this isn't working"
- Also available as the /debug command

---

## Step 1 — Gather information

Before calling any agent, collect all of this:
1. **The exact error message** — full text, copied exactly. Never paraphrase.
2. **What Luuk was doing** — which screen, which action, what was pressed or typed
3. **What the expected behavior is** — what should have happened instead?
4. **What changed recently** — run `git log --oneline -5` and `git diff HEAD~3`

Do not proceed to Step 2 without the exact error message.
If Luuk doesn't have it, ask: "Can you copy the full error message exactly as it appears?"

---

## Step 2 — Call the Analyst

Hand off to the Analyst using the standard handoff block:
```
## Handoff → Analyst
- Goal: Identify the root cause of this error
- Current state: Error collected. Recent git changes reviewed.
- Your task: Read the relevant files and explain exactly what is causing this error and where.
- Files to read: [files identified from the error message or recent changes]
- Expected output: Analysis Report with root cause, file, line number, and confidence level
- Constraints: Do not fix anything — only read and report
```

Receive the Analysis Report.

---

## Step 3 — Confirm the diagnosis

Present the Analyst's findings to Luuk in plain English:
> "Here's what I found: [explanation in simple terms]. The problem is in [file] at [line]: [what the code is doing wrong]."

In interactive mode: ask "Does this match what you expected? Shall I apply the fix?"
In autonomous mode: proceed directly to Step 4, noting the diagnosis in the output.

---

## Step 4 — Call the Debugger

Hand off to the Debugger using the standard handoff block:
```
## Handoff → Debugger
- Goal: Fix the root cause of this error
- Current state: Analyst report complete. Root cause identified at [file], [line].
- Your task: Apply the minimal fix that resolves this root cause
- Files to read: [the specific file(s) from the Analyst report]
- Expected output: Debug Report with fix applied and verification steps
- Constraints: Fix only the root cause — do not refactor, improve, or change anything else
```

Receive the Debug Report with fix applied.

---

## Step 5 — Self-verification checkpoint

Before asking Luuk to test anything, Claude checks its own work:
1. Re-read the changed file(s) after the fix
2. Trace through the logic: "Given the error scenario, does this fix prevent the error?"
3. Check: "Could this fix break anything else?" (use Grep to check where changed code is used)
4. If the fix looks correct: proceed to Step 6
5. If something looks off: go back to the Debugger with findings before asking Luuk to test

---

## Step 6 — Ask Luuk to verify

Tell Luuk exactly how to test the fix:
> "To verify the fix: [exact steps]. You should see [expected result]. The error should no longer appear."

In interactive mode: wait for Luuk to confirm before committing.
In autonomous mode: document the verification steps clearly and commit.

---

## Step 7 — Call the Reviewer (quick pass)

Ask the Reviewer to check only the changed lines:
```
## Handoff → Reviewer
- Goal: Quick check that the fix is clean and has no side effects
- Current state: Fix applied and verified.
- Your task: Review only the changed lines for correctness and unintended side effects
- Files to read: [the file that was changed]
- Expected output: Approved to commit / flag if new problem introduced
- Constraints: Do not review the entire file — only the changed lines
```

---

## Step 8 — Commit the fix

Once confirmed and reviewed:
- Stage only the changed files
- Commit message format: `Fix: [plain English description of what was broken and what was fixed]`
  - Good: `Fix: login screen crash when email field is empty`
  - Bad: `fix bug`

- Update PROGRESS.md: mark the bug as resolved with today's date
- Update COORDINATION.md: clear the bug from "Currently in progress" if it was there
