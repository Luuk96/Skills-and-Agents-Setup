# /end — Wrap up a work session

Run this at the end of every session. It reviews work, updates tracking files,
commits everything to Git, and optionally pushes to GitHub.

## Steps

1. Run a quick review:
   - Run: git diff HEAD
   - List all files changed this session
   - Check for any critical issues (security problems, crashes, missing pieces)
   - If critical issues found: fix them before continuing
   - Minor issues: note them but do not block the commit

2. Update COORDINATION.md:
   - Mark completed tasks as done
   - Note anything left mid-task under "Currently in progress"
   - Write the "Next immediate action" for the next session
   - Add any session notes

3. Update PROGRESS.md:
   - Add today's date as a new session log entry
   - What was done this session (bullet points)
   - What was decided
   - What was left unfinished
   - Update "Current status" and "What is next"

4. Commit to Git:
   - Stage specific changed files (never git add -A blindly)
   - Show Luuk the list of files being staged and ask for confirmation
   - Write a commit message using this format: "[Verb]: [specific description]"
     - Good example: "Add user profile screen with avatar upload"
     - Bad example: "update code"
   - Explain what the commit message means

5. Ask Luuk:
   "Do you want to push this to GitHub now? This saves a copy online."
   If yes: git push origin main
   If the remote is not set up yet: guide Luuk through creating a GitHub repo and connecting it.

6. Wrap up:
   Tell Luuk what was accomplished this session and what comes next session.
