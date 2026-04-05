# Workflow: New Project Setup

## Purpose
Run this workflow at the very start of a brand new project.
It asks Luuk 5 questions, then sets up everything automatically:
folder structure, CLAUDE.md, README, PROGRESS.md, .gitignore, .prettierrc, and Git.

## When to use
- When Luuk says "I want to start a new project"
- When Luuk runs /new-project

---

## Step 1 — Ask the 5 setup questions

Ask Luuk these questions (can be asked all at once):

1. **What is the name of this project?**
   (This becomes the folder name and project title)

2. **What type of project is this?**
   Options: Mobile app / Web project / Trading bot / Video tools / Other (describe)

3. **What does this project do?**
   (One or two sentences — what problem does it solve or what will it produce?)

4. **What is the main tech stack?**
   (e.g. Python, React Native, Node.js — or say "not sure" and Claude will suggest one)

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

Files to be created:
- CLAUDE.md
- README.md
- PROGRESS.md
- .gitignore
- .prettierrc
- src/ folder
- notes/ folder

Shall I proceed? (yes / change something)
```

---

## Step 3 — Create the project folder and files

Using the templates from: `Skills and Agents Setup/templates/new-project/`

1. Create the folder at `/Users/luuklindenkamp/claude-projects/[project-name]/`
2. Create `src/` and `notes/` subfolders
3. Copy and fill in:
   - CLAUDE.md (fill in all [PLACEHOLDERS] with the answers from Step 1)
   - README.md (fill in name and description)
   - PROGRESS.md (fill in project name, set status to "Just started")
   - .gitignore (copy as-is)
   - .prettierrc (copy as-is)

---

## Step 4 — Initialize Git

Run these commands in order:
```
git init
git add .
git commit -m "Initial project setup: [project name]"
```

Explain to Luuk:
> "Git is now tracking this project. Think of it like turning on the save history.
> Every commit is a snapshot you can always go back to."

---

## Step 5 — Call the Planner agent

Hand off to the Planner with:
- The project goal (from question 3)
- The first sprint goal (from question 5)
- The tech stack (from question 4)

Ask the Planner to produce the first sprint plan and paste it into CLAUDE.md
under "Active sprint".

---

## Step 6 — Confirm ready to start

Tell Luuk:
```
Your project is ready.

Here's what was created:
/Users/luuklindenkamp/claude-projects/[name]/
├── src/
├── notes/
├── CLAUDE.md    ✓
├── README.md    ✓
├── PROGRESS.md  ✓
├── .gitignore   ✓
└── .prettierrc  ✓

Git is initialized with your first commit.
Your first sprint plan is in CLAUDE.md.

What would you like to work on first?
```
