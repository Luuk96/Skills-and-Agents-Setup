# Workflow: Start Session

## Purpose
Run this at the beginning of every work session.
It loads context, checks the project state, and gets Luuk focused and ready.

## When to use
- When Luuk says "let's start" or "I want to work on [project]"
- When Luuk runs /start

---

## Step 1 — Greet and confirm project

1. Greet Luuk warmly
2. State today's date
3. Confirm which project we are working on
4. State clearly:
   > "I will only work inside: /Users/luuklindenkamp/claude-projects/[project-name]. Everything else is off-limits."

---

## Step 2 — Read project context

Read these files in order:
1. `CLAUDE.md` — understand the project, tech stack, rules, and active sprint
2. `PROGRESS.md` — understand the current status and what was last worked on

Summarize for Luuk:
- What this project is
- Where we left off last session
- What the current active sprint is

---

## Step 3 — Check Git status

Run:
```
git log --oneline -5
git status
```

Report back:
- The last 5 commits (translate them into plain English if needed)
- Whether there are any unsaved changes from a previous session
- If there are unsaved changes: ask Luuk if they should be committed or discarded

---

## Step 4 — Call the Analyst (optional)

If Luuk says "remind me where we were" or "I don't remember what we did":
- Call the Analyst agent
- Ask it to summarize the current state of the code
- Pass the summary back to Luuk before asking what to work on

---

## Step 5 — Ask what to work on

Ask:
> "What would you like to work on today?"

Options to suggest if Luuk is unsure:
- Continue the active sprint (list the remaining tasks)
- Start a new sprint (call the Planner)
- Fix something that's broken (call the Debugger)
- Review what was built recently (call the Reviewer)
