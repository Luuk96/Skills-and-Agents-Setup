# Workflow: New Project Setup

## Purpose
Run this workflow at the very start of a brand new project.
It asks Luuk 5 questions, then sets up everything automatically.

## When to use
- When Luuk says "I want to start a new project"
- When Luuk runs /new-project

---

## Step 1 — Ask the 5 setup questions

Ask Luuk these questions (all at once is fine):

1. **What is the name of this project?**
   (This becomes the folder name and project title)

2. **What type of project is this?**
   Options: Mobile app / Web project / Trading bot / Video tools / Other (describe)

3. **What does this project do?**
   (One or two sentences — what problem does it solve or what will it produce?)

4. **What is the main tech stack?**
   (e.g. Python, React Native with Expo, Node.js — or say "not sure" and Claude will suggest one)

5. **What is the first thing you want to build?**
   (This becomes the first sprint)

---

## Step 2 — Confirm before creating anything

Show Luuk a summary of what will be created:
```
Here's what I'm about to set up:

Project name: [name]
Location: /Users/luuklindenkamp/claude-projects/[name]/
Type: [type]
Tech stack: [stack]
First sprint goal: [goal]

Files and folders to be created:
- CLAUDE.md            ← project rules and context
- README.md            ← project description
- PROGRESS.md          ← session log and status tracking
- COORDINATION.md      ← cross-session working memory
- ECOSYSTEM.md         ← data field names and schemas
- .gitignore           ← files excluded from Git
- .prettierrc          ← code formatting rules
- src/                 ← all source code
- notes/               ← personal notes and ideas
- hooks/
│   └── env-protect.js ← security: blocks Claude from reading .env files
- .claude/
│   ├── settings.local.json  ← hooks configuration
│   └── commands/
│       ├── start.md   ← /start command
│       ├── end.md     ← /end command
│       ├── sprint.md  ← /sprint command
│       ├── debug.md   ← /debug command
│       └── review.md  ← /review command

Shall I proceed? (yes / change something)
```

---

## Step 3 — Create the project folder and files

Source templates from: `Skills and Agents Setup/templates/new-project/`

1. Create the folder: `/Users/luuklindenkamp/claude-projects/[project-name]/`
2. Create subfolders: `src/`, `notes/`, `hooks/`, `.claude/`, `.claude/commands/`
3. Copy and fill in from templates:
   - **CLAUDE.md** — fill in all [PLACEHOLDERS] with answers from Step 1
   - **README.md** — fill in project name and description
   - **PROGRESS.md** — fill in project name, set status to "Just started"
   - **COORDINATION.md** — fill in project name, leave sections empty
   - **ECOSYSTEM.md** — fill in project name, leave sections empty for now
   - **.gitignore** — copy as-is
   - **.prettierrc** — copy as-is
   - **hooks/env-protect.js** — copy as-is (no changes needed)
   - **.claude/settings.local.json** — copy as-is (no changes needed)
   - **.claude/commands/** — copy all 5 command files as-is

4. Add `.claude/settings.local.json` to `.gitignore` — it contains local settings that should not be committed:
   Open `.gitignore` and add the line: `.claude/settings.local.json`

---

## Step 4 — Initialize Git

Run these commands in order:
```
git init
git add CLAUDE.md README.md PROGRESS.md COORDINATION.md ECOSYSTEM.md .gitignore .prettierrc src/ notes/ hooks/ .claude/commands/
git commit -m "Initial project setup: [project name]"
```

Note: `.claude/settings.local.json` is intentionally not committed (it's local only).

Explain to Luuk:
> "Git is now tracking this project. Think of it like turning on the save history.
> Every commit is a snapshot you can always go back to.
> The .env protection hook is active — Claude can never accidentally read your secrets."

---

## Step 5 — Call the Planner agent

Hand off to the Planner with:
- The project goal (from question 3)
- The first sprint goal (from question 5)
- The tech stack (from question 4)

The Planner produces the first sprint plan.
Paste it into CLAUDE.md under "Active sprint".

---

## Step 6 — Confirm ready to start

Tell Luuk:
```
Your project is ready.

Here's what was created:
/Users/luuklindenkamp/claude-projects/[name]/
├── src/
├── notes/
├── CLAUDE.md         ✓
├── README.md         ✓
├── PROGRESS.md       ✓
├── COORDINATION.md   ✓
├── ECOSYSTEM.md      ✓
├── .gitignore        ✓
├── .prettierrc       ✓
├── hooks/
│   └── env-protect.js ✓
└── .claude/
    ├── settings.local.json ✓
    └── commands/
        ├── start.md  ✓  → use /start at the beginning of every session
        ├── end.md    ✓  → use /end at the end of every session
        ├── sprint.md ✓  → use /sprint to plan and build a feature
        ├── debug.md  ✓  → use /debug when something is broken
        └── review.md ✓  → use /review to check your code

Git is initialized with your first commit.
Your first sprint plan is in CLAUDE.md.

What would you like to work on first?
```
