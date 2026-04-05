# Course: Claude Code Fundamentals

Source: Anthropic video course
Purpose: Building blocks for our agents, templates, and workflows — and a reference to learn from.

---

## 1. What is a Coding Assistant?

A coding assistant is a tool that uses a language model to write code and complete development tasks.

**Core process:**
1. Receives a task (e.g. fix a bug from an error message)
2. Gathers context (reads files, understands the codebase)
3. Formulates a plan
4. Takes action (updates files, runs tests)

**Key limitation:** Language models can only process text. They cannot directly read files, run commands, or interact with external systems on their own.

**Tool Use System** — how language models perform real actions:
1. The assistant appends instructions to the user request
2. Instructions specify how to format action requests (e.g. "read file: filename")
3. The language model responds with a formatted action request
4. The assistant executes the actual action (reads the file, runs the command)
5. Results are sent back to the language model for a final response

**Why Claude is better at tool use:**
- Superior at understanding tool functions and combining them for complex tasks
- Claude Code is extensible — easy to add new tools
- Better security through direct code search vs. indexing that sends your codebase to external servers

---

## 2. Claude Code in Action

Claude Code is an AI assistant with tool-based capabilities for code tasks.

**Default tools:** File reading/writing, command execution, basic development operations.

**What it can do (real examples):**
- Analyzed the Chalk JavaScript library (429M weekly downloads), found bottlenecks, and achieved a **3.9x throughput improvement**
- Performed churn analysis on CSV data using Jupyter notebooks, iterating on findings
- Used Playwright MCP server to open a browser, take screenshots, and update UI styling
- Ran inside GitHub Actions to automatically detect a PII exposure risk in a pull request (a developer accidentally exposed user emails through a Lambda function connected to an external partner)

**Key principle:** Claude Code grows with your team's needs through tool expansion, not fixed functionality.

---

## 3. Adding Context

Context management is critical. Too much irrelevant information decreases performance.

**CLAUDE.md files — three types:**
| Type | What it is | Committed to Git? |
|---|---|---|
| Project level | Shared with the whole team | Yes |
| Local level | Personal instructions | No |
| Machine level | Global instructions for all projects | N/A |

**`/init` command:** Analyzes the entire codebase on first run and creates a CLAUDE.md with a project summary, architecture overview, and key files. This file is included in every request automatically.

**`#` symbol (Memory mode):** Edit CLAUDE.md files intelligently using natural language (e.g. "remember to always use TypeScript strict mode").

**`@` symbol:** Mention a specific file to include it in your request. Provides targeted context instead of letting Claude search for it.

**Best practice:** Reference critical files (like database schemas) in CLAUDE.md so they are always available as context.

**Goal:** Provide just enough relevant information for Claude to complete tasks effectively — not everything.

---

## 4. Making Changes

**Screenshot integration:** Use `Control-V` (not Command-V on macOS) to paste screenshots so Claude can understand specific UI elements to modify.

**Two performance-boosting modes:**

| Mode | How to trigger | Best for |
|---|---|---|
| Plan Mode | Shift + Tab twice | Multi-step tasks requiring wide codebase understanding (breadth) |
| Thinking Mode | Phrases like "Ultra think" | Tricky logic or debugging specific issues (depth) |

Both modes consume additional tokens (higher cost). They can be combined for very complex tasks.

**Git integration:** Claude Code can stage and commit changes and write descriptive commit messages.

**Recommended workflow:**
Screenshot the problem → paste with Control-V → describe the change → optionally enable Plan/Thinking mode → review and accept.

---

## 5. Controlling Context

| Action | How | When to use |
|---|---|---|
| **Escape** | Press once | Stop Claude mid-response to redirect it |
| **Escape + Memory** | Stop, then use `#` shortcut | Prevent Claude from repeating the same mistake |
| **Double Escape** | Press twice | Rewind conversation — jump back to an earlier point, skip irrelevant back-and-forth |
| **Compact** | `/compact` command | Summarize conversation history while keeping Claude's learned knowledge about the task |
| **Clear** | `/clear` command | Full fresh start — wipe all conversation history |

**Key insight:** These tools maintain focus, reduce distracting context, preserve relevant knowledge, and are most useful in long conversations or when switching tasks.

---

## 6. Custom Commands

Custom commands are user-defined automation commands accessed via `/` in Claude Code.

**How they work:**
- Location: `.claude/commands/` folder in your project directory
- File naming: the filename becomes the command name (`audit.md` → `/audit`)
- Must restart Claude Code after creating a new command file

**Structure:**
- A markdown file containing the instructions Claude should follow
- Use `$arguments` as a placeholder to accept input at runtime

**Example use cases:**
- Automating dependency audits
- Generating tests for a file
- Running security vulnerability fixes

**Usage:** `/commandname optional-argument-string`

---

## 7. Extending Claude Code with MCP Servers

