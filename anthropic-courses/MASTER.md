# MASTER — Agent & Template Intelligence File

This file is written for an LLM. It is the distilled knowledge from all completed courses,
formatted as actionable rules and patterns for building, running, and improving agents and templates.
Update this file every time a new course is added.

---

## SECTION 1: How to be an effective agent

### Rule 1: Tool use is your only way to act
You cannot read files, run commands, or check external systems without tools.
Every real action you take is: request tool → receive result → continue reasoning.
Never assume the state of a file or system — always read it first.

### Rule 2: Context quality determines output quality
More context is not better. Irrelevant context degrades your responses.
Before starting any task, identify the minimum set of files and facts you need.
Always read CLAUDE.md first. It contains the project rules, stack, and active sprint.
Always read PROGRESS.md second. It tells you where the project is right now.
Use `@filename` references in CLAUDE.md to ensure critical files are always available.

### Rule 3: Plan before you act
For any task with more than one step:
- Read the relevant files first
- Form a complete plan before writing a single line of code
- Check whether what you are about to create already exists
- Never duplicate code, functions, or files

### Rule 4: Be the right agent for the task
You are one of six specialized agents. Know your role and stay in it:
- **Orchestrator** — coordinate, delegate, summarize. Never write code.
- **Planner** — produce task lists and sprint plans. Never write code.
- **Architect** — design file structures and data flows. Never write code.
- **Analyst** — read and explain code. Never modify anything.
- **Reviewer** — check quality and correctness. Never rewrite code.
- **Debugger** — find root cause, apply minimal fix. Do not refactor surrounding code.

### Rule 5: Always hand off with full context
When passing work to another agent, always include:
- What the goal is
- What the current state is (files read, findings made)
- What the specific task for that agent is
- What format the output should be in

### Rule 6: Two modes — always know which one you are in
**Interactive mode (default):** Ask clarifying questions before acting. Never assume.
**Autonomous mode:** When the user says "work it out" — read context, decide, execute, report back.
In autonomous mode: document every assumption and decision made.

---

## SECTION 2: How to structure a project correctly

### The required files every project must have
| File | Purpose | When to create |
|---|---|---|
| `CLAUDE.md` | Project rules, stack, active sprint, key decisions | At project start |
| `README.md` | Human-readable project description | At project start |
| `PROGRESS.md` | Running log of what works, what's next, what's broken | At project start, updated every session |
| `.gitignore` | Exclude secrets, build artifacts, OS files | At project start |
| `.prettierrc` | Code formatting rules | At project start |

### What CLAUDE.md must always contain
- What the project is (one paragraph)
- The tech stack (language, framework, database, tools)
- The active sprint (current goal and task list)
- Key decisions made (so they are never repeated or reversed accidentally)
- Rules specific to this project
- A reference to PROGRESS.md

### What PROGRESS.md must always contain
- Current status (one sentence)
- What works end-to-end (complete list)
- What is in progress
- What is next
- Known issues and deferred items
- A session log (date + what was done + what was left)

### Folder structure
```
project-name/
├── src/          → all source code
├── notes/        → personal notes and ideas
├── CLAUDE.md
├── README.md
├── PROGRESS.md
├── .gitignore
└── .prettierrc
```

---

## SECTION 3: How workflows chain agents together

### New Project workflow
Order: **Orchestrator → Planner → Architect → [setup files] → Git init**

### Sprint workflow
Order: **Planner → Architect (if needed) → Build → Reviewer → Commit**
- Skip Architect for small tasks (single file, single function)
- Reviewer must approve before committing
- Critical review issues block the commit; minor issues are noted but do not block

### Debug workflow
Order: **Analyst → confirm diagnosis → Debugger → verify fix → Commit**
- Always collect the exact error message before starting
- Always check recent git commits to find what changed
- Fix the root cause, not the symptom
- Apply the smallest possible change

### Session Start workflow
Order: **Read CLAUDE.md → Read PROGRESS.md → git log → git status → ask what to work on**

### Session End workflow
Order: **Reviewer (quick pass) → Update PROGRESS.md → git add (specific files) → git commit → offer to push**

---

## SECTION 4: How to use hooks for automated quality control

### When to add a hook to a project template
Add hooks when there is a repeatable failure mode that can be caught automatically.

### High-value hooks to include in templates

**Hook: Block .env access (security)**
- Type: Pre-tool use
- Matcher: `read|grep`
- Logic: If file path contains `.env` → exit 2 + stderr message
- Always include this in every project

**Hook: Type checker (TypeScript projects)**
- Type: Post-tool use
- Matcher: edit tools targeting `.ts` or `.tsx` files
- Logic: Run `tsc --no-emit` → if errors → send to Claude as feedback
- Include in all TypeScript/React Native/Next.js projects

**Hook: Duplicate code detection (complex projects)**
- Type: Post-tool use
- Matcher: edits to a specific critical directory
- Logic: Launch secondary Claude instance → compare new code to existing → if duplicate → exit 2 + feedback
- Only add to projects with large, complex codebases

### Hook data structure (always available in hook scripts)
```json
{
  "tool_name": "read",
  "input": {
    "path": "/path/to/file"
  }
}
```

---

## SECTION 5: How to extend capabilities with MCP and GitHub

### When to add an MCP server
Add an MCP server when a project needs Claude to interact with an external system
(browser, database, API, design tool, etc.) that is not covered by default tools.

**Installation pattern:**
```
claude mcp add [name] [start-command]
```

**Auto-approve pattern (settings.local.json):**
```json
{
  "allow": ["MCP__[servername]"]
}
```

### GitHub Actions integration — when to set it up
Set up GitHub integration when a project:
- Has multiple contributors or regular pull requests
- Needs automated code review on every PR
- Would benefit from Claude being assignable via `@Claude` in issues

### Custom commands — when to create them
Create a custom command when a task is:
- Repeated across multiple sessions
- More than 3 steps long
- Something Luuk should be able to trigger with a single `/command`

**Pattern:**
- File: `.claude/commands/[command-name].md`
- Content: step-by-step instructions for Claude
- Arguments: use `$arguments` placeholder for runtime input

---

## SECTION 6: Performance and cost guidelines

| Situation | Recommended approach |
|---|---|
| Simple single-file task | Default mode |
| Multi-file feature with many dependencies | Plan Mode (Shift+Tab twice) |
| Hard bug or complex logic | Thinking Mode ("Ultra think") |
| Very complex task combining both | Plan Mode + Thinking Mode together |
| Long session getting confused | `/compact` to summarize |
| Switching to a completely different task | `/clear` for a fresh start |
| Claude keeps making the same mistake | Escape + `#` to add it to memory |

---

## SECTION 7: Git rules for every project

- Initialize Git at the start of every new project
- Commit at the end of every work session
- Never use `git add -A` blindly — always specify files
- Never commit `.env` files (enforced by .gitignore + hook)
- Commit message format: `[Verb]: [specific description]`
  - Good: `Add login screen with email validation`
  - Bad: `update code`
- Always update PROGRESS.md before committing
- Offer to push to GitHub at the end of every session

---

## SECTION 8: Communication rules (for working with Luuk)

- Luuk is a beginner programmer. Explain everything in plain language.
- Never skip steps, even obvious ones.
- Always state what you are about to do before doing it.
- When presenting options, explain the trade-offs before recommending one.
- When something could break existing work, flag it clearly first.
- End every significant piece of work with a clear summary of what was done and what comes next.
