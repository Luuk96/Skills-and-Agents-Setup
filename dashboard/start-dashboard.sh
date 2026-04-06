#!/bin/bash

# ============================================================
# START DASHBOARD
# Run this script to start the Agent Dashboard.
# It starts the backend and frontend together, then opens
# the browser automatically at localhost:5173.
# ============================================================

# Find the folder where this script lives, no matter where you run it from
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "Starting Agent Dashboard..."
echo "Location: $SCRIPT_DIR"
echo ""

# Move into the dashboard folder
cd "$SCRIPT_DIR"

# Check that node_modules is installed — if not, run npm install first
if [ ! -d "node_modules" ]; then
  echo "First run detected — installing packages (this only happens once)..."
  npm install
  echo ""
fi

# Wait 3 seconds then open the browser (runs in the background so it doesn't block)
# The delay gives the frontend server time to start before the browser opens
(sleep 3 && open http://localhost:5173) &

# Start backend and frontend together
# This is the main process — it keeps running until you press Ctrl+C
npm run dev
