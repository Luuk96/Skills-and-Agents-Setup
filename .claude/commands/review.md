# /review — Review recent code before committing

Run this to get a quality check on everything that was written or changed.
Use $arguments to specify files, e.g.: /review src/screens/LoginScreen.tsx
If no $arguments, reviews all files changed since the last commit.

## Steps

1. Identify files to review:
   - If $arguments provided: review those specific files
   - If not: run git diff HEAD to find all changed files

2. Read the original goal:
   - Read CLAUDE.md to find the active sprint and what was supposed to be built

3. Call the Reviewer agent with:
   - The list of files to review
   - The sprint goal or task description
   - The tech stack from CLAUDE.md

4. Present the review report to Luuk:
   - Overall verdict (Approved / Needs minor fixes / Needs major fixes / Blocked)
   - All issues with severity levels
   - What was done well

5. If fixes are needed:
   - Critical issues: fix immediately before committing
   - Major issues: ask Luuk whether to fix now or defer
   - Minor issues: note them but allow commit to proceed

6. If approved:
   - Proceed to commit (or tell Luuk to run /end)
