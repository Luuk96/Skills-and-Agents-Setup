# Workflow: End Session

## Purpose
Run this at the end of every work session.
It saves all work, updates the progress log, commits to Git, and optionally pushes to GitHub.

## When to use
- When Luuk says "let's wrap up" or "we're done for today"
- When Luuk runs /commit or /push
- At the natural end of a coding session

---

## Step 1 — Call the Reviewer (quick review)

Before saving anything, call the Reviewer agent with:
- All files that were changed or created this session
- The task or sprint goal they were working toward

The Reviewer checks for any critical issues that should be fixed before committing.

If there are critical issues: fix them before moving to Step 2.
If there are only minor issues: note them but continue — don't block the commit.

---

## Step 2 — Update PROGRESS.md

Update the project's PROGRESS.md with:
1. Today's date as a new session log entry
2. What was done this session (bullet points)
3. What was decided (any important choices made)
4. What was left unfinished
5. Update the "Current status" and "What is next" sections

---

## Step 3 — Commit to Git

Run:
```
git add [list specific files changed — never git add -A blindly]
git status   ← review what's staged before committing
git commit -m "[clear description of what was built or changed]"
```

The commit message should:
- Start with a verb: "Add", "Fix", "Update", "Build", "Remove"
- Be specific: "Add login screen with email input" not "update code"
- Be short but complete (under 72 characters)

Explain to Luuk what the commit message means and why it was written that way.

---

## Step 4 — Push to GitHub (ask first)

Ask Luuk:
> "Do you want to push this to GitHub now? This saves a copy online."

If yes:
```
git push origin main
```

If the remote isn't set up yet, guide Luuk through:
1. Creating a repo on GitHub (github.com, logged in as Luuk96)
2. Running: `git remote add origin [repo URL]`
3. Running: `git push -u origin main`

---

## Step 5 — Wrap up

Tell Luuk:
```
Great session! Here's what we accomplished:
- [bullet points of what was done]

Everything is saved and committed.
[If pushed: "Your code is also backed up on GitHub."]

Next session, we'll pick up with: [what comes next]
```
