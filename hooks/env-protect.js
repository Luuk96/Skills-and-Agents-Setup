/**
 * Hook: env-protect.js
 *
 * Purpose: Prevent Claude from reading .env files, which contain secrets
 * like API keys, passwords, and tokens. These should NEVER be read by Claude.
 *
 * Type: Pre-tool use hook (runs BEFORE Claude reads a file)
 * Triggered by: read and grep tools
 *
 * How it works:
 * 1. Claude sends tool call details as JSON to this script via stdin
 * 2. This script checks if the file path contains ".env"
 * 3. If yes: exit with code 2 (blocks the read) and sends an error to Claude
 * 4. If no: exit with code 0 (allows the read to proceed)
 */

const readline = require('readline');

// Read the JSON data that Claude sends to this script
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

let inputData = '';

rl.on('line', (line) => {
  inputData += line;
});

rl.on('close', () => {
  try {
    // Parse the JSON object Claude sent us
    const toolCall = JSON.parse(inputData);

    // Get the file path from the tool call
    // Both "read" and "grep" tools use slightly different input shapes
    const filePath =
      toolCall.input?.path ||
      toolCall.input?.file_path ||
      toolCall.input?.pattern ||
      '';

    // Check if the path contains ".env" — this covers .env, .env.local, .env.production, etc.
    if (filePath.includes('.env')) {
      // Send a message to Claude explaining why this was blocked
      console.error(
        `BLOCKED: Reading "${filePath}" is not allowed. ` +
        `.env files contain secrets (API keys, passwords, tokens) that must never be read by Claude. ` +
        `If you need a value from .env, ask Luuk to provide it directly.`
      );
      // Exit code 2 = block this tool call
      process.exit(2);
    }

    // File is safe to read — allow it
    process.exit(0);

  } catch (error) {
    // If we can't parse the input, allow the tool call (fail open, not closed)
    // This prevents the hook from accidentally blocking legitimate work
    process.exit(0);
  }
});