MCP servers are external tools that extend Claude Code's capabilities. They run locally or remotely.

**Installation:**
```
claude mcp add [name] [start-command]
```

**Permission management:**
- First use of any MCP tool requires manual approval
- Auto-approve by adding `"MCP__[servername]"` to the `allow` array in `settings.local.json`

**Popular example — Playwright MCP server:**
Gives Claude the ability to control a real browser. Claude can navigate pages, take screenshots, analyze styling, and update prompts based on visual feedback — all automatically.

**Key benefit:** MCP servers enable sophisticated multi-step workflows involving external systems, going far beyond code editing.

---

## 8. GitHub Integration

Claude Code has an official integration that runs inside GitHub Actions.

**Setup:**
1. Run `/install GitHub app` in Claude Code
2. Install the Claude Code app on GitHub
3. Add your API key
4. Two GitHub Actions are auto-generated

**Default actions:**
1. **Mention support** — `@Claude` in any issue or PR to assign a task
2. **PR review** — automatic code review on every new pull request

**Customization:**
- Actions are customizable via `.github/workflows/` config files
- You can pass custom instructions directly to Claude
- MCP servers can be integrated (e.g. Playwright for browser testing)

**Permission requirements:**
- Every permission Claude needs must be listed explicitly
- MCP server tools each require individual permission listing — no shortcuts

**Example use case:**
Integrated Playwright so Claude could visit the running app in a browser, test functionality, create checklists, and verify issues automatically.

---

## 9. Hooks

Hooks are commands that run automatically before or after Claude executes a tool.

**Two types:**
| Type | When it runs | Can block? |
|---|---|---|
| Pre-tool use hook | Before the tool executes | Yes (exit code 2) |
| Post-tool use hook | After the tool executes | No |

**Configuration:** Added to the Claude settings file (global, project, or personal) via manual editing or the `/hooks` command.

**Hook structure:**
- A **matcher** — specifies which tools to target (e.g. `"read|grep"`)
- A **command** — the script to run

**How hooks receive data:**
Claude sends a JSON object to the hook script via stdin containing:
- `tool_name` — the name of the tool being called
- `input` parameters — e.g. the file path being read

**Exit codes:**
- `exit 0` — allow the tool call to proceed
- `exit 2` — block the tool call (pre-tool use hooks only)
- Anything written to `stderr` is sent back to Claude as feedback

---

## 10. Implementing a Hook (Practical Example)

**Goal:** Prevent Claude from reading `.env` files (which contain secrets).

**Config location:** `.claude/settings.local.json`

```json
{
  "hooks": {
    "preToolUse": [
      {
        "matcher": "read|grep",
        "command": "node ./hooks/read_hook.js"
      }
    ]
  }
}
```

**Hook script logic (read_hook.js):**
1. Read JSON from stdin
2. Check if `tool_input.path` includes `.env`
3. If yes: write an error message to `stderr` and `process.exit(2)`
4. If no: `process.exit(0)`

**Important:** Must restart Claude Code after any hook changes.

---

## 11. Useful Hooks (Real-World Patterns)

### Hook 1: TypeScript Type Checker
**Problem:** Claude edits function signatures but forgets to update call sites, causing type errors.

**Solution:** Post-tool-use hook that runs `tsc --no-emit` after any TypeScript file is edited.

**Process:** Detects type errors → feeds them back to Claude → Claude fixes call sites automatically.

**Adaptable to:** Any typed language with a type checker, or use test runners for untyped languages.

---

### Hook 2: Duplicate Code Prevention
**Problem:** Claude creates new queries or functions instead of reusing existing ones, especially during complex tasks.

**Solution:** Hook that monitors a specific directory (e.g. `queries/`) and launches a separate Claude instance to check for duplicates.

**Process:**
1. File is edited in the watched directory
2. A secondary Claude instance launches and compares new code to existing code
3. If a duplicate is found: exit code 2 + feedback sent to primary Claude
4. Primary Claude removes the duplicate and reuses existing code

**Trade-off:** Extra time and cost vs. a cleaner codebase.
**Recommendation:** Only watch critical directories to keep overhead low.

---

## 12. The Claude Code SDK

The Claude Code SDK is a programmatic interface for Claude Code, available as a CLI, TypeScript library, or Python library. It contains the same tools as the terminal version.

**Primary use case:** Integration into larger pipelines and workflows to add intelligence to existing processes.

**Key characteristics:**
- Default permissions = **read-only** (files, directories, grep)
- Write permissions must be manually enabled via `options.allowTools` or the settings file
- Output shows the raw message-by-message conversation between Claude Code and the language model — the final response is the last message

**Best suited for:** Helper commands, scripts, and hooks within existing projects — not standalone use.

**Example:** Add write permissions by specifying tools like `"edit"` in `options.allowTools` when making query calls.
