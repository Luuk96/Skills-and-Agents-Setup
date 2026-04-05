# Workflow: Debug Session

## Purpose
Run this when something is broken.
It chains the Analyst and Debugger agents to find the root cause and apply the fix
in a structured way — no guessing, no random changes.

## When to use
- When Luuk gets an error message
- When the app crashes or behaves unexpectedly
- When Luuk says "something is broken" or "this isn't working"

---

## Step 1 — Gather information

Before calling any agent, collect:
1. **The error message** — exact text, copied in full. Never paraphrase.
2. **What Luuk was doing** — which screen, which action, what button was pressed
3. **What was expected** — what should have happened?
4. **What changed recently** — did anything get added or changed before the break?
   (Run `git log --oneline -5` to check)

If Luuk doesn't have all of this, ask for it before continuing.

---

## Step 2 — Call the Analyst

Hand off to the Analyst with:
- The error message
- The files most likely involved (based on the error or what Luuk described)
- The question: "What is causing this error and where exactly is it happening?"

The Analyst reads the relevant code and produces a findings report.

---

## Step 3 — Confirm the diagnosis with Luuk

Present the Analyst's findings to Luuk in plain English:
> "Here's what I found: [explanation]. The problem is in [file], [plain English description of what's wrong]."

Ask: "Does this match what you expected? Shall I fix it?"

In autonomous mode: skip this confirmation and proceed directly to Step 4.

---

## Step 4 — Call the Debugger

Hand off to the Debugger with:
- The Analyst's report
- The exact file and location of the problem
- The expected behavior

The Debugger applies the fix.

---

## Step 5 — Verify the fix

After the Debugger applies the fix:
1. Tell Luuk exactly how to test that the fix worked
   (e.g. "Run the app and try [specific action] — you should now see [expected result]")
2. Ask Luuk to confirm the fix worked before committing

---

## Step 6 — Commit the fix

Once confirmed:
```
git add [specific files changed]
git commit -m "Fix: [plain English description of what was broken and what was fixed]"
```

Example commit message: "Fix: login button crash when email field is empty"

---

## Step 7 — Update PROGRESS.md

Add the bug and fix to the "Known issues / deferred" section of PROGRESS.md,
marked as resolved with today's date.
