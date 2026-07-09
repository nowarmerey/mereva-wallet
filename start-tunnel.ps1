# Exposes the local Docker app publicly via a Cloudflare quick tunnel.
#
#   powershell -ExecutionPolicy Bypass -File .\start-tunnel.ps1
#
# Quick tunnels get a random https://*.trycloudflare.com URL on every start,
# so this script also rewrites NEXTAUTH_URL / NEXT_PUBLIC_APP_URL in .env and
# recreates the app container to pick the new URL up. Keep this window's
# cloudflared process running (and the PC on) while you use the app remotely.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# 1) Make sure the stack is up
docker compose up -d | Out-Null

# 2) Stop any previous quick tunnel
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 3) Start the tunnel; the assigned URL is printed to its log
$log = Join-Path $env:TEMP "cloudflared-mywallet.log"
Remove-Item $log -Force -ErrorAction SilentlyContinue
Start-Process cloudflared -WindowStyle Hidden `
  -ArgumentList "tunnel", "--url", "http://localhost:3000", "--no-autoupdate", "--logfile", $log

# 4) Wait for the URL to appear
$url = $null
foreach ($i in 1..60) {
    Start-Sleep -Seconds 1
    if (Test-Path $log) {
        $m = Select-String -Path $log -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" -ErrorAction SilentlyContinue |
             Select-Object -First 1
        if ($m) { $url = $m.Matches[0].Value; break }
    }
}
if (-not $url) { throw "Tunnel did not come up within 60s - see $log" }

# 5) Point the app at the public URL and restart it
(Get-Content .env) `
    -replace "^NEXTAUTH_URL=.*", "NEXTAUTH_URL=$url" `
    -replace "^NEXT_PUBLIC_APP_URL=.*", "NEXT_PUBLIC_APP_URL=$url" |
    Set-Content .env -Encoding utf8
docker compose up -d app | Out-Null

Write-Host ""
Write-Host "  Public URL:  $url" -ForegroundColor Green
Write-Host "  Open it on your phone and use 'Add to Home Screen' to install the app."
Write-Host ""
