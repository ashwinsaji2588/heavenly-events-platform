# Occasion Desk Fast One-Command Deploy Script
param (
  [string]$Message = "Update Occasion Desk platform"
)

$ErrorActionPreference = "Stop"
Write-Host "🚀 Starting Deployment to Oracle Cloud VM..." -ForegroundColor Cyan

# 1. Commit and Push
$env:PATH += ";C:\Program Files\Git\cmd"
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "$Message"
    git push origin main
    Write-Host "✅ Pushed to GitHub repository (origin/main)" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Working tree clean, syncing latest commit to remote VM..." -ForegroundColor Yellow
}

# 2. Remote Build & Restart
$keyPath = "C:\Users\ashwi\.ssh\oracle_key"
$remoteCmd = @"
cd ~/heavenly-events-platform &&
git pull origin main &&
sudo docker compose build app &&
sudo docker stop heavenly-app 2>/dev/null || true &&
sudo docker compose up -d &&
(sudo docker exec occasion-app npx prisma db push --skip-generate || sudo docker exec heavenly-app npx prisma db push --skip-generate || true) &&
(sudo docker exec occasion-app node scripts/sanitize-db.mjs || sudo docker exec heavenly-app node scripts/sanitize-db.mjs || true) &&
echo '=== Live Health Check ===' &&
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001
"@

Write-Host "⏳ Triggering remote Docker build on Oracle VM (144.24.139.226)..." -ForegroundColor Cyan
ssh -i $keyPath -o StrictHostKeyChecking=no ubuntu@144.24.139.226 $remoteCmd

Write-Host "🎉 Application is LIVE at http://144.24.139.226:3001" -ForegroundColor Green
