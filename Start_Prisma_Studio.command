#!/bin/bash
cd "$(dirname "$0")"
echo "=============================================="
echo "Starting Prisma Studio UI..."
echo "=============================================="
npx prisma studio --port 5555
