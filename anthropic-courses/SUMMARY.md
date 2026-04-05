# Course Summary — Key Information

Last updated after: Claude Code Fundamentals

---

## What we know so far

### How Claude actually works
- Claude is a text-in, text-out language model. It cannot take actions directly.
- **Tool use** is the system that bridges this gap: Claude requests an action in a formatted response, the assistant executes it, and sends the result back.
- Tool use quality is the single biggest factor in how effective a coding assistant is. Claude is best-in-class at this.

### Context is everything
- Too much irrelevant context hurts performance. Too little leaves Claude guessing.
- **CLAUDE.md** is the primary context file. It is automatically included in every request.
- Three levels: project (shared/committed), local (personal, not committed), machine (global).
- Use `@filename` to inject a specific file into a request.
- Use `#` to update CLAUDE.md with natural language during a session.
- Always include critical files (schemas, configs) in CLAUDE.md so Claude always has them.

### Controlling Claude during a session
- **Escape** — stop and redirect mid-response
- **Escape + `#`** — stop and teach Claude not to repeat a mistake
- **Double Escape** — rewind the conversation to an earlier point
- **`/compact`** — summarize the conversation but keep Claude's task knowledge
- **`/clear`** — full reset for a completely new task

### Performance modes
- **Plan Mode** (Shift+Tab twice) — breadth: multi-file, multi-step tasks
- **Thinking Mode** ("Ultra think") — depth: tricky logic, hard bugs
- Both cost more tokens. Can be combined.

### Custom Commands
- Stored in `.claude/commands/` as markdown files
- Filename = command name (`sprint.md` → `/sprint`)
- Use `$arguments` for runtime input
- Must restart Claude Code after adding a new command

### Hooks — automated quality control
- **Pre-tool use hooks** run before a tool executes. Can block with `exit 2`.
- **Post-tool use hooks** run after. Cannot block but can give feedback.
- Hook receives a JSON object via stdin: `tool_name` + `input` parameters.
- Stderr output is sent back to Claude as feedback.
- Most valuable patterns:
  - Block access to `.env` files (security)
  - Run type checker after file edits (catch broken call sites)
  - Run duplicate detection on critical directories (code quality)

### Extending capabilities
- **MCP Servers** add new tool sets (e.g. Playwright for browser control). Installed via `claude mcp add`.
- **GitHub Actions integration** lets Claude run on PR events, review code, and take action via `@Claude` mentions.
- **Claude Code SDK** (CLI/TypeScript/Python) lets you integrate Claude into pipelines programmatically. Read-only by default; write permissions must be explicitly enabled.

---

## Courses completed
1. Claude Code Fundamentals — 12 topics covering tool use, context, custom commands, hooks, MCP, GitHub integration, and the SDK
