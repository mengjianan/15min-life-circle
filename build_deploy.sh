#!/bin/bash
set -e

echo "=== Step 1: Building frontend ==="
cd /c/Users/Administrator/15min-life-circle/frontend
npm run build

echo "=== Step 2: Rebuilding Docker ==="
cd /c/Users/Administrator/15min-life-circle
docker compose down
docker compose up -d --build

echo "=== Step 3: Waiting for containers ==="
sleep 15
docker compose logs --tail=20

echo "=== Step 4: Updating app directory ==="
rm -rf app/assets app/static app/index.html app/manifest.json app/favicon.ico app/logo*.png app/robots.txt
cp -r frontend/build/* app/

echo "=== Step 5: Git commit and push ==="
cd /c/Users/Administrator/15min-life-circle
git add -A
git commit -m "fix: fengshui center type conversion + route click highlight + water terrain greenery display"
git push gitee main

echo "=== Done! ==="
