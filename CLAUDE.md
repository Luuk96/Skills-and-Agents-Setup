# CLAUDE.md — Skills and Agents Setup

## What this project is
This is Luuk's master toolkit. It contains reusable agents, templates, and workflows
that get used in every new project. Nothing here is project-specific — everything here
is universal and reusable.

## Folder structure
```
Skills and Agents Setup/
├── agents/          → instruction files for each specialized subagent
├── templates/       → reusable project starters (folder structure, CLAUDE.md, etc.)
└── workflows/       → step-by-step playbooks that chain agents together
```

## How agents work
Each file in agents/ is an instruction set for a specific Claude subagent.
When starting a new project, these agent files are referenced or copied in so Claude
knows exactly how to behave in each role.

## How workflows work
Each file in workflows/ is a step-by-step script. It tells Claude (and Luuk) exactly
what happens at each stage — which agents to call, what questions to ask, what to produce.

## Rules for this folder
- Never delete agent or workflow files without Luuk's explicit approval
- When updating an agent, always explain what changed and why
- Keep everything simple and beginner-friendly — Luuk can always read these files
- Every agent and workflow must have a clear purpose written at the top of the file

## Who uses this
Luuk Lindenkamp. Beginner programmer. Explain everything clearly. Never skip steps.
