#!/bin/bash

echo "=============================================="
echo "SAP Explorer: Kill, Rebuild, and Rehost (Mac)"
echo "=============================================="

# Change directory to the location of this script
cd "$(dirname "$0")"

echo ""
echo "[1/4] Killing existing processes on port 3000..."
# Find the PID listening on port 3000 and kill it
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

echo ""
echo "[2/4] Clearing previous build cache (.next)..."
if [ -d ".next" ]; then
    rm -rf .next
fi

echo ""
echo "[3/4] Rebuilding Next.js application..."
# Check if dependencies need installing first (optional but good practice)
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run prisma generate
npx prisma generate

# Build the application
npm run build

echo ""
echo "[4/4] Starting the production server..."
echo "The app will be available at http://localhost:3000"
echo "Close this terminal window to stop the server."
echo ""
npm run start
