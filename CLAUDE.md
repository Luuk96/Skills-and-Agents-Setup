# CLAUDE.md — Skills and Agents Setup

## What this project is
This is Luuk's master toolkit. It contains reusable agents, templates, and /commands
that get used in every new project. Nothing here is project-specific — everything here
is universal and reusable.

## Folder structure
```
Skills and Agents Setup/
├── agents/                → instruction files for each specialized subagent
├── templates/             → reusable project starters (folder structure, CLAUDE.md, etc.)
├── .claude/commands/      → active /commands: /start, /end, /sprint, /debug, /review
├── anthropic-courses/     → course notes and LLM-optimized reference (MASTER.md)
├── dashboard/             → live observability dashboard for the agent ecosystem
└── hooks/                 → env-protect hook (prevents accidental .env commits)
```

## How agents work
Each file in agents/ is an instruction set for a specific Claude subagent.
When starting a new project, these agent files are referenced or copied in so Claude
knows exactly how to behave in each role.

## How /commands work
Each file in .claude/commands/ is a /command that can be run directly in Claude Code.
These are the active playbooks: /start, /end, /sprint, /debug, /review.
The templates/new-project/.claude/commands/ folder contains copies for new projects.

## Rules for this folder
- Never delete agent or command files without Luuk's explicit approval
- When updating an agent, always explain what changed and why
- Keep everything simple and beginner-friendly — Luuk can always read these files
- Every agent and command must have a clear purpose written at the top of the file

## Who uses this
Luuk Lindenkamp. Beginner programmer. Explain everything clearly. Never skip steps.
